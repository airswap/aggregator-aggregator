export interface QuoteRequest {
  sourceToken: string;
  destinationToken: string;
  sourceAmount: string;
}

export interface QuoteResponse {
  sourceToken: string;
  destinationToken: string;
  sourceAmount: string;
  destinationAmount: string;
  error?: string;
}

export interface Token {
  decimals: number;
  symbol: string;
  address: string;
}

export interface Aggregator {
  network?: number;
  fetchTokens: () => Promise<Token[]>;
  fetchQuote: (x: QuoteRequest) => Promise<QuoteResponse>;
}
