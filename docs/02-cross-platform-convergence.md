## 第二部分：跨平台趋同分析——推理模型提示词的共享深层结构

尽管 Anthropic、OpenAI 和 Google 在产品定位、API 设计和术语体系上存在显著差异，但对三大平台 2025—2026 年发布的全部提示词工程官方文档的系统性比较分析揭示了一个深刻的事实：**在推理模型时代，三大平台在提示词构建的核心原则上已经产生高度趋同**。表面的术语差异之下，存在着一套共享的深层结构。提取这一共享结构，正是构建统一理论的基础。

### 2.1 跨平台比较的方法论框架

本报告采用"趋同-分歧谱系"（Convergence-Divergence Spectrum）分析模型，沿以下六个轴对三大平台的推理模型提示词指南进行系统化比较：

1. **指令清晰度**（Instruction Clarity）：对指令精确性、歧义消除和正向表述的要求
2. **上下文管理**（Context Management）：长上下文排列、文档结构、参考资料整合
3. **输出控制**（Output Control）：格式规约、冗余度管理、结构化输出
4. **推理委托**（Reasoning Delegation）：推理深度参数、CoT 管理、自检机制
5. **工具与 Agent 集成**（Tool & Agent Integration）：工具描述工程、Agent 编排、状态管理
6. **参数调优**（Parameter Tuning）：温度、采样策略、推理 Token 预算

在每个轴上，分析首先进行**术语归一化**——将三大平台各自的专有术语映射到统一的概念空间：

| 统一概念 | Anthropic (Claude 4.6) | OpenAI (GPT-5.4) | Google (Gemini 3.1 Pro) |
| --- | --- | --- | --- |
| 结构化分区 | XML tags (`<instructions>`, `<context>`) | Markdown headings + XML tags | XML tags / Markdown headings |
| 推理深度控制 | effort parameter + adaptive thinking | reasoning_effort (5 levels) | thinking_level (3 levels) |
| 输出冗余度控制 | "更简洁和自然的沟通风格" | verbosity parameter (low/medium/high) | "默认更简洁，需显式请求详细输出" |
| 行为框架设定 | system prompt role setting | developer message | system instruction |
| 示例驱动对齐 | `<example>` tags, 3-5 examples | structured outputs + few-shot | 一致格式的 few-shot |
| 长上下文策略 | "文档在上，查询在下" | reference text + context anchoring | "context-first + 尾部锚定" |
| 工具触发控制 | "回调激进语言，工具现在会适当触发" | tool_search + allowed_tools | — |
| Agent 持久性 | multi-window workflows + memory tool | Responses API + previous_response_id | planning templates |
| 过度工程化警告 | "overengineering prevention" | "initiative nudge before raising effort" | "may over-analyze complex techniques" |

### 2.2 六大普遍趋同原则

通过对三大平台推理模型指南的逐条提取与交叉比对，本报告识别出以下六项所有平台均明确认同的核心原则。这些原则构成了推理模型时代提示词工程的"公理层"。

#### 原则一：正向表述优先（Positive Framing Priority）

三大平台不约而同地将"告诉模型应该做什么，而非不应该做什么"列为首要推荐策略。

- **Anthropic**："告诉 Claude 应该做什么，而不是不应该做什么。用'你的回复应由流畅的散文段落组成'替代'不要在回复中使用 Markdown'" 。
- **OpenAI**："设计不当的提示词中包含矛盾或模糊的指令会造成更大伤害，因为模型会将推理 Token 浪费在试图调和矛盾上" 。
- **Google**："提供'不要推断'或'不要猜测'等开放式系统指令可能导致模型过度聚焦于该指令。应明确告诉模型基于提供的信息进行推演，并避免使用外部知识" 。

这一趋同并非巧合，而是第一部分所揭示的底层认知机制（潜在语义激活陷阱、NTAS 注意力流失）在工程实践中的自然映射。三大平台独立得出了相同的结论，进一步验证了这一原则的普适性。

