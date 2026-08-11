# Pi 工具套装初始化指南

初始化完成后应具备：

- Pi
- Hashline 文件读取、替换和撤销
- FFF 文件及文本搜索
- CodeGraph 代码理解
- Context7 技术文档查询
- MCP 网关和直接工具
- Web 搜索及内容获取
- 子代理
- RTK Bash 输出压缩
- ast-grep AST 结构搜索
- jq JSON 提取

## 1. 安装原始 Pi

如果 `pi` 已经可以运行，跳过本节。

```bash
npm install -g --ignore-scripts @earendil-works/pi-coding-agent
```

## 2. 安装外部 CLI

### ast-grep 和 CodeGraph

```bash
npm install -g --ignore-scripts \
  @ast-grep/cli \
  @colbymchenry/codegraph
```

### RTK

Linux/macOS 可使用官方安装器：

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

确认 `~/.local/bin` 位于 PATH；如未配置，将以下内容加入 shell profile：

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Pi 通过扩展接入 RTK，不需要执行面向其他 Agent 的 `rtk init`。

### jq

Debian/Ubuntu：

```bash
sudo apt-get update
sudo apt-get install -y jq
```

macOS：

```bash
brew install jq
```

### CLI 验证

```bash
rtk --version
ast-grep --version
codegraph --version
jq --version
```

## 3. 安装 Pi 扩展

```bash
pi install npm:pi-mcp-adapter
pi install npm:pi-hashline-edit-pro
pi install npm:@ff-labs/pi-fff
pi install npm:@tintinweb/pi-subagents@
pi install npm:pi-web-access
pi install npm:@bacnh85/pi-rtk
```

扩展职责：

| 包                        | 职责                                                    |
| ------------------------- | ------------------------------------------------------- |
| `pi-hashline-edit-pro`    | `read`、`replace`、`undo_last_replace`；禁用原生 `edit` |
| `@ff-labs/pi-fff`         | `fffind`、`ffgrep`                                      |
| `pi-mcp-adapter`          | MCP 连接、直接工具、`mcp`、`mcpScript`                  |
| `@tintinweb/pi-subagents` | `Agent`、`get_subagent_result`、`steer_subagent`        |
| `pi-web-access`           | `web_search`、`fetch_content`、`get_search_content`     |
| `@bacnh85/pi-rtk`         | 自动改写并压缩受支持的 Bash 命令                        |

## 4. 配置 pi-web-access

创建`~/.pi/agent/web-search.json`

```json
{
  "provider": "openai",
  "workflow": "none",
  "tools": {
    "webSearch": {
      "enabled": true
    },
    "sourceCheck": {
      "enabled": false
    },
    "fetchContent": {
      "enabled": true
    },
    "getSearchContent": {
      "enabled": true
    }
  },
  "commands": {
    "websearch": {
      "enabled": false
    },
    "curator": {
      "enabled": false
    },
    "search": {
      "enabled": false
    },
    "google-account": {
      "enabled": false
    }
  },
  "image": {
    "enabled": false
  },
  "githubClone": {
    "enabled": false
  },
  "youtube": {
    "enabled": false
  },
  "video": {
    "enabled": false
  },
  "pdf": {
    "enabled": false
  },
  "fetchRouting": {
    "providers": ["http"],
    "allowRemoteHostedProviders": false
  },
  "ssrf": {
    "allowRanges": ["198.18.0.0/15"],
    "trustEnvProxy": false
  }
}
```

## 4. 配置 MCP

创建 `~/.pi/agent/mcp.json`：

```json
{
  "mcpServers": {
    "codegraph": {
      "command": "codegraph",
      "args": ["serve", "--mcp"],
      "directTools": true,
      "toolPrefix": "none"
    },
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "directTools": true,
      "toolPrefix": "none"
    }
  }
}
```

## 5. 为代码仓库初始化 CodeGraph

CodeGraph 的 CLI 和 MCP 服务是全局的，但索引是每个仓库独立的。进入目标仓库后执行：

```bash
codegraph init .
codegraph status .
```

已有 `.codegraph/` 时可使用：

```bash
codegraph sync .
```

没有索引时，其它工具仍可用，但 `codegraph_explore` 无法提供该仓库的完整符号关系。

## 6. Reload 与验收

启动或返回 Pi 后执行：

```text
/reload
/rtk status
/mcp
/mcp tools
```

终端验收：

```bash
pi --version
pi list
pi --list-models
rtk --version
rtk gain
ast-grep --version
codegraph --version
jq --version
```

`pi list` 应包含：

```text
npm:pi-mcp-adapter
npm:pi-hashline-edit-pro
npm:@ff-labs/pi-fff
npm:@tintinweb/pi-subagents
npm:pi-web-access
npm:@bacnh85/pi-rtk
```
