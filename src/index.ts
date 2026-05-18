import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamSSE } from 'hono/streaming';
import { getHTML } from './html';
import { analyzeWithRetry, simplifyWithRetry } from './ai';
import {
  findCachedResult, saveAnalysis, getHistory, deleteAnalysis,
  getSetting, setSetting, deleteSetting, getAllSettings,
  type D1Database,
} from './db';

interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

app.get('/', c => {
  return c.html(getHTML());
});

async function getAIConfig(db: D1Database) {
  const [baseUrl, apiKey, model] = await Promise.all([
    getSetting(db, 'ai_base_url'),
    getSetting(db, 'ai_api_key'),
    getSetting(db, 'ai_model'),
  ]);
  if (!baseUrl || !apiKey || !model) {
    throw new Error('请先在设置中配置 AI API 信息');
  }
  const cleanUrl = baseUrl
    .replace(/\/+$/, '')
    .replace(/\/chat\/completions$/i, '');
  return { AI_BASE_URL: cleanUrl, AI_API_KEY: apiKey, AI_MODEL: model };
}

app.get('/api/settings', async c => {
  const settings = await getAllSettings(c.env.DB);
  return c.json({
    ai_base_url: settings.ai_base_url || '',
    ai_model: settings.ai_model || '',
    has_api_key: !!settings.ai_api_key,
  });
});

app.post('/api/settings', async c => {
  const body = await c.req.json<{ ai_base_url?: string; ai_api_key?: string; ai_model?: string }>();

  if (body.ai_base_url !== undefined) {
    const url = body.ai_base_url.trim().replace(/\/+$/, '');
    if (!url) return c.json({ error: 'API 地址不能为空' }, 400);
    await setSetting(c.env.DB, 'ai_base_url', url);
  }
  if (body.ai_api_key !== undefined) {
    const key = body.ai_api_key.trim();
    if (!key) return c.json({ error: 'API Key 不能为空' }, 400);
    await setSetting(c.env.DB, 'ai_api_key', key);
  }
  if (body.ai_model !== undefined) {
    const model = body.ai_model.trim();
    if (!model) return c.json({ error: '模型名不能为空' }, 400);
    await setSetting(c.env.DB, 'ai_model', model);
  }

  return c.json({ success: true });
});

app.delete('/api/settings/:key', async c => {
  const key = c.req.param('key');
  if (!['ai_base_url', 'ai_api_key', 'ai_model'].includes(key)) {
    return c.json({ error: '无效的配置项' }, 400);
  }
  await deleteSetting(c.env.DB, key);
  return c.json({ success: true });
});

