import React from "react";
import web3 from "../../ethereum/web3";

const LotteryInfo = (props) =>  {
    if(!props.players.length) {
        return (
            <div className="App-header">
                <h3>No one is currently entered!</h3>
            </div>
        )
    }
        return (
            <div className="App-header">
                <h2>Lottery Contract</h2>
                <p>This contract is managed by {props.manager}.<br />
                There are currently {props.players.length} players <br />
                competing to win {web3.utils.fromWei(props.balance, 'ether')} ether!
                Last winner was {props.currentWinner}.
                </p>
            </div>
        );
    }

export default LotteryInfo;
