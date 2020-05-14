import Paraswap from "./paraswap";
import OneInch from "./oneInch";
import Totle from "./totle";
import { QuoteRequest, QuoteResponse, Aggregator } from "./types";

interface AggregatedQuoteResponse extends QuoteResponse {
  fetchTime: number;
  aggregator: string;
}

class AggregatorAggregator {
  network: number;
  aggregators: { [key: string]: Aggregator };
  constructor(network: number) {
    this.network = network;
    this.aggregators = {
      paraswap: new Paraswap(this.network),
      oneInch: new OneInch(this.network),
      totle: new Totle(this.network)
    };
  }
  async fetchQuotes({
    sourceToken,
    destinationToken,
    sourceAmount
  }: QuoteRequest): Promise<AggregatedQuoteResponse[]> {
    const keys = Object.keys(this.aggregators);
    return Promise.all(
      keys.map(async aggKey => {
        const startTime = Date.now();
        const quote = await this.aggregators[aggKey].fetchQuote({
          sourceToken,
          destinationToken,
          sourceAmount
        });
        return {
          ...quote,
          fetchTime: Date.now() - startTime,
          aggregator: aggKey
        };
      })
    );
  }
}

export default AggregatorAggregator;
