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
        // require(msg.value == .01 ether, "Cost to enter is .01 ether.");
        // require(playerEntered(msg.sender) == false, "You can only enter once.");

        players.push(payable(msg.sender));
        // require(playerEntered(msg.sender) == true, "Sorry something went wrong, try again.");
    }

    function getPlayers() public view returns(address payable[] memory) {
        return players;
    }

    function pickWinner() public payable onlyManager {
        uint index = randomNumber() % players.length;

        // (bool sent,) = players[index].call{value: address(this).balance}("");
        // require(sent, "Failed to send Ether");
        players[index].transfer(address(this).balance);

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

    function playerEntered(address element) private view returns(bool) {
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
}
