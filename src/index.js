import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ReactDOM from "react-dom";
import { Grommet, Box, Heading, DataTable, Text, Paragraph } from "grommet";
import Aggregator from "./aggregators";

const aggregator = new Aggregator(1);

const sourceToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const destinationToken = "0x6b175474e89094c44da98b954eedeac495271d0f";
const sourceAmount = "1000000000000000000";

function parseWei(amount) {
  return (Number(amount) / 10 ** 18).toFixed(4);
}

function App() {
  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    aggregator
      .fetchQuotes({
        sourceAmount,
        sourceToken,
        destinationToken
      })
      .then(response => setQuotes(response));
  }, []);
  return (
    <Box
      fill
      pad="large"
      align="center"
      alignContent="center"
      justify="center"
      direction="row"
    >
      <Box align="center" alignContent="center" direction="column">
        <Heading>Aggregator Aggregator</Heading>
        <Paragraph>Sell 1 ETH for DAI</Paragraph>
        <DataTable
          data={quotes}
          columns={[
            {
              property: "aggregator",
              header: "Aggregator"
            },
            {
              property: "destinationAmount",
              header: "Return Amount",
              render: datum => (
                <Text>{parseWei(datum.destinationAmount)} DAI</Text>
              )
            },
            {
              property: "fetchTime",
              header: "Fetch Time (s)",
              render: datum => <Text>{datum.fetchTime / 1000}</Text>
            }
          ]}
        />
      </Box>
    </Box>
  );
}

const rootElement = document.getElementById("root");

const myTheme = {
  global: {
    font: {
      family: "Lato"
    }
  }
};

const Index = () => (
  <Grommet full={true} theme={myTheme}>
    <App />
  </Grommet>
);

ReactDOM.render(<Index />, rootElement);
