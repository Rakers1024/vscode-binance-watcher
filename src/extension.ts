// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { BinanceService, TickerData } from './binanceService';
import { SymbolInfoService } from './symbolInfoService';
import { SymbolAliasService, SymbolConfig } from './symbolAliasService';

export function activate(context: vscode.ExtensionContext) {
  console.log('Binance Watcher 扩展已激活');

  const symbolInfoService = new SymbolInfoService();
  const symbolAliasService = new SymbolAliasService();
  const binanceService = new BinanceService(symbolInfoService);
  const statusBarItems: Map<string, vscode.StatusBarItem> = new Map();
  
  // 从配置中获取设置
  function getConfiguration() {
    const config = vscode.workspace.getConfiguration('binanceWatcher');
    
    // 获取交易对列表
    const symbolsConfigs = config.get<SymbolConfig[]>('symbolsConfigs', []);
    const symbols: string[] = symbolsConfigs.map(item => item.symbol);
    
    return {
      symbols,
      updateInterval: config.get<number>('updateInterval', 2000),
      visible: config.get<boolean>('visible', true),
      showArrow: config.get<boolean>('showArrow', true),
      showPercentage: config.get<boolean>('showPercentage', true)
    };
  }

  // 创建状态栏项
  function createStatusBarItems(symbols: string[]) {
    // 清除现有的状态栏项
    for (const item of statusBarItems.values()) {
      item.dispose();
    }
    statusBarItems.clear();

    // 为每个交易对创建新的状态栏项
    symbols.forEach((symbol, index) => {
      const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100 - index);
      statusBarItems.set(symbol, item);
      
      if (getConfiguration().visible) {
        item.show();
      } else {
        item.hide();
      }
    });
  }

  // 更新状态栏显示
  function updateStatusBarItems() {
    const config = getConfiguration();
    
    binanceService.getAllTickerData().forEach((data: TickerData, symbol: string) => {
      const item = statusBarItems.get(symbol);
      if (item) {
        const percent = parseFloat(data.priceChangePercent);
        const icon = percent >= 0 ? '$(arrow-up)' : '$(arrow-down)';
        const color = percent >= 0 ? 'green' : 'red';
        
        // 获取别名
        const alias = symbolAliasService.getAlias(symbol);
        
        // 根据配置决定是否显示箭头和百分比
        let displayText = `${alias}: ${data.formattedPrice}`;
        
        if (config.showArrow) {
          displayText += ` ${icon}`;
        }
        
        if (config.showPercentage) {
          displayText += ` ${data.priceChangePercent}%`;
        }
        
        item.text = displayText;
        item.color = new vscode.ThemeColor(color);
        item.tooltip = `${symbol}\n价格: ${data.formattedPrice} USDT\n24小时变化: ${data.priceChangePercent}%\n成交量: ${data.formattedVolume}`;
        item.command = 'vscode-binance-watcher.refresh';
      }
    });
  }

  // 初始化连接
  async function initialize() {
    symbolAliasService.updateAliasesFromConfig();
    const config = getConfiguration();
    createStatusBarItems(config.symbols);
    
    try {
      // 先加载交易对信息
      await symbolInfoService.loadSymbolInfo();
      // 连接WebSocket
      await binanceService.connect(config.symbols);
    } catch (error) {
      vscode.window.showErrorMessage(`连接币安WebSocket失败: ${error}`);
    }
  }

  // 刷新数据
  const refreshCommand = vscode.commands.registerCommand('vscode-binance-watcher.refresh', async () => {
    symbolAliasService.updateAliasesFromConfig();
    const config = getConfiguration();
    createStatusBarItems(config.symbols);
    
    try {
      await binanceService.connect(config.symbols);
      vscode.window.showInformationMessage('币安数据已刷新');
    } catch (error) {
      vscode.window.showErrorMessage(`刷新数据失败: ${error}`);
    }
  });

  // 切换显示/隐藏
  const toggleVisibilityCommand = vscode.commands.registerCommand('vscode-binance-watcher.toggleVisibility', () => {
    const config = vscode.workspace.getConfiguration('binanceWatcher');
    const currentVisibility = config.get<boolean>('visible', true);
    
    // 更新配置
    config.update('visible', !currentVisibility, vscode.ConfigurationTarget.Global)
      .then(() => {
        // 更新状态栏项显示状态
        for (const item of statusBarItems.values()) {
          if (!currentVisibility) {
            item.show();
          } else {
            item.hide();
          }
        }
        
        vscode.window.showInformationMessage(`币安监视器已${!currentVisibility ? '显示' : '隐藏'}`);
      });
  });

  // 监听配置变化
  const configChangeListener = vscode.workspace.onDidChangeConfiguration(async (e) => {
    if (e.affectsConfiguration('binanceWatcher')) {
      await initialize();
    }
  });

  // 监听币安服务数据变化
  const dataChangeListener = binanceService.onDidChangeData(() => {
    updateStatusBarItems();
  });

  // 初始化
  initialize();

  // 注册清理函数
  context.subscriptions.push(
    refreshCommand,
    toggleVisibilityCommand,
    configChangeListener,
    dataChangeListener,
    {
      dispose: () => {
        binanceService.disconnect();
        for (const item of statusBarItems.values()) {
          item.dispose();
        }
      }
    }
  );
}

export function deactivate() {
  // 扩展停用时的清理工作
}
