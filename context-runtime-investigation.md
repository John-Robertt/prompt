# Context Runtime 技术调查方案

## 文档职责

本文定义一项技术调查：验证能否由运行时自动完成上下文的压缩、保存、检索与投影，使任务模型始终工作在有效上下文区间，并只关注用户目标和工程任务。

本文是调查与验证方案，不是最终实现规范。只有经过基准测试确认有效的机制，才应进入后续实现设计。

## 目标

构建并验证一个独立于任务模型的 Context Runtime，使任务模型看到的上下文始终由以下内容组成：

1. 当前用户目标、验收条件和约束。
2. 当前任务阶段需要的精确工作集。
3. 与当前步骤直接相关的历史事实和证据。
4. 为模型输出、推理和后续工具调用预留的安全空间。

上下文的归档、冷热分层、摘要、检索和预算控制由运行时负责，不成为任务模型的新任务。

## 成功标准

调查成功必须同时满足：

- 任务模型的系统提示词中没有上下文管理流程、压缩规则、消息引用或层级协议。
- 不向任务模型注册 `compress`、`decompress`、`search_context` 等上下文管理工具。
- 最新用户需求、验收条件和安全约束始终以原文保留。
- 活动工具调用及其结果保持协议完整，不拆散调用与结果。
- 完整原文可恢复，摘要和索引不是唯一事实来源。
- 上下文使用量稳定在经过实测确定的有效区间，而非逼近模型名义窗口。
- 与基线相比，任务成功率和约束保持率不下降。
- 输入 token、延迟或成本至少一项显著改善，且没有以更多返工和工具调用为代价。
- Context Runtime 失败时能够回退，不阻断 Pi 原生上下文处理和任务执行。

## 非目标

本次调查不以以下事项为目标：

- 让单个会话无限增长。
- 追求最高压缩率或最低 token 数。
- 让任务模型判断何时压缩、压缩哪些消息。
- 用摘要替代代码、测试结果、用户原始要求等权威事实。
- 在调查阶段替换或关闭 Pi 原生 compaction。

## 核心原则

### 1. 上下文管理是运行时责任

任务模型只负责理解、调查、决策和实现。运行时负责保存、压缩、检索和组装上下文。

### 2. 完整历史与模型视图分离

完整 session、工具输出和恢复信息保存在不可变归档中；每次模型调用只使用运行时生成的上下文投影。投影变化不得删除原始事实。

### 3. 摘要是索引，不是权威来源

每项压缩事实必须保留原始消息、工具输出或文件证据引用。代码、测试和用户原文始终优先于摘要。

### 4. 优先确定性缩减

测试、日志、Git、搜索、JSON 和源码等结构化内容，优先使用确定性解析器提取相关信息。只有无法可靠机械处理的内容才交给独立 sidecar 模型总结。

### 5. 保持任务模型的稳定提示词

上下文管理不能持续注入提醒、引用标签和状态协议。动态检索内容放在稳定缓存前缀之后，避免不必要地破坏 Provider prompt cache。

## 概念架构

```text
任务执行产生消息和工具结果
          │
          ├──► 原文归档 ───────────────► 冷数据与恢复来源
          │
          ├──► 确定性内容处理器 ───────► 结构化事实与精简结果
          │
          └──► 后台记忆构建器 ─────────► 任务状态、摘要和检索索引
                                           │
最新用户需求 + 当前工作状态 ───────────────┤
                                           ▼
                                  自动检索与相关性排序
                                           │
                                           ▼
                                   Context Projector
                                           │
                                           ▼
                                  预算内的模型工作集
```

## 上下文分层

### L0：权威原文归档

保存：

- 完整 Pi session JSONL。
- 未截断的工具输出或其可恢复路径。
- 原始用户消息。
- 与压缩状态关联的证据引用。

L0 不常驻模型上下文，只用于恢复、检索和验证摘要。

### L1：任务锚点

始终保留：

- 当前目标。
- 验收条件。
- 用户约束与偏好。
- 已确认的关键决策及理由。
- 当前阶段和未解决阻塞。

任务锚点必须小、稳定、结构化，并带原始证据引用。

### L2：热工作集

保留原文：

- 最近若干轮对话。
- 当前正在分析的代码片段。
- 当前错误、失败测试和相关日志。
- 尚未完成的工具调用与结果。
- 当前修改的文件和直接依赖。

热工作集根据活动状态而非单纯消息时间确定。

### L3：相关历史

运行时按当前任务自动选择：

