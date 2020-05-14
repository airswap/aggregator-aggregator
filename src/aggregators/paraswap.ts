import axios from "axios";
import { QuoteRequest, QuoteResponse } from "./types";

const PARASWAP_BASE_URL = "https://paraswap.io/api/v1";

// fetchTokens types
interface Token {
  decimals: number;
  symbol: string;
  address: string;
}

interface TokenResponse {
  tokens: Token[];
}

// fetchPrices types

interface Route {
  exchange: string;
  percent: string;
  srcAmount: string;
  destAmount: string;
}

interface Other {
  exchange: string;
  rate: string;
  unit: string;
}

interface ParaswapPricesResponse {
  priceRoute: {
    amount: string;
    bestRoute: Route[];
    others: Other[];
  };
}

// buildTransaction types

interface TransactionRequest {
  priceRoute: {
    bestRoute: Route[];
  };
  srcToken: string;
  destToken: string;
  srcAmount: string;
  destAmount: string;
  userAddress: string;
  payTo?: string;
  referrer?: string;
}

function normalizeRequest({ sourceToken, destinationToken, sourceAmount }) {
  const fixEth = address =>
    address === "0x0000000000000000000000000000000000000000"
      ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      : address;

  return {
    sourceAmount,
    sourceToken: fixEth(sourceToken),
    destinationToken: fixEth(destinationToken)
  };
}

class Paraswap {
  network: number;
  constructor(network: number) {
    this.network = network;
  }
  fetchTokens(): Promise<TokenResponse> {
    return axios.get(`${PARASWAP_BASE_URL}/tokens/${this.network}`);
  }
  _fetchParaswapPrices({
    sourceToken,
    destinationToken,
    sourceAmount
  }: QuoteRequest): Promise<ParaswapPricesResponse> {
    return axios
      .get(
        `${PARASWAP_BASE_URL}/prices/${
          this.network
        }/${sourceToken}/${destinationToken}/${sourceAmount}`
      )
      .then(resp => resp.data);
  }
  async fetchQuote(quoteRequest: QuoteRequest): Promise<QuoteResponse> {
    const { sourceToken, destinationToken, sourceAmount } = normalizeRequest(
      quoteRequest
    );
    const paraswapPrices = await this._fetchParaswapPrices({
      sourceToken,
      destinationToken,
      sourceAmount
    });

    return {
      sourceToken,
      destinationToken,
      sourceAmount,
      destinationAmount: paraswapPrices.priceRoute.amount
    };
  }
  async buildTransaction({
    sourceToken,
    destinationToken,
    sourceAmount,
    userAddress
  }) {
    const bestPrice = await this._fetchParaswapPrices({
      sourceToken,
      destinationToken,
      sourceAmount
    });
    const transactionRequest: TransactionRequest = {
      priceRoute: {
        bestRoute: bestPrice.priceRoute.bestRoute
      },
      srcToken: sourceToken,
      destToken: destinationToken,
      srcAmount: sourceAmount,
      destAmount: bestPrice.priceRoute.amount,
      userAddress
    };
    return axios.post(
      `${PARASWAP_BASE_URL}/transactions/${this.network}`,
      transactionRequest
    );
  }
}

export default Paraswap;
