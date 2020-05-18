import axios from "axios";
import { QuoteRequest, QuoteResponse, Token } from "./types";

const PARASWAP_BASE_URL = "https://paraswap.io/api/v1";

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

function normalizeResponse({
  sourceToken,
  destinationToken,
  sourceAmount,
  destinationAmount
}) {
  const fixEth = address =>
    address === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      ? "0x0000000000000000000000000000000000000000"
      : address;

  return {
    sourceAmount,
    destinationAmount,
    sourceToken: fixEth(sourceToken),
    destinationToken: fixEth(destinationToken)
  };
}

class Paraswap {
  tokensReady: Promise<Token[]>;
  network: number;
  constructor(network: number) {
    this.network = network;
    this.tokensReady = this.fetchTokens();
  }
  async fetchTokens(): Promise<Token[]> {
    const tokensResponse: { tokens: Token[] } = await axios
      .get(`${PARASWAP_BASE_URL}/tokens/${this.network}`)
      .then(resp => resp.data);

    return tokensResponse.tokens;
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
    try {
      const paraswapPrices = await this._fetchParaswapPrices({
        sourceToken,
        destinationToken,
        sourceAmount
      });

      return normalizeResponse({
        sourceToken,
        destinationToken,
        sourceAmount,
        destinationAmount: paraswapPrices.priceRoute.amount
      });
    } catch (error) {
      return {
        ...normalizeResponse({
          sourceToken,
          destinationToken,
          sourceAmount,
          destinationAmount: "0"
        }),
        error
      };
    }
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