- 已完成阶段的摘要。
- 相关历史决策。
- 精确错误字符串和 API 约定。
- 与当前文件、symbol 或问题相关的历史工具结果片段。

L3 每轮按需变化，但必须受独立 token 预算约束。

## 任务状态模型

建议调查以下最小结构：

```ts
interface TaskState {
  goal: string;
  acceptanceCriteria: string[];
  constraints: string[];
  currentPhase: string;
  completed: string[];
  inProgress: string[];
  decisions: Array<{
    decision: string;
    rationale: string;
    evidenceRefs: string[];
  }>;
  blockers: string[];
  activeFiles: string[];
  activeSymbols: string[];
  exactErrors: string[];
  nextActions: string[];
}
```

调查必须验证该结构能否稳定恢复任务，而不会把临时推断错误固化为长期事实。

## 工具结果处理

工具结果进入模型上下文前，先保存完整原文，再按内容类型生成精简视图。

| 内容类型 | 首选处理方式 | 必须保留 |
|---|---|---|
| 测试 | 解析失败用例、堆栈和统计 | 测试名、错误、文件与行号 |
| 构建 | 提取失败阶段和关键诊断 | 退出码、错误原文、目标名称 |
| 日志 | 去重、错误/警告分类、保留相关尾部 | 时间、级别、关键上下文 |
| Git | 状态、变更文件、相关 diff hunk | 路径、修改类型、精确 hunk |
| 搜索 | 命中路径、symbol 和局部上下文 | 查询、路径、匹配文本 |
| JSON | 结构投影和相关字段选择 | 字段路径、类型、精确值 |
| 源码 | symbol-aware excerpt | 路径、symbol、行范围 |

RTK 可继续负责其已支持的 Shell 命令精简。Context Runtime 重点处理非 RTK 输出和仍然过大的结果。

## 自动检索

运行时为每次模型调用构造检索查询：

```text
最新用户消息
+ 当前任务阶段
+ 上一轮模型的下一步意图
+ 活动文件与 symbol
+ 当前错误字符串
+ 未完成事项
```

候选内容按以下因素排序：

1. 精确路径、symbol、错误字符串和标识符匹配。
2. 与当前任务依赖链的关系。
3. 来源权威性。
4. 语义相关性。
5. 最近使用时间。
6. 去重与信息多样性。

检索结果以普通的相关背景事实加入模型上下文，不暴露 block、ref、压缩层级或检索操作。

## Sidecar 模型边界

如果确定性处理不足，可使用独立 sidecar 模型执行：

- 已完成阶段总结。
- 任务状态更新候选。
- 检索候选重排。
- 上下文充分性检查。

Sidecar 模型必须：

- 与任务模型使用隔离会话。
- 输出结构化结果和证据引用。
- 无权删除原文。
- 无权把无来源推断写成已确认事实。
- 失败时不阻断任务模型。

## 上下文预算与计费目标

不使用固定百分比作为最终甜点区，也不以物理 token 最少作为优化目标。Runtime 应最小化任务完成所需的实际成本：

```text
billableInputEquivalent =
  uncachedInput
  + cacheReadRate × cacheRead
  + cacheWriteRate × cacheWrite
```

输出、Sidecar、检索和返工成本单独计入总成本。不同 Provider 使用各自的费率系数：

| Provider 策略 | cacheReadRate | cacheWriteRate | 关键约束 |
|---|---:|---:|---|
| OpenAI GPT-5.6+ | 0.1 | 1.25 | 精确前缀；至少 1024 tokens；默认 30 分钟最低 TTL |
| Anthropic 5 分钟缓存 | 0.1 | 1.25 | 精确前缀；读取会刷新 TTL |
| Anthropic 1 小时缓存 | 0.1 | 2.0 | 更高写入成本，适合长间隔复用 |

费率系数相对于普通输入 token 价格。Runtime 必须从 Pi usage 中读取实际 `input`、`cacheRead`、`cacheWrite`，不能仅按上下文总长度估算费用。

每个模型仍需通过基准测试确定 `effectiveContextCap`：

```text
effectiveBudget = min(
  effectiveContextCap,
  contextWindow - outputReserve,
  nextPricingTierBoundary - tierSafetyMargin
)
```

定价分层边界必须作为硬约束。Pi 当前为 GPT-5.6 Sol 配置 272K 窗口，避免总输入超过 272K 后整次请求进入长上下文价格层；缓存读取 token 同样计入该阈值判断。

初始实验可采用以下空间比例，后续由任务质量和实际成本校准：

