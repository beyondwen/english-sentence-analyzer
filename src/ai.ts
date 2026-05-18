export interface ClauseStructure {
  subject?: string;
  predicate?: string;
  object?: string;
  complement?: string;
}

export interface Clause {
  type: string;
  content: string;
  belongs_to?: string;
  function: string;
  structure?: ClauseStructure;
  clauses?: Clause[];
  modifiers?: {
    type: string;
    content: string;
    modifies: string;
  }[];
}

export interface AnalysisResult {
  original: string;
  word_annotations: {
    word: string;
    pos: string;
  }[];
  main_structure: {
    subject: string;
    predicate: string;
    object?: string;
    complement?: string;
  };
  clauses: Clause[];
  modifiers: {
    type: string;
    content: string;
    modifies: string;
  }[];
  translation: string;
  grammar_points: {
    point: string;
    explanation: string;
    example: string;
  }[];
  restructuring: {
    simple_version: string;
    explanation: string;
  };
}

const SYSTEM_PROMPT = `你是一位资深英语语法专家。你的任务是对英文长难句进行精确的递归结构化拆解分析。

## 核心原则：准确性第一

### 找主干的方法（严格遵守）

1. **先找谓语动词**：谓语是句子的核心，必须是限定动词（finite verb），即能体现时态、人称变化的动词。
2. **从谓语出发找主语**：问"谁/什么做了这个动作"，答案就是完整的主语。主语可能很长，包含从句。
3. **从谓语出发找宾语/表语**：问"动作的对象是什么"或"主语是什么/怎么样"。
4. **主语、宾语内部的从句属于主干的一部分**，不要把它们拆出去。

### 常见错误（严禁犯）

- ❌ 把定语从句当成谓语。例如 "The point when..." 中，when 从句修饰 point，不能把 when 从句拆成谓语。
- ❌ 把从句中的动词当成主句谓语。例如 "The fact that he left surprised me" 中，left 是从句动词，surprised 才是主句谓语。
- ❌ 只取名词中心词当主语，忽略其修饰成分。主语应该是从中心词到谓语动词之间的全部内容。
- ❌ 把介词短语、同位语、定语从句全部塞进宾语。宾语应该是动作的直接对象（名词/名词短语），后面的介词短语、同位语、定语从句等应单独列为修饰成分或从句。

### 宾语的边界（严格遵守）

宾语（object）是谓语动词的直接对象，通常是一个名词或名词短语。以下成分**不属于宾语**，应单独列出：
- **介词短语**：如 "attention on Q-Day" 中，"attention" 是宾语，"on Q-Day" 是介词短语修饰 attention
- **同位语**：逗号后的名词短语，解释前面的名词，应作为独立的同位语从句/短语
- **定语从句**：who/which/that/when 引导的从句，属于修饰成分
- **状语**：表示时间、地点、方式等的成分

正确示例：
"CNN has renewed attention on Q-Day, the unknown future point when..."
→ 宾语 = attention（仅此）
→ 介词短语（修饰 attention）= on Q-Day
→ 同位语（解释 Q-Day）= the unknown future point when quantum computers...

### 从句识别规则

- **定语从句**：紧跟在名词后面，由 who/which/that/when/where/whose/whom 引导，修饰前面的名词。它属于主语或宾语的一部分。
- **同位语从句**：由 that 引导，解释前面抽象名词（fact/idea/news/belief 等）的内容。它属于主语或宾语的一部分。
- **状语从句**：由 because/although/when/if/while/as 等引导，表示时间、原因、条件、让步等。它不是主干的一部分。
- **名词性从句**：由 what/that/whether/how/who 等引导，在句中充当主语、宾语或表语。如果它做主语，它就是主语。

### 递归拆解规则（关键）

对每个从句（clause），必须进一步拆解它自己的内部结构：

1. 识别从句内部的**主语、谓语、宾语/表语**
2. 如果从句内部还有嵌套从句或修饰成分，继续递归拆解
3. **直到拆不动为止**（最底层只有单词或短语，没有从句结构）

### ⚠️ 不要编造谓语（严禁）

只有当从句/短语**实际包含动词**时，才填写 structure。以下情况**不要填 structure**：
- **名词短语/同位语**：如 "the unknown future point when..." 是一个名词短语，没有谓语动词，structure 应为空对象 {}
- **介词短语**：如 "on Q-Day"、"in the morning"，没有主谓结构
- **分词短语作修饰语**：如 "including..."、"based on..."，如果只是修饰语，没有独立主谓结构

正确示例：
- "the unknown future point when quantum computers may become..." → 这是名词短语，structure = {}
- 但其中的定语从句 "when quantum computers may become strong enough..." → 有主谓结构，structure = { subject: "quantum computers", predicate: "may become", complement: "strong enough..." }
- "on Q-Day" → 介词短语，structure = {}

例如：从句 "when quantum computers may become strong enough to break common encryption systems"
→ 内部结构：主语=quantum computers, 谓语=may become, 表语=strong enough to break common encryption systems
→ 其中 "to break common encryption systems" 是不定式短语作程度状语，还可以继续拆：谓语=to break, 宾语=common encryption systems

### 分析步骤（按顺序执行）

1. 通读全句，识别所有动词
2. 确定哪个动词是主句谓语（排除从句中的动词）
3. 从主句谓语出发，向左找完整主语（包含所有修饰语和从句），向右找宾语（仅直接对象）
4. 宾语后面的介词短语、同位语、定语从句等，单独列为修饰成分或从句
5. 将主语内部的从句和修饰语分别标注
6. 对每个从句，递归执行步骤 1-5，分析其内部结构

## 输出格式

严格返回以下 JSON，不要包含任何其他文字。每个 clause 都必须有 structure 和子 clauses（如果没有嵌套则为空数组）。**名词短语/介词短语没有谓语动词时，structure 为空对象 {}**：

{
  "original": "原句",
  "word_annotations": [
    { "word": "CNN", "pos": "名词" },
    { "word": "has", "pos": "助动词" },
    { "word": "renewed", "pos": "动词" },
    { "word": "attention", "pos": "名词" },
    { "word": "on", "pos": "介词" },
    { "word": "Q-Day", "pos": "名词" },
    { "word": ",", "pos": "标点" },
    { "word": "the", "pos": "冠词" },
    { "word": "unknown", "pos": "形容词" },
    { "word": "future", "pos": "形容词" },
    { "word": "point", "pos": "名词" },
    { "word": "when", "pos": "关系副词" },
    { "word": "quantum", "pos": "形容词" },
    { "word": "computers", "pos": "名词" },
    { "word": "may", "pos": "情态动词" },
    { "word": "become", "pos": "动词" },
    { "word": "strong", "pos": "形容词" },
    { "word": "enough", "pos": "副词" },
    { "word": "to", "pos": "不定式标记" },
    { "word": "break", "pos": "动词" },
    { "word": "common", "pos": "形容词" },
    { "word": "encryption", "pos": "名词" },
    { "word": "systems", "pos": "名词" },
    { "word": ".", "pos": "标点" }
  ],
  "main_structure": {
    "subject": "完整的主语",
    "predicate": "谓语动词",
    "object": "完整的宾语（没有则省略此字段）",
    "complement": "补语（没有则省略此字段）"
  },
  "clauses": [
    {
      "type": "从句类型",
      "content": "从句原文",
      "belongs_to": "该从句属于哪个成分（主语/宾语/状语/同位语等）",
      "function": "该从句修饰什么、起什么作用",
      "structure": {
        "subject": "从句的主语",
        "predicate": "从句的谓语",
        "object": "从句的宾语（没有则省略）",
        "complement": "从句的补语（没有则省略）"
      },
      "clauses": [
        {
          "type": "嵌套从句类型",
          "content": "嵌套从句原文",
          "belongs_to": "属于哪个成分",
          "function": "作用",
          "structure": {
            "subject": "...",
            "predicate": "...",
            "object": "..."
          },
          "clauses": [],
          "modifiers": []
        }
      ],
      "modifiers": [
        {
          "type": "修饰语类型",
          "content": "修饰语原文",
          "modifies": "修饰的对象"
        }
      ]
    }
  ],
  "modifiers": [
    {
      "type": "修饰语类型",
      "content": "修饰语原文",
      "modifies": "修饰的对象"
    }
  ],
  "translation": "准确流畅的中文翻译",
  "grammar_points": [
    {
      "point": "语法要点名称",
      "explanation": "详细解释",
      "example": "一个简短的例句"
    }
  ],
  "restructuring": {
    "simple_version": "将原句改写为最简单的版本",
    "explanation": "解释简化过程中去掉了什么"
  }
}`;