#### 原则二：具体性缩放（Specificity Scaling）

三大平台均认识到，指令的具体程度应当根据任务类型和模型推理能力进行动态校准。

- **Anthropic**：区分了需要"above and beyond"行为的创造性任务（需显式请求）与精确执行任务（需具体约束），并建议"把 Claude 想象成一位才华横溢但缺乏背景的新员工" 。
- **OpenAI**：建立了清晰的双模型心智模型——"推理模型像资深同事（给目标就行），GPT 模型像初级同事（需要详细指令）"。对推理模型，"给出任务、约束和期望的输出格式，不要规定每一个中间步骤" 。
- **Google**：推荐先尝试零样本（zero-shot），仅在模型表现不足时引入少样本示例，并指出"推理模型不需要像旧模型那样复杂的提示词工程技术" 。

#### 原则三：示例驱动对齐（Example-Driven Alignment）

尽管具体实现方式有所不同，三大平台均将高质量的示例（few-shot examples）视为最可靠的行为对齐手段之一。

- **Anthropic**：推荐 3-5 个示例，要求"相关、多样、结构化"，建议使用 `<example>` 标签包裹，甚至指出"如果示例足够清晰，可以从提示词中移除指令" 。
- **OpenAI**：推荐在 structured outputs 机制的配合下使用 few-shot，但对推理模型特别指出"先尝试零样本，推理模型通常不需要 few-shot 即可产出好结果" 。
- **Google**：强调 few-shot 示例的格式一致性——"确保 few-shot 示例的结构和格式完全相同，以避免输出格式不受控"，并警告"过多示例可能导致模型过拟合" 。

#### 原则四：结构化分区（Structural Partitioning）

三大平台均推荐使用明确的标记语言（XML 或 Markdown）对提示词进行物理分区，以帮助模型建立信息的层次结构。

- **Anthropic**：最强调 XML 标签体系，推荐使用 `<instructions>`、`<context>`、`<input>`、`<documents>` 等描述性标签，并支持嵌套层级结构 。
- **OpenAI**：推荐"以 Markdown 标题开始，用于主要节和子节（包括更深的层级，到 H4+）。使用内联反引号或反引号块精确包裹代码。XML 也表现良好，便于精确包裹节的开头和结尾" 。
- **Google**：同时支持 XML 和 Markdown 两种结构，并提供了具体的模板示例（如 `<role>`、`<constraints>`、`<context>`、`<task>` 标签体系和 `# Identity`、`# Constraints`、`# Output format` 的 Markdown 结构） 。

三大平台对结构化分区的共识达成了罕见的一致——它们甚至推荐了几乎相同的标签命名约定。唯一的分歧在于优先级：Anthropic 明确偏好 XML，而 OpenAI 和 Google 对 XML 与 Markdown 持中立态度。

#### 原则五：长上下文排序（Long-Context Ordering）

在处理大规模文档时，三大平台均收敛到了相同的物理排列策略：静态参考内容前置，动态查询后置。

- **Anthropic**："将长文档和输入放置在提示词的最上方……末尾的查询可将响应质量提升高达 30%" 。
- **OpenAI**：推荐"提供参考文本"策略，将外部数据包含在上下文中 。GPT-5.4 的 1M Token 上下文窗口使这一策略能够应用于整个代码库级别的分析。
- **Google**："先提供所有上下文"，然后"在提示词的最末尾放置具体的指令或问题"，并使用"基于上述信息……"等锚定短语 。

这一趋同直接对应了第 1.3 节揭示的 U 型注意力衰减机制——三大平台独立发现了相同的最优排列策略。

#### 原则六：推理深度的参数化控制（Parameterized Reasoning Control）

这是推理模型时代最具标志性的趋同——三大平台同时引入了API 参数级别的推理深度控制机制，将"模型想多深"的决策从提示词文本层面提升到了 API 参数层面。

