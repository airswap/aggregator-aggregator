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
}

export interface Aggregator {
  network?: number;
  fetchQuote: (x: QuoteRequest) => Promise<QuoteResponse>;
}