const USER_PROMPT_TEMPLATE = `请对以下英文句子进行精确的递归结构化拆解分析。

要求：
1. 先找主句谓语动词，再从谓语出发找主语和宾语
2. 主语可能很长，包含定语从句、同位语从句等，这些都属于主语的一部分
3. 定语从句（when/which/who/that 引导）紧跟名词，属于该名词所在成分
4. **每个从句都必须拆解出自己的主语/谓语/宾语结构**
5. **从句内部如果还有从句，继续递归拆解，直到没有从句为止**
6. 介词短语、不定式短语、分词短语等如果内部包含从句，也要拆解
7. **word_annotations 必须逐词标注词性**，标点也要标注。词性用中文（名词/动词/形容词/副词/介词/连词/冠词/代词/情态动词/助动词/不定式标记/关系代词/关系副词/感叹词/标点/数词/分词/限定词）

句子：
"{sentence}"

严格按 JSON 格式返回。每个 clause 的 structure 和 clauses 字段都不能省略。word_annotations 必须覆盖原句中的每个单词和标点。`;

export async function streamAnalyze(
  sentence: string,
  env: { AI_BASE_URL: string; AI_API_KEY: string; AI_MODEL: string }
): Promise<ReadableStream<string>> {
  const baseUrl = env.AI_BASE_URL.replace(/\/+$/, '').replace(/\/chat\/completions$/i, '');
  const url = `${baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT_TEMPLATE.replace('{sentence}', sentence) },
      ],
      temperature: 0.1,
      max_tokens: 8192,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errText}`);
  }

  return parseSSEStream(response.body!);
}

