import _ from "lodash";
import axios from "axios";
import { QuoteRequest, QuoteResponse, Token } from "./types";

const TOTLE_BASE_URL = "https://api.1inch.exchange/v1.1";

interface TokenResponse {
  [key: string]: Token;
}

// fetchQuote types

interface TotleQuoteRequest extends QuoteRequest {
  includeTransaction: boolean;
}

interface TotleTradeOrder {
  splitPercentage: string;
  sourceAsset: Token;
  sourceAmount: string;
  destinationAsset: Token;
  destinationAmount: string;
  rate: string;
  fee: {
    amount: string;
    percent: string;
    asset: Token;
  };
  exchange: {
    id: number;
    name: string;
  };
}

interface TotleTrade {
  sourceAsset: Token;
  sourceAmount: string;
  destinationAsset: Token;
  destinationAmount: string;
  rate: string;
  orders: Array<TotleTradeOrder>;
  runnerUpOrders: [];
}

interface TotleQuoteSummary {
  sourceAsset: {
    address: string;
    symbol: string;
    decimals: string;
  };
  sourceAmount: string;
  destinationAsset: {
    address: string;
    symbol: string;
    decimals: string;
  };
  destinationAmount: string;
  rate: string;
  path: Array<Token>;
  guaranteedRate: string;
  market: {
    rate: string;
    slippage: string;
  };
  trades: Array<TotleTrade>;
}

interface TotleQuote {
  success: boolean;
  response: {
    id: string;
    summary: Array<TotleQuoteSummary>;
    expiration: {
      blockNumber: number;
      estimatedTimestamp: number;
    };
  };
}

function buildTotleRequest({
  sourceToken,
  destinationToken,
  sourceAmount,
  includeTransaction
}) {
  return {
    swap: {
      sourceAsset: sourceToken,
      destinationAsset: destinationToken,
      sourceAmount: sourceAmount,
      maxMarketSlippagePercent: "10",
      maxExecutionSlippagePercent: "3"
    },
    config: {
      transactions: includeTransaction
    }
  };
}

class Totle {
  tokensReady: Promise<Token[]>;
  constructor(network: number) {
    if (network !== 1) {
      throw new Error("only mainnet is supported");
    }
    this.tokensReady = this.fetchTokens();
  }
  async fetchTokens(): Promise<Token[]> {
    const tokenResponse = await axios
      .get(`${TOTLE_BASE_URL}/tokens`)
      .then(resp => resp.data);

    return _.values(tokenResponse);
  }
  async _fetchTotleQuote({
    sourceToken,
    destinationToken,
    sourceAmount,
    includeTransaction
  }: TotleQuoteRequest): Promise<TotleQuote> {
    return await axios
      .post(
        "https://api.totle.com/swap",
        buildTotleRequest({
          sourceToken,
          destinationToken,
          sourceAmount,
          includeTransaction
        })
      )
      .then(resp => resp.data);
  }
  async fetchQuote({
    sourceToken,
    destinationToken,
    sourceAmount
  }: QuoteRequest): Promise<QuoteResponse> {
    try {
      const quote: TotleQuote = await this._fetchTotleQuote({
        sourceToken,
        destinationToken,
        sourceAmount,
        includeTransaction: false
      });

      return {
        sourceToken,
        destinationToken,
        sourceAmount,
        destinationAmount: quote.response.summary[0].destinationAmount
      };
    } catch (error) {
      return {
        sourceToken,
        destinationToken,
        sourceAmount,
        destinationAmount: "0",
        error
      };
    }
  }
}

export default Totle;
