import _ from "lodash";
import axios from "axios";
import { QuoteRequest, QuoteResponse } from "./types";

const ONE_INCH_BASE_URL = "https://api.1inch.exchange/v1.1";

// fetchTokens types
interface Token {
  decimals: number;
  symbol: string;
  address: string;
}

interface TokenResponse {
  [key: string]: Token;
}

// fetchQuote types

interface OneInchQuote {
  fromToken: Token;
  toToken: Token;
  toTokenAmount: string;
  fromTokenAmount: string;
  exchanges: Array<{ name: string; part: number }>;
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

class OneInch {
  tokensReady: Promise<Token[]>;
  constructor(network: number) {
    if (network !== 1) {
      throw new Error("only mainnet is supported");
    }
    this.tokensReady = this.fetchTokens();
  }
  async fetchTokens(): Promise<Token[]> {
    const tokenResponse: TokenResponse = await axios
      .get(`${ONE_INCH_BASE_URL}/tokens`)
      .then(resp => resp.data);
    return _.values(tokenResponse);
  }
  async fetchQuote(quoteRequest: QuoteRequest): Promise<QuoteResponse> {
    const { sourceToken, destinationToken, sourceAmount } = normalizeRequest(
      quoteRequest
    );
    try {
      const quote: OneInchQuote = await axios
        .get(
          `${ONE_INCH_BASE_URL}/quote?fromTokenAddress=${sourceToken}&toTokenAddress=${destinationToken}&amount=${sourceAmount}&disableEstimate=false&slippage=1`
        )
        .then(resp => resp.data);

      return normalizeResponse({
        sourceToken,
        destinationToken,
        sourceAmount,
        destinationAmount: quote.toTokenAmount
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
}

export default OneInch;
