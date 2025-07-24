import * as vscode from 'vscode';

// 交易对信息接口
export interface SymbolInfo {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  // 价格精度相关
  tickSize: string;
  // 数量精度相关
  stepSize: string;
}

// 过滤器类型接口
interface PriceFilter {
  filterType: string;
  minPrice: string;
  maxPrice: string;
  tickSize: string;
}

interface LotSizeFilter {
  filterType: string;
  minQty: string;
  maxQty: string;
  stepSize: string;
}

// 交易所信息响应接口
interface ExchangeInfo {
  symbols: Array<{
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    filters: Array<PriceFilter | LotSizeFilter | any>;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export class SymbolInfoService {
  private symbolInfoMap: Map<string, SymbolInfo> = new Map();
  private isLoading: boolean = false;

  constructor() {}

  // 计算精度
  private getPrecision(stepSize: string): number {
    if (!stepSize || stepSize === '0') {
      return 0;
    }
    
    // 将科学计数法转换为普通字符串
    const normalizedStepSize = parseFloat(stepSize).toString();
    
    // 找到小数点位置
    const decimalIndex = normalizedStepSize.indexOf('.');
    if (decimalIndex === -1) {
      return 0;
    }
    
    // 找到非0的最后一位小数
    let precision = 0;
    for (let i = decimalIndex + 1; i < normalizedStepSize.length; i++) {
      precision++;
      if (normalizedStepSize[i] !== '0') {
        break;
      }
    }
    
    return precision;
  }

  // 使用PRICE_FILTER中的tickSize确定价格精度
  private parsePriceFilter(filter: PriceFilter): string {
    return filter.tickSize;
  }

  // 使用LOT_SIZE中的stepSize确定数量精度
  private parseLotSizeFilter(filter: LotSizeFilter): string {
    return filter.stepSize;
  }

  public async loadSymbolInfo(): Promise<void> {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    try {
      // 使用币安 REST API 获取交易对信息
      const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
      const data = await response.json() as ExchangeInfo;

      // 清除现有数据
      this.symbolInfoMap.clear();

      // 处理所有交易对信息
      if (data && data.symbols && Array.isArray(data.symbols)) {
        for (const symbolData of data.symbols) {
          let tickSize = "0.00000001"; // 默认值
          let stepSize = "0.00000001"; // 默认值
          
          // 查找价格过滤器
          const priceFilter = symbolData.filters.find(
            filter => filter.filterType === "PRICE_FILTER"
          ) as PriceFilter | undefined;
          
          if (priceFilter) {
            tickSize = this.parsePriceFilter(priceFilter);
          }
          
          // 查找数量过滤器
          const lotSizeFilter = symbolData.filters.find(
            filter => filter.filterType === "LOT_SIZE"
          ) as LotSizeFilter | undefined;
          
          if (lotSizeFilter) {
            stepSize = this.parseLotSizeFilter(lotSizeFilter);
          }
          
          this.symbolInfoMap.set(symbolData.symbol, {
            symbol: symbolData.symbol,
            baseAsset: symbolData.baseAsset,
            quoteAsset: symbolData.quoteAsset,
            tickSize,
            stepSize
          });
        }
      }

      console.log(`已加载 ${this.symbolInfoMap.size} 个交易对的信息`);
    } catch (error) {
      console.error('获取交易对信息失败:', error);
      vscode.window.showErrorMessage('获取币安交易对信息失败');
    } finally {
      this.isLoading = false;
    }
  }

  public getSymbolInfo(symbol: string): SymbolInfo | undefined {
    return this.symbolInfoMap.get(symbol);
  }

  // 根据tickSize格式化价格
  public formatPrice(symbol: string, price: string): string {
    const info = this.symbolInfoMap.get(symbol);
    if (!info) {
      return price; // 如果没有精度信息，返回原始价格
    }

    const numericPrice = parseFloat(price);
    const tickSize = parseFloat(info.tickSize);
    
    if (tickSize === 0) {
      return price;
    }
    
    // 计算精度 - 根据tickSize
    const precision = this.getPrecision(info.tickSize);
    return numericPrice.toFixed(precision);
  }

  // 根据stepSize格式化数量
  public formatQuantity(symbol: string, quantity: string): string {
    const info = this.symbolInfoMap.get(symbol);
    if (!info) {
      return quantity; // 如果没有精度信息，返回原始数量
    }

    const numericQuantity = parseFloat(quantity);
    const stepSize = parseFloat(info.stepSize);
    
    if (stepSize === 0) {
      return quantity;
    }
    
    // 计算精度 - 根据stepSize
    const precision = this.getPrecision(info.stepSize);
    return numericQuantity.toFixed(precision);
  }
} 