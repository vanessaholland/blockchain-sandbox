const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const contracts = require('./compile');
const fs = require('fs');
require('dotenv').config();

const account_mnemonic = process.env.MNEMONIC;
const provider_url = process.env.PROVIDER_URL;
const contractArg = process.argv.slice(2);

const provider = new HDWalletProvider(
    account_mnemonic,
    provider_url
);
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    fs.writeFile(`./src/build/interface/${contractArg}-abi.js`, 
        `const abi = ${JSON.stringify(contracts[`${contractArg}.sol`][contractArg].abi)}; export default abi;`, 
        function (err) {
            if (err) throw err;
        });

    const contract = await new web3.eth.Contract(contracts[`${contractArg}.sol`][contractArg].abi)
    .deploy({ data: contracts[`${contractArg}.sol`][contractArg].evm.bytecode.object })
    .send({ from: accounts[0], gas: '1000000' });

    fs.writeFile(`./src/build/address/${contractArg}-address.js`, 
    `const address = '${contract.options.address}'; export default address;`,
        function (err) {
            if (err) throw err;
        });
    

    provider.engine.stop();
};
deploy();
