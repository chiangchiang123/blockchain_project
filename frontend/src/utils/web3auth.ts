import { WEB3AUTH_NETWORK, type Web3AuthOptions } from "@web3auth/modal";
import type { Web3AuthContextConfig } from "@web3auth/modal/react";

const web3AuthOptions: Web3AuthOptions = {
  clientId: "BH-xV6clcKgd7XGm8366yT3GqA0q1TxohxNuJAGL7GMzHDYMwP6-GmP6xG1o7aaTGls7WrKeRtH6CKvtt0-leSE",
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
};

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};

export default web3AuthContextConfig;