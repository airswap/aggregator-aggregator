import * as ethers from "ethers";
import _ from "lodash";
import fetchGasSettings from "airswap.js/src/gas";

class Gas {
  constructor() {
    this.settings = {};
    this.ready = this.pollGasSettings();
    setInterval(() => this.pollGasSettings, 10000);
  }
  async pollGasSettings() {
    const settings = await fetchGasSettings();
    const { fast, fastest, average, safeLow } = settings;
    this.settings = _.mapValues(
      { fast, fastest, average, safeLow },
      v => v / 10
    );
    return this.settings;
  }
  getGasSettingsForTransaction(setting = "fastest", gasLimit = 30000) {
    const gwei = this.settings[setting];
    const gasPrice = ethers.utils.parseUnits(`${gwei}`, "gwei").toNumber();
    console.log("gas settings", {
      gasLimit: Number(gasLimit),
      gasPrice
    });
    return {
      gasLimit: Number(gasLimit),
      gasPrice
    };
  }
}

const gas = new Gas();

export default gas;
