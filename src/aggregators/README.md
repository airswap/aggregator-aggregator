# Aggregator Aggregator Lib

## Usage
Usage of the aggregator lib is as follows. A new instance is created by passing in the network id to the constructor.
```javascript
import Aggregator from "./index";
const aggregator = new Aggregator(1);
```
Each aggregator has it's own class in this directory, and each aggregator fetches its own token metadata and returns it to the main aggregator class.
Once all token metadata has been loaded the  `aggregator.tokensReady` promise resolves and the library is ready to be interacted with.

There are two ways the lib can be used, to fetch quotes, and to fetch trades. 
- Quotes are just prices. They don't require a web3 instance, or a wallet address, and they can be used for price discovery for arbitrarily large amounts.
- Trades are executable. They require a web3 provider and slippage parameters to be set. 

This is the syntax for fetching quotes:
```javascript
aggregator.fetchQuotes({
          sourceAmount,
          sourceToken,
          destinationToken
        })
```

This is the syntax for fetching trades:
```javascript
aggregator.fetchTrades(
          {
            sourceAmount,
            sourceToken,
            destinationToken,
            userAddress,
            slippage
          },
          web3
        )
```

When a trade is fetched, the appropriate approvals are also checked for the `userAddress` address provided.
If approvals are missing, they are added as an `approvalNeeded` param to each individual trade returned.

To execute an approval transaction 
```javascript
const approvalTx = await trade.approvalNeeded({ gasPrice });
const approvalReceipt = await approvalTx.wait();
                  
```

To execute a trade transaction 
```javascript
const txObject = {
                    from: walletAddress,
                    to: trade.to,
                    value: trade.value,
                    data: trade.data,
                    gas,
                    gasPrice
                  };
web3.eth.sendTransaction(txObject);

```