| 平台 | 参数名称 | 级别 | 默认值 | 核心指引 |
| --- | --- | --- | --- | --- |
| OpenAI | `reasoning_effort` | none / low / medium / high / xhigh | none | "大多数团队应从 none、low 或 medium 开始" |
| Anthropic | `effort` (adaptive thinking) | low / medium / high / max | 自适应 | "自适应思考优于手动 budget_tokens" |
| Google | `thinking_level` | LOW / MEDIUM / HIGH | HIGH | "对于低延迟，设为 LOW 并使用'think silently'指令" |

这一趋同意味着一个根本性的策略转变：**在推理模型时代，控制推理深度的主要手段不再是提示词中的文本指令（如"让我们一步步思考"），而是 API 参数**。提示词的角色从"诱导推理"退化为"定义目标和约束"，将推理过程本身交还给模型的内置能力。

### 2.3 平台特异性分歧及其架构含义

在六大趋同原则之下，三大平台仍然存在若干具有架构含义的分歧。理解这些分歧对于编写跨平台适配的提示词至关重要。

**分歧一：默认推理行为**

三大平台对"默认应该投入多少推理"的假设截然不同：
- **GPT-5.4 默认 reasoning_effort=none**——假设大多数任务不需要推理，开发者按需提升。
- **Claude Opus 4.6 默认自适应**——模型自行判断是否需要思考以及思考多深。
- **Gemini 3.1 Pro 默认 thinking_level=HIGH**——假设用户期望深度推理。

这一分歧的实际影响是：同一个提示词在不同平台上可能触发完全不同深度的推理过程。跨平台提示词设计者必须显式设定推理参数，而非依赖平台默认值。

**分歧二：温度参数哲学**

- **Gemini 3.1 Pro 对 temperature=1.0 的硬约束**：Google 明确警告"改变温度（设为低于 1.0）可能导致意外行为、循环或性能退化，尤其在复杂数学或推理任务中" 。这是一个对推理模型独特的约束——Gemini 3 的推理能力针对默认温度进行了优化。
- **GPT-5.4 的温度限制**：仅在 reasoning_effort=none 时支持 temperature、top_p 和 logprobs 调节 。
- **Claude Opus 4.6**：通过 effort 参数替代温度参数对推理行为的控制。

**分歧三：Agent 架构原语**

三大平台在 Agent 系统的 API 设计上展现了不同的架构哲学：
- **GPT-5.4**：引入了 `phase` 字段（commentary / final_answer）区分中间推理和最终输出，以及 `tool_search` 实现工具延迟加载——这是面向大型工具生态的工程创新。
- **Claude Opus 4.6**：侧重于子 Agent 编排和上下文感知——模型能够追踪剩余上下文窗口并据此规划行为。
- **Gemini 3.1 Pro**：提供了 Search Grounding（搜索锚定）将模型连接到实时网络信息，以及 Code Execution（代码执行）工具。

**分歧矩阵**：

| 维度 | Anthropic (Claude 4.6) | OpenAI (GPT-5.4) | Google (Gemini 3.1 Pro) |
| --- | --- | --- | --- |
| 默认推理 | 自适应（自动校准） | none（需手动提升） | HIGH（默认深度推理） |
| 温度控制 | 标准 | 仅 none 模式支持 | 硬锁 1.0（不可调） |
| 结构偏好 | 强偏好 XML | XML/Markdown 中立 | XML/Markdown 中立 |
| prefill 支持 | 4.6 起弃用 | — | — |
| Agent 原语 | 子Agent编排 + context awareness | phase field + tool_search + compaction | Search Grounding + Code Execution |
| 冗余度控制 | 通过提示词指令 | verbosity API 参数 | 通过提示词指令 |
| 过度工程化倾向 | 高（需"overengineering prevention"指令） | 中（默认较克制） | 低（默认简洁） |