app.post('/api/settings/test', async c => {
  try {
    const config = await getAIConfig(c.env.DB);
    const url = `${config.AI_BASE_URL}/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: config.AI_MODEL,
        messages: [{ role: 'user', content: 'Say "ok" only.' }],
        max_tokens: 10,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return c.json({ success: false, error: `API 返回 ${res.status}: ${err}` });
    }
    return c.json({ success: true });
  } catch (err) {
    return c.json({ success: false, error: err instanceof Error ? err.message : '连接失败' });
  }
});

app.post('/api/analyze', async c => {
  const { sentence } = await c.req.json<{ sentence: string }>();

  if (!sentence || typeof sentence !== 'string') {
    return c.json({ error: '请输入英文句子' }, 400);
  }

  const trimmed = sentence.trim();
  if (trimmed.length === 0) {
    return c.json({ error: '请输入英文句子' }, 400);
  }
  if (trimmed.length > 2000) {
    return c.json({ error: '句子长度不能超过 2000 字符' }, 400);
  }

  let config: { AI_BASE_URL: string; AI_API_KEY: string; AI_MODEL: string };
  try {
    config = await getAIConfig(c.env.DB);
  } catch (err) {
    const message = err instanceof Error ? err.message : '配置读取失败';
    return c.json({ error: message }, 400);
  }

  const cached = await findCachedResult(c.env.DB, trimmed);
  if (cached) {
    return streamSSE(c, async s => {
      await s.writeSSE({ data: JSON.stringify({ type: 'result', data: JSON.parse(cached) }), event: 'message' });
      await s.writeSSE({ data: '[DONE]', event: 'message' });
    });
  }

  return streamSSE(c, async s => {
    try {
      const { stream: aiStream, resultPromise } = await analyzeWithRetry(trimmed, config);

      const reader = aiStream.getReader();
      const decoder = new TextDecoder();

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = typeof value === 'string' ? value : decoder.decode(value, { stream: true });
            if (text) {
              await s.writeSSE({ data: JSON.stringify({ type: 'token', content: text }), event: 'message' });
            }
          }
        } catch {
          // stream error, resultPromise will handle
        }
      };

      const sendResult = async () => {
        try {
          const result = await resultPromise;
          await s.writeSSE({ data: JSON.stringify({ type: 'result', data: result }), event: 'message' });
          await saveAnalysis(c.env.DB, trimmed, JSON.stringify(result));
        } catch (err) {
          const message = err instanceof Error ? err.message : '解析失败';
          await s.writeSSE({ data: JSON.stringify({ type: 'error', message }), event: 'message' });
        }
      };

      await Promise.all([processStream(), sendResult()]);
      await s.writeSSE({ data: '[DONE]', event: 'message' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI 服务暂时不可用';
      await s.writeSSE({ data: JSON.stringify({ type: 'error', message }), event: 'message' });
      await s.writeSSE({ data: '[DONE]', event: 'message' });
    }
  });
});

app.post('/api/simplify', async c => {
  const { sentence } = await c.req.json<{ sentence: string }>();
  if (!sentence || typeof sentence !== 'string' || !sentence.trim()) {
    return c.json({ error: '请输入英文句子' }, 400);
  }

  let config: { AI_BASE_URL: string; AI_API_KEY: string; AI_MODEL: string };
  try {
    config = await getAIConfig(c.env.DB);
  } catch (err) {
    return c.json({ error: err instanceof Error ? err.message : '配置读取失败' }, 400);
  }

  return streamSSE(c, async s => {
    try {
      const { stream: aiStream, resultPromise } = await simplifyWithRetry(sentence.trim(), config);
      const reader = aiStream.getReader();
      const decoder = new TextDecoder();

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = typeof value === 'string' ? value : decoder.decode(value, { stream: true });
            if (text) await s.writeSSE({ data: JSON.stringify({ type: 'token', content: text }), event: 'message' });
          }
        } catch {}
      };

      const sendResult = async () => {
        try {
          const result = await resultPromise;
          await s.writeSSE({ data: JSON.stringify({ type: 'result', data: result }), event: 'message' });
        } catch (err) {
          await s.writeSSE({ data: JSON.stringify({ type: 'error', message: err instanceof Error ? err.message : '解析失败' }), event: 'message' });
        }
      };

      await Promise.all([processStream(), sendResult()]);
      await s.writeSSE({ data: '[DONE]', event: 'message' });
    } catch (err) {
      await s.writeSSE({ data: JSON.stringify({ type: 'error', message: err instanceof Error ? err.message : 'AI 服务暂时不可用' }), event: 'message' });
      await s.writeSSE({ data: '[DONE]', event: 'message' });
    }
  });
});

app.get('/api/history', async c => {
  const items = await getHistory(c.env.DB, 50, 0);
  return c.json({ items });
});

app.get('/api/history/:id', async c => {
  const id = Number(c.req.param('id'));
  if (!id) return c.json({ error: '无效 ID' }, 400);

  const row = await c.env.DB.prepare(
    'SELECT id, sentence, result, created_at FROM analyses WHERE id = ?'
  ).bind(id).first();

  if (!row) return c.json({ error: '记录不存在' }, 404);
  return c.json(row);
});

app.delete('/api/history/:id', async c => {
  const id = Number(c.req.param('id'));
  if (!id) return c.json({ error: '无效 ID' }, 400);

  const deleted = await deleteAnalysis(c.env.DB, id);
  if (!deleted) return c.json({ error: '记录不存在' }, 404);
  return c.json({ success: true });
});

export default app;
