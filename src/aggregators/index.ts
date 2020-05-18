import _ from "lodash";
import Paraswap from "./paraswap";
import OneInch from "./oneInch";
import Totle from "./totle";
import Dexag from "./dexag";
import ZeroEx from "./ZeroEx";
import { QuoteRequest, QuoteResponse, Aggregator, Token } from "./types";
import { normalizeRequest, normalizeResponse } from "./utils";

interface AggregatedQuoteResponse extends QuoteResponse {
  fetchTime: number;
  aggregator: string;
}

const ETH = {
  symbol: "ETH",
  decimals: 18,
  address: "0x0000000000000000000000000000000000000000"
};

class AggregatorAggregator {
  network: number;
  aggregators: { [key: string]: Aggregator };
  tokensReady: Promise<Token[]>;
  constructor(network: number) {
    this.network = network;
    this.aggregators = {
      paraswap: new Paraswap(this.network),
      oneInch: new OneInch(this.network),
      totle: new Totle(this.network),
      dexag: new Dexag(this.network),
      zeroEx: new ZeroEx(this.network)
    };
    this.tokensReady = this.processTokensReadyPromises();
  }
  async processTokensReadyPromises(): Promise<Token[]> {
    const keys = Object.keys(this.aggregators);
    const tokensArray = await Promise.all(
      keys.map(async aggKey => {
        return this.aggregators[aggKey].fetchTokens();
      })
    );

    const tokensCleaned = tokensArray.map(tokens =>
      tokens.map(token => ({
        ...token,
        address: token.address.toLowerCase()
      }))
    );

    const tokenAddressesArray = tokensCleaned.map(tokens =>
      tokens.map(token => token.address)
    );

    const commonAddresses = _.union(...tokenAddressesArray);
    const commonTokens = commonAddresses.map(address => {
      return _.find(_.flatten(tokensCleaned), t => t.address === address);
    });

    return _.uniqBy(
      [ETH, ...commonTokens.filter(t => t.symbol !== "ETH")],
      "address"
    );
  }
  async validateRequestTokensForAgg({ sourceToken, destinationToken }, aggKey) {
    const tokens = await this.aggregators[aggKey].tokensReady;

    if (!_.find(tokens, { address: sourceToken })) {
      if (aggKey === "totle") {
        debugger;
      }
      throw new Error(`Source token not supported`);
    } else if (!_.find(tokens, { address: destinationToken })) {
      throw new Error(`Destination token not supported`);
    }
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
        let quote;
        try {
          const normalizedRequest = normalizeRequest(
            {
              sourceToken,
              destinationToken,
              sourceAmount
            },
            aggKey
          );
          await this.validateRequestTokensForAgg(normalizedRequest, aggKey);
          quote = normalizeResponse(
            await this.aggregators[aggKey].fetchQuote(normalizedRequest),
            aggKey
          );
        } catch (error) {
          quote = {
            sourceToken,
            destinationToken,
            sourceAmount,
            error
          };
        }

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
