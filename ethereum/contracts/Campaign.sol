// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minAmount) public {
        Campaign newCampaign = new Campaign(minAmount, msg.sender);
        deployedCampaigns.push(address(newCampaign));
    }

    function getDeployedCampaigns() public view returns(address[] memory) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }

    Request[] public requests;
    address public manager;
    mapping(address => uint) public contributors;
    mapping(address => bool) public approvers;
    uint public minimumContribution;
    uint public numberOfApprovers;

    constructor(uint minAmount, address creator) {
        manager = creator;
        minimumContribution = minAmount;
    }

    function contribute() public payable {
        contributors[msg.sender] = msg.value;
        if (msg.value >= minimumContribution) {
            approvers[msg.sender] = true;
            numberOfApprovers++;
        }
    }

    function createRequest(string memory description, uint value, address recipient) 
        public onlyManager {
            Request storage newRequest = requests.push();
                newRequest.description = description;
                newRequest.value = value;
                newRequest.recipient = recipient;
                newRequest.complete = false;
                newRequest.approvalCount = 0;
    }

    function approveRequest(uint index) public {
        require(approvers[msg.sender]);

        Request storage request = requests[index];
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public onlyManager {
        Request storage request = requests[index];

        require(!request.complete);
        require(request.approvalCount > (numberOfApprovers / 2));
        require(address(this).balance >= request.value, "Insufficient Balance");

        (bool sent,) = request.recipient.call{value: request.value}("");
        require(sent, "Failed to send Ether");
        request.complete = true;
    }

    function getApprovalCount(uint index) public view returns(uint) {
        Request storage request = requests[index];
        return request.approvalCount;
    }

    modifier onlyManager() {
        require(msg.sender == manager);
        _;
    }
}
