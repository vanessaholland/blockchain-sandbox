const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
// const Inbox = require('../compile');
const { abi, evm } = require('../compile');

let accounts;
let inbox;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    inbox = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' })
});

describe('Inbox', () => {
    it('Deploys a contract', () => {
        assert.ok(inbox.options.address);
    });

    it('has a default message', async () => {
        const message = await inbox.methods.message().call();
        assert.equal(message, "Hi this is the default message! Change me");
    });

    describe('updateMessage', () => {
        const newMessage = 'I have now been changed';

        beforeEach(async () => {
            await inbox.methods.updateMessage(newMessage).send({ from: accounts[0] });
        });

        it('can update the default message', async () => {
            const message = await inbox.methods.message().call();
            assert.equal(message, newMessage);
        });
    });
});
