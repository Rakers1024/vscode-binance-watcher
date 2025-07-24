import WebSocket from 'ws';
import * as vscode from 'vscode';
import { SymbolInfoService } from './symbolInfoService';

export interface TickerData {
  symbol: string;
  price: string;
  priceChangePercent: string;
  volume: string;
  formattedPrice: string;
  formattedVolume: string;
}

export class BinanceService {
  private ws: WebSocket | null = null;
  private tickerData: Map<string, TickerData> = new Map();
  private eventEmitter = new vscode.EventEmitter<void>();
  private symbolInfoService: SymbolInfoService;

  public readonly onDidChangeData = this.eventEmitter.event;

  constructor(symbolInfoService: SymbolInfoService) {
    this.symbolInfoService = symbolInfoService;
  }

  public async connect(symbols: string[]): Promise<void> {
    // 断开之前的连接
    this.disconnect();

    if (symbols.length === 0) {
      return;
    }

    // 确保加载了交易对信息
    await this.symbolInfoService.loadSymbolInfo();

    const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        if (this.ws) {
          this.ws.on('open', () => {
            console.log('Binance WebSocket connected');
            resolve();
          });

          this.ws.on('message', (data: WebSocket.Data) => {
            try {
              const json = JSON.parse(data.toString());
              if (json && json.data) {
                const ticker = json.data;
                const symbol = ticker.s; // 交易对符号
                
                // 使用精度信息格式化价格和成交量
                const price = ticker.c;
                const volume = ticker.v;
                const formattedPrice = this.symbolInfoService.formatPrice(symbol, price);
                const formattedVolume = this.symbolInfoService.formatQuantity(symbol, volume);
                
                this.tickerData.set(symbol, {
                  symbol,
                  price,
                  priceChangePercent: ticker.P,
                  volume,
                  formattedPrice,
                  formattedVolume
                });
                
                // 通知数据变化
                this.eventEmitter.fire();
              }
            } catch (error) {
              console.error('Failed to parse WebSocket message:', error);
            }
          });

          this.ws.on('error', (error: Error) => {
            console.error('Binance WebSocket error:', error);
            reject(error);
          });

          this.ws.on('close', () => {
            console.log('Binance WebSocket closed');
          });
        }
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.terminate();
      this.ws = null;
    }
  }

  public getTickerData(symbol: string): TickerData | undefined {
    return this.tickerData.get(symbol);
  }

  public getAllTickerData(): Map<string, TickerData> {
    return this.tickerData;
  }
} 