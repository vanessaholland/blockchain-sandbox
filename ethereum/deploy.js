const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const contracts = require('./compile');
const fs = require('fs');
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

    for (let contract in contracts) {
        const contractName = contract.substring(0, contract.length - 4);
        const abi = contracts[contract][contractName].abi;
        const evm = contracts[contract][contractName].evm.bytecode.object;
        let arguments = [];
        if (contractName == "Campaign") arguments = [100, accounts[0]];
        
        fs.writeFile(`../src/build/interface/${contractName}-abi.js`, 
        `const abi = ${JSON.stringify(abi)}; export default abi;`, 
            function (err) {
                if (err) throw err;
            });

        const deployedContract = await new web3.eth.Contract(abi)
        .deploy({ data: evm, arguments: arguments })
        .send({ from: accounts[0], gas: '3000000' });

        fs.writeFile(`../src/build/address/${contractName}-address.js`,
        `const address = '${deployedContract.options.address}'; export default address;`,
            function (err) {
                if (err) throw err;
            });
    }

    provider.engine.stop();
};
deploy();
