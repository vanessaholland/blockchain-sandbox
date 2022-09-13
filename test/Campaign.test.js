const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const contracts = require('../ethereum/compile');

let accounts;
let factory;
let campaign;
let campaignAddress;

beforeEach(async()  => {
    accounts = web3.utils.getAccounts();

    factory = await new web3.eth.Contract(contracts['CampaignFactory.sol'].CampaignFactory.abi)
        .deploy({ data: contracts['CampaignFactory.sol'].CampaignFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' })

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: 1000000
    });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
    campaign = web3.eth.Contract(contracts['Campaign.sol'].Campaign.abi, campaignAddress);
});