function parseSSEStream(body: ReadableStream<Uint8Array>): ReadableStream<string> {
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream<string>({
    async start(controller) {
      const reader = body.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(content);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

export function parseAnalysisJSON(raw: string): AnalysisResult {
  let cleaned = raw.trim();

  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    cleaned = jsonMatch[1].trim();
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(cleaned);

  if (!parsed.original || !parsed.main_structure || !parsed.translation) {
    throw new Error('AI 返回的 JSON 缺少必要字段');
  }

  return parsed as AnalysisResult;
}

export async function analyzeWithRetry(
  sentence: string,
  env: { AI_BASE_URL: string; AI_API_KEY: string; AI_MODEL: string },
  maxRetries = 2
): Promise<{ stream: ReadableStream<string>; resultPromise: Promise<AnalysisResult> }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const stream = await streamAnalyze(sentence, env);

      const [clientStream, processingStream] = stream.tee();

      const resultPromise = collectAndParse(processingStream);

      return { stream: clientStream, resultPromise };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('AI 分析失败');
}

async function collectAndParse(stream: ReadableStream<string>): Promise<AnalysisResult> {
  const reader = stream.getReader();
  let fullText = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += value;
    }
  } finally {
    reader.releaseLock();
  }

  return parseAnalysisJSON(fullText);
}

const SIMPLIFY_PROMPT = `你是一位英语语法专家。给定一个英文句子和它的语法分析结果，你需要将句子中的每个词标注为 "main"（主干）或 "mod"（修饰/从句）。

规则：
- 主语、谓语、宾语/表语的核心词 → "main"
- 介词短语、定语从句、状语从句、同位语、插入语、分词短语、不定式短语作修饰 → "mod"
- 连接主干的必要功能词（如助动词 has/do/be）→ "main"
- 标点 → "punct"

严格返回以下 JSON：
{
  "segments": [
    { "text": "CNN", "role": "main" },
    { "text": " has renewed ", "role": "main" },
    { "text": "attention", "role": "main" },
    { "text": " on Q-Day, the unknown future point when...", "role": "mod" },
    { "text": ".", "role": "punct" }
  ]
}

segments 拼接后必须还原原句。不要遗漏任何字符。`;

export async function streamSimplify(
  sentence: string,
  env: { AI_BASE_URL: string; AI_API_KEY: string; AI_MODEL: string }
): Promise<ReadableStream<string>> {
  const baseUrl = env.AI_BASE_URL.replace(/\/+$/, '').replace(/\/chat\/completions$/i, '');
  const url = `${baseUrl}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: env.AI_MODEL,
      messages: [
        { role: 'system', content: SIMPLIFY_PROMPT },
        { role: 'user', content: '请标注以下句子的主干和修饰成分：\n\n"' + sentence + '"' },
      ],
      temperature: 0.1,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errText}`);
  }

  return parseSSEStream(response.body!);
}

export function parseSimplifyJSON(raw: string): { segments: { text: string; role: string }[] } {
  let cleaned = raw.trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) cleaned = jsonMatch[1].trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  const parsed = JSON.parse(cleaned);
  if (!parsed.segments || !Array.isArray(parsed.segments)) throw new Error('返回缺少 segments');
  return parsed;
}

export async function simplifyWithRetry(
  sentence: string,
  env: { AI_BASE_URL: string; AI_API_KEY: string; AI_MODEL: string },
  maxRetries = 2
): Promise<{ stream: ReadableStream<string>; resultPromise: Promise<{ segments: { text: string; role: string }[] }> }> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const stream = await streamSimplify(sentence, env);
      const [clientStream, processingStream] = stream.tee();
      const resultPromise = collectSimplify(processingStream);
      return { stream: clientStream, resultPromise };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastError || new Error('简化失败');
}

async function collectSimplify(stream: ReadableStream<string>): Promise<{ segments: { text: string; role: string }[] }> {
  const reader = stream.getReader();
  let fullText = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fullText += value;
    }
  } finally {
    reader.releaseLock();
  }
  return parseSimplifyJSON(fullText);
}
