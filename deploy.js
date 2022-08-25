const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { abi, evm } = require('./compile');
require('dotenv').config();

const account_mnemonic = process.env.MNEMONIC;
const provider_url = process.env.PROVIDER_URL;

const provider = new HDWalletProvider(
    account_mnemonic,
    provider_url
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' });

    provider.engine.stop();
};
deploy();
