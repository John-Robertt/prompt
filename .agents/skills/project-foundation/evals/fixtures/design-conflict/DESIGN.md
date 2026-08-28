# 异步任务执行器设计

调用方提交任务后立即得到 `JobHandle`。Worker 在后台执行任务，调用方根据 handle 查询 `queued`、`running`、`succeeded` 或 `failed` 状态。

API Boundary 负责提交与查询，Queue 负责排队，Worker 负责执行。任务状态必须在进程重启后保留。当前版本不提供同步执行模式。
