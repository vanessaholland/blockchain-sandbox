const path = require('path');
const fs = require('fs');
const solc = require('solc');
require("dotenv").config;

const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');
const inboxSource = fs.readFileSync(inboxPath, 'utf8');
const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const lotterySource = fs.readFileSync(lotteryPath, 'utf8');
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const campaignSource = fs.readFileSync(campaignPath, 'utf8');

var input = {
    language: 'Solidity',
    sources: {
        'Inbox.sol' : {
            content: inboxSource
        },
        'Lottery.sol' : {
            content: lotterySource
        },
        'Campaign.sol' : {
            content: campaignSource
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
};
module.exports = JSON.parse(solc.compile(JSON.stringify(input))).contracts;
