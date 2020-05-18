import axios from "axios";
import qs from "query-string";
import { QuoteRequest, QuoteResponse } from "./types";

const ZERO_EX_BASE_URL = "https://api.0x.org";

// fetchTokens types
interface Token {
  decimals: number;
  symbol: string;
  address: string;
}

interface TokenResponse {
  records: Token[];
}

// fetchQuote types
interface ZeroExQuote {
  price: string;
  guaranteedPrice: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
  protocolFee: string;
  buyTokenAddress: string;
  sellTokenAddress: string;
  buyAmount: string;
  sellAmount: string;
  sources: Array<{ name: string; proportion: string }>;
}

// function normalizeRequest({ sourceToken, destinationToken, sourceAmount }) {
//   const fixEth = address =>
//     address === "0x0000000000000000000000000000000000000000"
//       ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
//       : address;

//   return {
//     sourceAmount,
//     sourceToken: fixEth(sourceToken),
//     destinationToken: fixEth(destinationToken)
//   };
// }

class ZeroEx {
  tokensReady: Promise<Token[]>;
  constructor(network: number) {
    if (network !== 1) {
      throw new Error("only mainnet is supported");
    }
    this.tokensReady = this.fetchTokens();
  }
  async fetchTokens(): Promise<Token[]> {
    const tokenResponse: TokenResponse = await axios
      .get(`${ZERO_EX_BASE_URL}/swap/v0/tokens`)
      .then(resp => resp.data);
    return tokenResponse.records;
  }
  async fetchQuote(quoteRequest: QuoteRequest): Promise<QuoteResponse> {
    const { sourceToken, destinationToken, sourceAmount } = quoteRequest;

    try {
      const queryString = qs.stringify({
        sellToken: sourceToken,
        buyToken: destinationToken,
        sellAmount: sourceAmount
      });
      const quote: ZeroExQuote = await axios
        .get(`${ZERO_EX_BASE_URL}/swap/v0/quote?${queryString}`)
        .then(resp => resp.data);

      return {
        sourceToken,
        destinationToken,
        sourceAmount,
        destinationAmount: quote.buyAmount
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

export default ZeroEx;
