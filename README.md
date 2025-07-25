# Binance Watcher - VS Code Extension

Real-time display of Binance trading pairs in VS Code status bar

[简体中文](./README-CN.md) | English

## Why I Made This

After searching through the VS Code marketplace, I couldn't find any good Binance-related extensions. So I decided to create one myself. The development was mostly AI-assisted, so if there are issues with the code, please contact me or create an issue. I'll update the extension when I have time.

## Features

- Real-time display of Binance cryptocurrency prices in VS Code status bar
- Customizable trading pairs list with aliases
- Display price, 24-hour price change percentage, and volume
- Automatic price and quantity formatting based on Binance trading pair precision rules
  - Using tickSize for price precision
  - Using stepSize for quantity precision
- Price changes indicated with different colors
- Customizable display options for arrows and percentages
- Manual data refresh support
- Toggle visibility in status bar
- Configurable status bar position

## Installation

1. Search for "Binance Watcher" in the VS Code extensions panel
2. Click Install
3. Restart VS Code

## How to Use

After installation, the extension will automatically display real-time price information for default trading pairs (BTCUSDT and ETHUSDT) on the right side of the VS Code status bar.

### Configuration Options

You can customize the following settings in VS Code:

- `binanceWatcher.symbolsConfigs`: List of trading pairs to monitor and their aliases, for example:
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
- `binanceWatcher.updateInterval`: Data update interval (milliseconds), default is 2000
- `binanceWatcher.visible`: Whether to display in the status bar, default is true
- `binanceWatcher.showArrow`: Whether to display up/down arrows, default is true
- `binanceWatcher.showPercentage`: Whether to display price change percentages, default is true
- `binanceWatcher.statusBarPosition`: Position in the status bar, options are:
  - `leftStart`: Left side of the status bar, far left position
  - `leftEnd`: Left side of the status bar, far right position (default)
  - `rightStart`: Right side of the status bar, far left position
  - `rightEnd`: Right side of the status bar, far right position

### Available Commands

In the VS Code command palette (Ctrl+Shift+P / Cmd+Shift+P), you can use the following commands:

- `Binance Watcher: Refresh Data` - Manually refresh trading pair data
- `Binance Watcher: Toggle Visibility` - Toggle the display of status bar information

## Trading Pair Alias Configuration Example

You can set more intuitive aliases for trading pairs to display in the status bar:

```json
"binanceWatcher.symbolsConfigs": [
  {
    "symbol": "BTCUSDT",
    "alias": "Bitcoin"
  },
  {
    "symbol": "ETHUSDT",
    "alias": "Ethereum"
  },
  {
    "symbol": "BNBUSDT",
    "alias": "BNB"
  }
]
```

## Technical Details

- Uses Binance official WebSocket API for real-time data
- Obtains and applies correct trading pair precision rules via Exchange Info API
- No API key required, uses public data interfaces
- Developed with TypeScript for good type support

## Support the Project

- If this extension is useful to you, consider supporting its development.

<div style="display: flex; justify-content: space-between;">
  <img src="./static/IMG_8692.JPG" width="48%" alt="BNB Smart Chain - USDT" />
  <img src="./static/IMG_8693.JPG" width="48%" alt="BNB Smart Chain - BNB" />
</div>

## License

MIT