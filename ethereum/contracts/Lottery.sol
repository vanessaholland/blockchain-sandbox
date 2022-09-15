// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

contract Lottery {
    address public manager;
    address[] public players;
    uint ticketPrice = .01 ether;
    address public currentWinner;
    uint public balance;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value == .01 ether, "Cost to enter is .01 ether.");
        players.push(msg.sender);
    }

    function getPlayers() public view returns(address[] memory) {
        return players;
    }

    function pickWinner() public onlyManager {
        uint index = randomNumber() % players.length;
        currentWinner = players[index];

        (bool sent,) = players[index].call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");

        players = new address[](0);
    }

    function randomNumber() public view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, this)));
    }

    function getCurrentWinner() public view returns(address) {
        return currentWinner;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }

    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }
}