- 任务锚点：10%。
- 热工作集：50%–60%。
- 自动检索历史：20%–30%。
- 安全余量：10%–15%。

输出预留必须覆盖模型最大输出、推理开销和下一轮可能产生的工具结果。

## 当前缓存基线

当前 `openai-codex/gpt-5.6-sol` 会话最近 20 个有 usage 的 assistant 轮次显示：

- 普通输入：453,407 tokens。
- cache read：3,162,624 tokens。
- cache write：0 tokens（Codex 后端未在这些 usage 中报告写入）。
- cache read 占总输入约 87.46%。
- 两个冷请求分别产生约 167K 和 219K 普通输入，其后请求恢复为约 166K–218K cache read 加少量新增输入。

按 GPT-5.6 的 0.1 cache-read 系数折算，约 3.62M 物理输入相当于约 770K 普通输入计费单位，较全部未缓存减少约 78.7%。该换算用于架构比较；当前 Codex 订阅的实际扣费或额度规则仍以服务端为准。

基线说明：保持缓存前缀的价值可能高于立即删除一部分 token；少数冷请求会主导普通输入成本。

## 缓存感知的 Epoch 策略

Runtime 采用追加式 epoch，而不是每轮重新生成完整上下文投影：

```text
稳定系统提示词
稳定工具定义
稳定任务 checkpoint
epoch 内追加式历史
---------------- 缓存稳定前缀
本轮自动检索内容
最新工具结果
最新用户消息
```

规则如下：

1. epoch 内已有消息只追加、不删除、不重排、不改写。
2. 动态任务状态和检索内容放在尾部，不修改系统提示词或旧 checkpoint。
3. 检索内容采用 sticky residency：相关阶段未结束前保持原文和顺序稳定，避免每轮换入换出。
4. 工具定义在 epoch 内保持稳定；动态增加或删除工具视为潜在缓存重置。
5. 大型工具结果尽量在首次进入上下文前完成确定性精简，避免随后为删除它而重写整个前缀。
6. 只有计划性 checkpoint 才开启新 epoch，并接受一次缓存冷启动。

对当前 OpenAI Codex WebSocket 路径尤其重要：Pi 只有在新请求完整继承上一请求及响应、并仅追加新 input 时，才使用 connection-scoped `previous_response_id` 发送增量。任何历史裁剪、重排或内容替换都会退出 continuation，重新发送完整上下文。

## Cache Reset 决策模型

设：

- `P`：当前已缓存前缀长度。
- `S`：新 checkpoint 后前缀长度。
- `r`：cache read 相对费率。
- `w`：cache write 相对费率。
- `C`：生成 checkpoint、重建索引和冷启动的等价输入成本。
- `N`：预计新 epoch 还会发生的模型请求数。

保留旧缓存的前缀成本约为：

```text
keepCost(N) = N × r × P
```

重置后的前缀成本约为：

```text
resetCost(N) = w × S + (N - 1) × r × S + C
```

仅在以下条件成立时开启新 epoch：

```text
resetCost(N) < keepCost(N)
```

即：

```text
N > ((w - r) × S + C) / (r × (P - S))
```

GPT-5.6 使用 `r=0.1`、`w=1.25`。如果 checkpoint 只能把前缀压缩到原来的 50%，且不计摘要成本，通常需要约 12 次后续请求才能回本；若能压缩到 20%，约 3 次后续请求即可回本。Runtime 因此必须同时预测压缩率和剩余任务长度。

## 允许重置缓存的时机

优先选择缓存机会成本较低的自然边界：

- Provider 缓存预计已因空闲超过 TTL 而冷却。
- 切换模型、Provider、系统提示词或工具集合。
- 一个任务阶段完成，且预计仍有足够多后续轮次。
- 当前上下文接近有效上限或下一定价层边界。
- 大量低价值内容可获得足够高的压缩率。
- 原生 compaction 即将触发，主动 checkpoint 能提供更可控的结果。

以下情况不应仅为了减少物理 token 而重置：

- 当前前缀仍有高 cache-read 命中率。
- 任务预计数轮内结束。
- 可删除内容很少，压缩率不足以覆盖写入成本。
- 新 checkpoint 会改变工具定义、用户约束或活动工作集的精确内容。

## Provider 缓存边界

### OpenAI GPT-5.6+

