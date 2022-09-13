// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

contract Lottery {
    address public manager;
    address payable[] public players;
    uint ticketPrice = .01 ether;
    address public currentWinner;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value == .01 ether, "Cost to enter is .01 ether.");
        players.push(payable(msg.sender));
    }

    function getPlayers() public view returns(address payable[] memory) {
        return players;
    }

    function pickWinner() public payable onlyManager {
        uint index = randomNumber() % players.length;

        (bool sent,) = players[index].call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");

        currentWinner = players[index];

        players = new address payable[](0);
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
