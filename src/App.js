import "./App.css";
import React from "react";
import web3 from "./web3";
import lottery from "./lottery";
import LotteryInfo from "./components/lottery_info";
import LotteryEntry from "./components/lottery_entry";
import PickWinner from "./components/pick_winner";
 
class App extends React.Component {
    state = {
      manager: '',
      players: [],
      balance: '',
      newPlayer: '',
      ticketPriceInWei: '',
      message: '',
      currentWinner: ''
    };
  

  async componentDidMount() {
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    const ticketPriceInWei = web3.utils.toWei('.01', 'ether');
    
    this.setState({ manager, players, balance, ticketPriceInWei });
  }

  async componentDidUpdate() {
    const players = await lottery.methods.getPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({ players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();

    this.setState({ message: 'Waiting on transaction...' });

    try {
      await lottery.methods.enter().send({
        from: this.state.accounts[0],
        value: 10000000000000000,
      });
      this.setState({ message: 'Transaction successful!'});
    } catch (err) {
      this.setState({ message: err.message});
    }
  };

  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Picking winner, please wait...' });

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const currentWinner = await lottery.methods.getCurrentWinner().call();
    this.setState({ currentWinner });

    this.setState({ message: 'A winner was picked!'});
  };

  onChange = async (event) => {
    this.setState({ newPlayer: event.target.value});
  }


  render() {
    return (
      <div className="App">
        <LotteryInfo {...this.state}/>
        <hr />
        <LotteryEntry {...this.state} onChange={this.onChange} onSubmit={this.onSubmit}/>
        <h1>{this.state.message}</h1>
        <hr />
        <PickWinner onClick={this.onClick}/>
      </div>
    );
  }
}
export default App;