- 只复用完全一致的 prompt prefix。
- `prompt_cache_key` 改善相同前缀的路由和稳定匹配。
- 隐式模式会在最新 user/tool message 放置 breakpoint；动态后缀可能导致反复写入不同前缀。
- 直接 OpenAI Responses API 可使用显式 breakpoint，并用 `explicit` 模式禁止缓存动态后缀。
- Pi 当前 direct OpenAI 模型元数据支持显式缓存模式，但尚需在原型中验证如何安全标记稳定 checkpoint。

### OpenAI Codex

- Pi 使用稳定 session ID 作为 `prompt_cache_key`。
- WebSocket continuation 要求请求体除 input 外一致，且当前 input 以旧请求和响应为完整前缀。
- Runtime 应优先保持追加式 history；无法假设 Codex 后端接受 direct API 的显式 breakpoint 字段。

### Anthropic

- 缓存顺序为 `tools → system → messages`，到显式 `cache_control` breakpoint 为止。
- 工具、系统提示词或前缀消息变化都会使后续缓存失效。
- 5 分钟写入为普通输入价 1.25 倍，1 小时写入为 2 倍，读取为 0.1 倍。
- Runtime 应根据会话间隔选择 TTL，不应默认用更昂贵的 1 小时写入。

## 缓存可观测性

每轮至少记录：

- `input`、`cacheRead`、`cacheWrite`、`output`。
- cache-read ratio。
- `billableInputEquivalent` 和总成本估计。
- 最长稳定前缀长度与第一个变化 token 的位置。
- 是否使用 WebSocket delta continuation。
- 本轮新增尾部、检索内容和工具结果 token。
- epoch ID、epoch 年龄和累计请求数。
- checkpoint 的压缩率、冷启动成本和实际回本轮次。
- Provider/model/tool schema/system prompt 是否变化。

调查不能只报告缓存命中率。高命中率可能来自保留大量无关前缀；最终指标必须是完成任务的实际总成本与质量。

外部规则依据：

