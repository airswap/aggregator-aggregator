import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import ReactDOM from "react-dom";
import {
  Grommet,
  Box,
  Heading,
  DataTable,
  Text,
  Paragraph,
  Button
} from "grommet";
import Aggregator from "./aggregators";

const aggregator = new Aggregator(1);

const sourceToken = "0x0000000000000000000000000000000000000000";
const destinationToken = "0x6b175474e89094c44da98b954eedeac495271d0f";
const sourceAmount = "100000000000000000000";

function parseWei(amount) {
  return (Number(amount) / 10 ** 18).toFixed(4);
}

function App() {
  const [quotes, setQuotes] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [errorFetching, setErrorFetching] = useState("");

  async function fetchQuotes() {
    setFetching(true);
    setErrorFetching("");
    try {
      await aggregator
        .fetchQuotes({
          sourceAmount,
          sourceToken,
          destinationToken
        })
        .then(response => setQuotes(response));
    } catch (e) {
      setFetching(false);
      setErrorFetching(e);
    }

    setFetching(false);
  }
  useEffect(() => {
    fetchQuotes();
  }, []);

  return (
    <Box
      // fill
      pad="large"
      // align="center"
      // alignContent="center"
      justify="center"
      direction="row"
    >
      <Box direction="column">
        <Heading>Aggregator Aggregator</Heading>
        <Paragraph>Sell 100 ETH for DAI</Paragraph>
        <Button label="Fetch Quotes" primary onClick={() => fetchQuotes()} />
        <Box align="center" margin="medium">
          {errorFetching}
          {fetching ? (
            <Box>
              <Spinner />
            </Box>
          ) : (
            <DataTable
              data={quotes}
              columns={[
                {
                  property: "aggregator",
                  primary: true,
                  header: "Aggregator"
                },
                {
                  property: "destinationAmount",
                  header: "Return Amount",
                  sortable: true,
                  render: datum => (
                    <Text>{parseWei(datum.destinationAmount)} DAI</Text>
                  )
                },
                {
                  property: "fetchTime",
                  sortable: true,
                  header: "Fetch Time (s)",
                  render: datum => <Text>{datum.fetchTime / 1000}</Text>
                }
              ]}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}

const rootElement = document.getElementById("root");

const myTheme = {
  global: {
    font: {
      family: "Lato"
    },
    colors: {
      brand: "#2b71ff"
    }
  }
};

const Index = () => (
  <Grommet theme={myTheme}>
    <App />
  </Grommet>
);

ReactDOM.render(<Index />, rootElement);
