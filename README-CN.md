# Binance Watcher - VS Code 插件

在 VS Code 状态栏上实时显示币安交易对价格和变化信息

简体中文 | [English](./README.md)

## 做这个的理由
 在插件市场找了一圈没找到好的跟币安有关的插件，我想各位想必都赚钱了？没人开发类似的插件，所以只能直接动手做个插件了，几乎全程AI，所以代码写得有问题 就找Cursor吧，我不背锅。有需求可以提issue, 随缘更新。

## 功能

- 在 VS Code 状态栏实时显示币安加密货币交易对价格
- 支持自定义交易对列表和别名显示
- 显示价格、24小时价格变化百分比和成交量
- 根据币安交易对精度规则自动格式化价格和数量显示
  - 使用交易对的 tickSize 确定价格精度
  - 使用交易对的 stepSize 确定数量精度
- 价格变化正负值以不同颜色区分显示
- 可自定义显示/隐藏涨跌箭头和百分比
- 支持手动刷新数据
- 可以随时切换显示/隐藏状态栏信息

## 安装

1. 在 VS Code 扩展面板中搜索 "Binance Watcher"
2. 点击安装
3. 重启 VS Code

## 使用方法

安装后，插件会自动在 VS Code 状态栏右侧显示默认交易对（BTCUSDT 和 ETHUSDT）的实时价格信息。

### 配置选项

在 VS Code 设置中，可以自定义以下配置项：

- `binanceWatcher.symbolsConfigs`: 要监控的交易对列表及其别名，例如：
  ```json
  [
    {
      "symbol": "BTCUSDT",
      "alias": "BTC"
    },
    {
      "symbol": "ETHUSDT",
      "alias": "ETH"
    }
  ]
  ```
- `binanceWatcher.updateInterval`: 数据更新间隔（毫秒），默认为 2000
- `binanceWatcher.visible`: 是否在状态栏显示，默认为 true
- `binanceWatcher.showArrow`: 是否显示涨跌箭头，默认为 true
- `binanceWatcher.showPercentage`: 是否显示涨跌百分比，默认为 true

### 可用命令

在 VS Code 命令面板 (Ctrl+Shift+P / Cmd+Shift+P) 中可以使用以下命令：

- `Binance Watcher: 刷新数据` - 手动刷新交易对数据
- `Binance Watcher: 切换显示/隐藏` - 切换状态栏信息的显示状态

## 交易对别名配置示例

可以为交易对设置更直观的别名，方便在状态栏中显示：

```json
"binanceWatcher.symbolsConfigs": [
  {
    "symbol": "BTCUSDT",
    "alias": "比特币"
  },
  {
    "symbol": "ETHUSDT",
    "alias": "以太坊"
  },
  {
    "symbol": "BNBUSDT",
    "alias": "币安币"
  }
]
```

## 技术说明

- 使用币安官方 WebSocket API 获取实时交易数据
- 通过交易所信息 API 获取并应用正确的交易对精度规则
- 不需要 API 密钥，使用的是公开数据接口
- 使用 TypeScript 开发，良好的类型支持

## 祝各位大哥大佬赚大钱
 - 如果该插件对你有用 可以给点成本 我再去梭哈，赚了还你哈哈。
<div style="display: flex; justify-content: space-between;">
  <img src="./static/IMG_8692.JPG" width="48%" alt="支付宝打赏" />
  <img src="./static/IMG_8693.JPG" width="48%" alt="微信打赏" />
</div>

## License

MIT