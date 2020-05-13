import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ReactDOM from "react-dom";
import { Grommet, Box, Heading, Button } from "grommet";
import Aggregator from "./aggregators";

const aggregator = new Aggregator(1);

const sourceToken = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const destinationToken = "0x6b175474e89094c44da98b954eedeac495271d0f";
const sourceAmount = "1000000000000000000";

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
        <Box>{JSON.stringify(quotes, null, 2)}</Box>
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
