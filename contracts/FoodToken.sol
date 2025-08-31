// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FoodToken is ERC20, Ownable {
    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public stakingTimestamps;
    
    uint256 public constant STAKING_REWARD_RATE = 10; // 10% APY
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    
    constructor() ERC20("Nazdeeki Food Token", "FOOD") {
        _mint(msg.sender, 1000000 * 10**decimals()); // 1M initial supply
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function stake(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        // Claim existing rewards first
        if (stakedBalances[msg.sender] > 0) {
            claimStakingRewards();
        }
        
        _transfer(msg.sender, address(this), amount);
        stakedBalances[msg.sender] += amount;
        stakingTimestamps[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }
    
    function unstake(uint256 amount) external {
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");
        
        uint256 rewards = calculateRewards(msg.sender);
        stakedBalances[msg.sender] -= amount;
        
        _transfer(address(this), msg.sender, amount);
        if (rewards > 0) {
            _mint(msg.sender, rewards);
        }
        
        stakingTimestamps[msg.sender] = block.timestamp;
        
        emit Unstaked(msg.sender, amount, rewards);
    }
    
    function claimStakingRewards() public {
        uint256 rewards = calculateRewards(msg.sender);
        if (rewards > 0) {
            _mint(msg.sender, rewards);
            stakingTimestamps[msg.sender] = block.timestamp;
        }
    }
    
    function calculateRewards(address user) public view returns (uint256) {
        if (stakedBalances[user] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakingTimestamps[user];
        return (stakedBalances[user] * STAKING_REWARD_RATE * stakingDuration) / (100 * SECONDS_PER_YEAR);
    }
}
