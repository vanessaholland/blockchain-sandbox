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
    accounts = await web3.eth.getAccounts();
    
    factory = await new web3.eth.Contract(contracts['Campaign.sol'].CampaignFactory.abi)
        .deploy({ data: contracts['Campaign.sol'].CampaignFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: '3000000' })

    await factory.methods.createCampaign('100').send({
        from: accounts[0],
        gas: '3000000'
    });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
    campaign = await new web3.eth.Contract(contracts['Campaign.sol'].Campaign.abi, campaignAddress);
});

describe('CampaignFactory', () => {
    it('deploys a Campaign', () => {
        assert.ok(campaign.options.address);
    });
});

describe('Campaign', () => {
    it('sets the campaign creator as the manager', async () => {
        const manager = await campaign.methods.manager().call();
        assert.equal(manager, accounts[0]);
    });

    describe('contribute', () => {
        describe('contributions below the minimum amount', () => {
            beforeEach(async () => {
                await campaign.methods.contribute().send({from: accounts[1], value: '50'});
            });
    
            it('keeps a record of the contribution amount by address', async () => {
                const donatedAmount = await campaign.methods.contributors(accounts[1]).call();
                assert.equal(donatedAmount, '50');
            });
    
            it('does not set the contributor as an approver', async () => {
                const isApprover = await campaign.methods.approvers(accounts[1]).call();
                assert(!isApprover);
            });         
        });
        
        describe('contributions greater than or equal to the minimum amount', () => {
            beforeEach(async () => {
                await campaign.methods.contribute().send({from: accounts[2], value: '105'});
            });
    
            it('keeps a record of the contribution amount by address', async () => {
                const donatedAmount = await campaign.methods.contributors(accounts[2]).call();
                assert.equal(donatedAmount, '105');
            });
    
            it('sets contributor as an approver', async () => {
                const isApprover = await campaign.methods.approvers(accounts[2]).call();
                assert(isApprover);
            });
        });
    });

    describe('createRequest', () => {
        it('restricts request creation to the manager', async () => {
            try {
                await campaign.methods.createRequest('Buy paper supplies', '300', accounts[9]).send({
                    from: accounts[3]
                });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });

        it('creates a request', async () => {
            await campaign.methods.createRequest('Pay for parts assembly', '200', accounts[9]).send({
                from: accounts[0],
                gas: '3000000'
            });

            const request = await campaign.methods.requests(0).call();
            assert.equal(request.description, 'Pay for parts assembly');
        });
    });

    describe('approveRequest', () => {
        beforeEach(async () => {
            await campaign.methods.createRequest('Pay for parts assembly', '200', accounts[9]).send({
                from: accounts[0],
                gas: '3000000'
            });
        });

        it('restricts request approvals to members of the approvers mapping', async () => {
            try {
                await campaign.methods.approveRequest(0).send({
                    from: accounts[3]
                });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });

        it('allows a member of the approvers mapping to approve a request', async () => {
            await campaign.methods.contribute().send({from: accounts[2], value: '200'});   
            await campaign.methods.approveRequest(0).send({
                from: accounts[2]
            });
            const approvalCount = await campaign.methods.getApprovalCount(0).call();
            assert.equal(approvalCount, 1);
        });
    });

    describe('finalizeRequest', () => {
        beforeEach(async () => {
            await campaign.methods.createRequest('Pay for parts assembly', '200', accounts[9]).send({
                from: accounts[0],
                gas: '3000000'
            });
        });

        it('restricts request finalization to the manager', async () => {
            try {
                await campaign.methods.finalizeRequest(0).send({
                    from: accounts[3]
                });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });

        it('does not finalize a request that has less than 50% approval rate', async () => {
            try {
                await campaign.methods.finalizeRequest(0).send({
                    from: accounts[0]
                });
                assert(false);
            } catch (err) {
                assert(err);
            }
        });

        it('does not finalizes a request if the account balance is lower than the payout', async () => {
            await campaign.methods.contribute().send({from: accounts[2], value: '199'});   
            await campaign.methods.approveRequest(0).send({
                from: accounts[2]
            });
            try {
                await campaign.methods.finalizeRequest(0).send({ from: accounts[0] });
                assert(false);
            } catch (err) {
                assert(err);
                assert
            }
        });

        it('finalizes a request that has grater than or equal to 50% approval rate', async () => {
            const initialBalance = await web3.eth.getBalance(accounts[9]);
            await campaign.methods.contribute().send({from: accounts[2], value: '200'});   
            await campaign.methods.approveRequest(0).send({
                from: accounts[2]
            });
            await campaign.methods.finalizeRequest(0).send({ from: accounts[0] });
            const request = await campaign.methods.requests(0).call();
            const finalBalance = await web3.eth.getBalance(accounts[9]);
            assert(request.complete);
            assert(finalBalance > initialBalance);
        });
    });
});
