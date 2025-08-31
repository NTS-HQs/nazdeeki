// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract NazdeekiPaymaster {
    mapping(address => bool) public authorizedAgents;
    mapping(address => uint256) public sponsoredGas;
    
    address public owner;
    
    event GasSponsored(address indexed user, uint256 amount);
    event AgentAuthorized(address indexed agent);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        authorizedAgents[msg.sender] = true;
    }
    
    function authorizeAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
        emit AgentAuthorized(agent);
    }
    
    function sponsorGas(address user, uint256 amount) external {
        require(authorizedAgents[msg.sender], "Not authorized");
        sponsoredGas[user] += amount;
        emit GasSponsored(user, amount);
    }
    
    function isGasSponsored(address user) external view returns (bool) {
        return sponsoredGas[user] > 0;
    }
    
    receive() external payable {}
    
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
