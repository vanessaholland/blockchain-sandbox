const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const contracts = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(contracts['Lottery.sol'].Lottery.abi)
        .deploy({ data: contracts['Lottery.sol'].Lottery.evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' })
});

describe('Lottery', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });

    it('sets the manager address to the msg.sender upon deployment', async () => {
        const manager = await lottery.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    it('starts with an empty array of players', async () => {
        const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
        assert.equal(0, players.length);
    })

    describe('enter', () => {
        it('adds a player to the array', async () => {
            const playerToEnter = accounts[1];
            
            await lottery.methods.enter().send({ 
                from: playerToEnter,
                value: web3.utils.toWei('0.02', 'ether')
            });

            const players = await lottery.methods.getPlayers().call({ from: accounts[0] });
            
            assert.equal(1, players.length);
            assert.equal(players[0], playerToEnter);
        });

        it('requires a minimum amount of ether to enter', async () => {
            try {
                await lottery.methods.enter().send({ 
                    from: accounts[4],
                    value: 100
                });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });

        it('restricts a player from entering twice', async () => {
            const playerToEnter = accounts[1];
            
            await lottery.methods.enter().send({ 
                from: playerToEnter,
                value: web3.utils.toWei('0.02', 'ether')
            });

            try {
                await lottery.methods.enter().send({ 
                    from: playerToEnter,
                    value: web3.utils.toWei('0.02', 'ether')
                });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });
    });

    describe('pickWinner', () => {
        beforeEach(async () => {
            await lottery.methods.enter().send({ 
                from: accounts[1],
                value: web3.utils.toWei('1', 'ether')
             });
             await lottery.methods.enter().send({ 
                from: accounts[2],
                value: web3.utils.toWei('1', 'ether')
             });
        });

        it('only allows the manager to pick a winner', async () => {
            try {
                await lottery.methods.pickWinner().call({ from: accounts[3] });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });

        it('transfers the balance to the winner', async () => {
            const initialBalanceAcct1 = await web3.eth.getBalance(accounts[1]);
            const initialBalanceAcct2 = await web3.eth.getBalance(accounts[2]);

            const balance = await lottery.methods.getBalance().call({ from: accounts[0] });
            console.log(balance);

            await lottery.methods.pickWinner().call({ from: accounts[0], gas: '1000000' });

            const winner = await lottery.methods.winner().call({ from: accounts[0] });
            console.log('****winner is: ', winner);

            const finalBalanceAcct1 = await web3.eth.getBalance(accounts[1]);
            const finalBalanceAcct2 = await web3.eth.getBalance(accounts[2]);

            const newBalance = await lottery.methods.getBalance().call({ from: accounts[0] });
            console.log(newBalance);

            console.log('difference of account 1: ', finalBalanceAcct1 - initialBalanceAcct1);
            console.log('difference of account 2: ', finalBalanceAcct2 - initialBalanceAcct2);

            assert(finalBalanceAcct1 > initialBalanceAcct1 || finalBalanceAcct2 > initialBalanceAcct2);
        });

        // it('resets the players array after a winner is paid', async () => {

        // });
    });
});
