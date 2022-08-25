// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

contract Inbox {
    string public message;

    constructor() {
        message = "Hi this is the default message! Change me";
    }

    function updateMessage(string memory newMessage) public {
        message = newMessage;
    }
}
