const ethAddressByAggregator = {
  paraswap: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  oneInch: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  totle: "0x0000000000000000000000000000000000000000",
  dexag: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  zeroEx: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
};

function normalizeRequest(
  { sourceToken, destinationToken, sourceAmount },
  aggKey
) {
  const fixEth = address =>
    address === "0x0000000000000000000000000000000000000000"
      ? ethAddressByAggregator[aggKey]
      : address;

  return {
    sourceAmount,
    sourceToken: fixEth(sourceToken),
    destinationToken: fixEth(destinationToken)
  };
}

function normalizeResponse(
  { sourceToken, destinationToken, sourceAmount, destinationAmount },
  aggKey
) {
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

export { normalizeRequest, normalizeResponse };
