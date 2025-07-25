import * as vscode from 'vscode';

export interface SymbolConfig {
  symbol: string;
  alias?: string;
}

export class SymbolAliasService {
  private symbolToAlias: Map<string, string> = new Map();
  private aliasToSymbol: Map<string, string> = new Map();

  constructor() {
    this.updateAliasesFromConfig();
  }

  /**
   * 从配置中更新别名
   */
  public updateAliasesFromConfig(): void {
    const config = vscode.workspace.getConfiguration('binanceWatcher');
    
    // 清空现有映射
    this.symbolToAlias.clear();
    this.aliasToSymbol.clear();

    // 获取配置
    const symbolsConfigs = config.get<SymbolConfig[]>('symbolsConfigs', []);
    
    for (const item of symbolsConfigs) {
      const alias = item.alias || item.symbol;
      this.symbolToAlias.set(item.symbol, alias);
      this.aliasToSymbol.set(alias, item.symbol);
    }
  }

  /**
   * 获取交易对的别名
   * @param symbol 交易对
   * @returns 别名，如果没有则返回原交易对
   */
  public getAlias(symbol: string): string {
    return this.symbolToAlias.get(symbol) || symbol;
  }

  /**
   * 获取别名对应的交易对
   * @param alias 别名
   * @returns 对应的交易对，如果不存在则返回undefined
   */
  public getSymbol(alias: string): string | undefined {
    return this.aliasToSymbol.get(alias);
  }

  /**
   * 获取所有配置的交易对
   * @returns 所有配置的交易对数组
   */
  public getAllSymbols(): string[] {
    return Array.from(this.symbolToAlias.keys());
  }
} 