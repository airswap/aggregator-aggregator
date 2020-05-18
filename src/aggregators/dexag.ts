import axios from "axios";
import { QuoteRequest, QuoteResponse } from "./types";
import bn from "bignumber.js";

const DEXAG_BASE_URL = "https://api-v2.dex.ag";

// fetchTokens types
interface Token {
  decimals: number;
  symbol: string;
  address: string;
}
// fetchQuote types

interface DexagQuote {
  dex: string;
  price: string;
  pair: {
    base: string;
    quote: string;
  };
  liquidity: {
    [key: string]: number;
  };
}

class DexAg {
  tokensReady: Promise<Token[]>;
  constructor(network: number) {
    if (network !== 1) {
      throw new Error("only mainnet is supported");
    }
    this.tokensReady = this.fetchTokens();
  }
  fetchTokens(): Promise<Token[]> {
    return axios
      .get(`${DEXAG_BASE_URL}/token-list-full`)
      .then(resp =>
        resp.data.map(t => ({ ...t, address: t.address.toLowerCase() }))
      );
  }
  async fetchDexagQuote({
    sourceSymbol,
    destinationSymbol,
    sourceAmountFormatted
  }) {
    let query = `${DEXAG_BASE_URL}/price?from=${sourceSymbol}&to=${destinationSymbol}&fromAmount=${sourceAmountFormatted}&dex=ag`;

    const quote: DexagQuote = await axios.get(query).then(resp => resp.data);

    const destinationAmountFormatted =
      sourceAmountFormatted * Number(quote.price);
    return {
      sourceSymbol,
      destinationSymbol,
      sourceAmountFormatted,
      destinationAmountFormatted
    };
  }
  async getTokenSymbolFromAddress(tokenAddress) {
    const tokens = await this.tokensReady;
    const token = tokens.find(
      ({ address }) => address.toLowerCase() === tokenAddress.toLowerCase()
    );
    if (!token) {
      throw new Error(`Token ${tokenAddress} not supported`);
    }
    return token.symbol;
  }
  async getAtomicAmountFromDisplayAmount(amount, tokenAddress) {
    const tokens = await this.tokensReady;
    const { decimals } = tokens.find(
      ({ address }) => address.toLowerCase() === tokenAddress.toLowerCase()
    );
    return new bn(amount).times(10 ** decimals).toString();
  }
  async getDisplayAmountFromAtomicAmount(amount, tokenAddress) {
    const tokens = await this.tokensReady;
    const { decimals } = tokens.find(
      ({ address }) => address.toLowerCase() === tokenAddress.toLowerCase()
    );
    return amount / 10 ** decimals;
  }
  async fetchQuote(quoteRequest: QuoteRequest): Promise<QuoteResponse> {
    const { sourceToken, destinationToken, sourceAmount } = quoteRequest;

    const sourceSymbol = await this.getTokenSymbolFromAddress(sourceToken);
    const destinationSymbol = await this.getTokenSymbolFromAddress(
      destinationToken
    );
    const sourceAmountFormatted = await this.getDisplayAmountFromAtomicAmount(
      sourceAmount,
      sourceToken
    );
    const quote = await this.fetchDexagQuote({
      sourceSymbol,
      destinationSymbol,
      sourceAmountFormatted
    });
    const destinationAmount = await this.getAtomicAmountFromDisplayAmount(
      quote.destinationAmountFormatted,
      destinationToken
    );

    return {
      sourceToken,
      destinationToken,
      sourceAmount,
      destinationAmount
    };
  }
}

export default DexAg;
