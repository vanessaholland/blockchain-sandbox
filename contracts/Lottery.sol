// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

contract Lottery {
    address public manager;
    address payable []players;
    address public winner;

    constructor() {
        manager = msg.sender;
    }

    function enter() public payable {
        require(msg.value > .01 ether);
        require(playerAlreadyEntered(msg.sender) == false);

        players.push(payable(msg.sender));
    }

    function getPlayers() public view returns(address payable[] memory) {
        return players;
    }

    function pickWinner() public payable onlyManager {
        uint index = randomNumber() % players.length;
        winner = players[index];
        (bool sent,) = players[index].call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");

        players = new address payable[](0);
    }

    function randomNumber() public view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender)));
    }

    function playerAlreadyEntered(address element) private view returns(bool) {
        for (uint i = 0 ; i < players.length; i++) {
            if (element == players[i]) {
                return true;
            }
        }
        return false;
    }

    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}