- [OpenAI Prompt Caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- [Anthropic Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)

## Pi 接入点

### `tool_result`

- 归档完整结果。
- 生成确定性精简视图。
- 保持 `details`、错误状态和工具协议结构。
- 不处理短结果和仍在活动中的关键证据。

### `message_end` / `turn_end`

- 异步更新任务状态候选。
- 建立关键词、标识符和语义索引。
- 识别任务阶段是否完成。

### `before_agent_start`

- 根据最新用户消息、TaskState 和活动证据完成一次自动检索。
- 将本轮需要的相关历史作为一条持久化尾部消息加入 session，而不是临时改写旧消息。
- 不修改 system prompt、工具定义或既有 checkpoint。
- 同一用户轮次的后续 tool loop 不重复换入检索内容。

### `context`

- epoch 内默认只监测预算、缓存边界和消息完整性，不重排既有 messages。
- 只有 Cache Reset 决策通过时才生成新 checkpoint 投影并开启新 epoch。
- 记录第一个变化位置，验证投影是否破坏 Provider prefix 或 WebSocket continuation。
- 任何重写失败都返回原始 `event.messages`，由 Pi 原生路径继续执行。
### `session_start`

- 恢复 sidecar 状态和索引。
- 验证状态与 session JSONL 的一致性。
- 状态损坏时从原文重建或安全回退。

### `session_before_compact`

调查阶段不取消 Pi 原生 compaction。Context Runtime 应通过较低的工作预算避免触及上限，同时保留原生 compaction 作为溢出恢复路径。

### 用户可见接口

只提供用户命令，例如 `/context-status`，用于展示：

- 当前预算与分区占用。
- 本轮自动检索来源。
- 已归档内容和状态一致性。
- 压缩率、缓存命中和回退情况。

该接口不注册为模型工具，不占用任务模型提示词。

## 调查阶段

### 阶段 1：建立基线

选择一组可重复的真实工程任务，记录未启用 Context Runtime 时的：

- 任务成功率。
- 约束遗忘和返工次数。
- 输入、输出和缓存 token。
- 工具调用次数。
- 首次正确完成时间。
- compaction 次数。
- 上下文使用量分布。

交付物：基线数据集和可重复运行方法。

### 阶段 2：只实现确定性工具结果处理

实现原文归档和少量高价值处理器，不改变历史消息投影。

优先覆盖：

1. 测试输出。
2. 构建日志。
3. 搜索结果。
4. 大型 JSON。

验证精简结果是否保留修复问题所需的全部证据。

交付物：工具结果处理原型和保真度报告。

### 阶段 3：任务锚点与热工作集

实现 TaskState、活动文件/symbol 跟踪和工作集选择，但暂不启用语义检索。

验证：

- 用户目标和验收条件是否稳定保留。
- 已完成内容能否安全退出热区。
- 当前错误和活动代码是否不会被提前移除。

交付物：Context Projector 原型和状态一致性测试。

### 阶段 4：自动历史检索

加入标识符检索、关键词检索和可选语义重排。任务模型不获得检索工具。

验证：

- 历史约束和决策是否在需要时自动出现。
- 无关历史是否被控制在预算内。
- 检索失败是否会导致可观察的任务回归。

交付物：检索评估集、召回率和噪声报告。

### 阶段 5：缓存感知的 Epoch 验证

分别对 OpenAI Codex、direct OpenAI 和 Anthropic 执行可重复实验：

1. 记录纯追加会话的 cache read、普通输入和 continuation 基线。
2. 比较临时 `context` 投影与持久化尾部消息，确认哪种方式会破坏前缀。
3. 在相同任务点分别执行 50% 和 80% 压缩率的 checkpoint，测量冷启动与实际回本轮次。
4. 验证模型、工具 schema、system prompt 和 transport 变化造成的缓存失效。
5. 模拟短暂停顿和超过 Provider TTL 的长暂停，确认冷缓存时是否应优先 checkpoint。
6. direct OpenAI 比较 implicit 与 explicit breakpoint；Codex 比较 SSE 与 WebSocket continuation。
7. 验证接近定价层边界时，提前 checkpoint 是否降低整项任务成本。

交付物：按 Provider 区分的缓存状态机、Cache Reset 决策阈值、实际成本曲线和回本轮次报告。

### 阶段 6：端到端 A/B 验证

对相同任务比较：

- Pi 默认行为。
- 仅 RTK/确定性精简。
- 完整 Context Runtime。

只有完整方案在任务质量不下降的前提下改善资源使用，才进入正式实现。

## 核心指标

### 任务质量

- 任务完成率。
- 验收条件满足率。
- 用户约束遗忘次数。
- 错误根因重复调查次数。
- 因缺失历史导致的错误决策次数。

### 上下文质量

- 热工作集保留率。
- 自动检索召回率与精确率。
- 摘要事实错误率。
- 原文恢复成功率。
- 每轮无关 token 比例。

### 资源使用

- 普通输入、cache read、cache write 和输出 token。
- `billableInputEquivalent` 与按 Provider 费率计算的总成本。
- cache-read ratio、冷请求次数和冷请求成本占比。
- 稳定前缀长度、第一个变化 token 位置和前缀存活轮次。
- WebSocket delta continuation 使用率与回退完整请求次数。
- checkpoint 写入成本、压缩率、预计与实际回本轮次。
- 是否跨越长上下文定价层边界。
- Context Runtime 延迟。
- Sidecar 调用成本。
- session 和索引磁盘增长。
- 每轮投影构建时间随 session 长度的变化。

## 风险与证伪条件

出现以下任一情况，应暂停扩大实现并重新调查：

- 任务成功率或验收条件满足率明显下降。
- 模型因缺少历史信息重复调查或作出错误修改。
- Sidecar 生成的错误事实进入任务锚点。
- 上下文投影时间随 session 长度不可接受地增长。
- 动态投影破坏稳定前缀，使普通输入或 cache write 成本超过被删除内容的收益。
- cache-read ratio 很高，但大量无关缓存内容降低模型任务质量。
- Cache Reset 对剩余轮次或压缩率预测错误，checkpoint 未在任务结束前回本。
- Provider 不支持预期的 breakpoint、TTL 或 continuation 语义。
- 压缩节省被缓存冷启动、额外检索、返工或 Sidecar 成本抵消。
- Context Runtime 故障导致任务模型无法继续，而不是安全回退。

## 最小推荐路线

首先验证以下最小闭环：

```text
RTK 与确定性工具输出精简
+ 完整原文归档
+ 结构化任务锚点
+ 缓存感知的追加式 epoch
+ 持久化尾部自动检索
+ 基于实际成本的 checkpoint
+ Pi 原生 compaction 兜底
```

在该闭环通过真实任务验证前，不加入模型可见的上下文管理工具、消息引用标签、压缩提醒或分层管理协议。

## 最终决策条件

调查结束后，只回答一个问题：

> 在不降低任务质量、不增加任务模型注意力负担的前提下，Context Runtime 是否能稳定降低无关上下文和总执行成本？

答案为“是”时，再根据验证结果编写实现规范；答案为“否”时，保留已证明有效的局部能力，例如确定性工具输出精简和原文归档，不继续增加上下文管理复杂度。
