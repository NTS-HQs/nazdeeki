// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NazdeekiCore is ReentrancyGuard, Ownable {
    struct Order {
        uint256 orderId;
        address customer;
        address restaurant;
        uint256 amount;
        string status; // "pending", "confirmed", "preparing", "ready", "delivered"
        uint256 timestamp;
        string serviceType; // "delivery", "dine-in", "takeaway", "events"
        bool gaslessSponsored;
    }
    
    struct Restaurant {
        address wallet;
        string name;
        string location;
        bool isActive;
        uint256 totalOrders;
    }
    
    mapping(uint256 => Order) public orders;
    mapping(address => Restaurant) public restaurants;
    mapping(address => uint256) public loyaltyTokens;
    mapping(address => bool) public authorizedAgents;
    
    uint256 public orderCounter;
    uint256 public constant LOYALTY_REWARD_PERCENT = 5; // 5% of order value
    
    event OrderCreated(uint256 indexed orderId, address indexed customer, address indexed restaurant, uint256 amount, string serviceType);
    event OrderStatusUpdated(uint256 indexed orderId, string status);
    event LoyaltyRewarded(address indexed user, uint256 amount);
    event RestaurantRegistered(address indexed restaurant, string name);
    event AgentAuthorized(address indexed agent);
    
    modifier onlyAuthorizedAgent() {
        require(authorizedAgents[msg.sender] || msg.sender == owner(), "Not authorized agent");
        _;
    }
    
    constructor() {
        authorizedAgents[msg.sender] = true; // Owner is authorized by default
    }
    
    function authorizeAgent(address agent) external onlyOwner {
        authorizedAgents[agent] = true;
        emit AgentAuthorized(agent);
    }
    
    function registerRestaurant(
        address restaurantWallet,
        string memory name,
        string memory location
    ) external onlyAuthorizedAgent {
        restaurants[restaurantWallet] = Restaurant({
            wallet: restaurantWallet,
            name: name,
            location: location,
            isActive: true,
            totalOrders: 0
        });
        emit RestaurantRegistered(restaurantWallet, name);
    }
    
    function createGaslessOrder(
        address customer,
        address restaurant,
        uint256 amount,
        string memory serviceType
    ) external onlyAuthorizedAgent nonReentrant returns (uint256) {
        require(restaurants[restaurant].isActive, "Restaurant not active");
        require(amount > 0, "Invalid amount");
        
        orderCounter++;
        uint256 orderId = orderCounter;
        
        orders[orderId] = Order({
            orderId: orderId,
            customer: customer,
            restaurant: restaurant,
            amount: amount,
            status: "pending",
            timestamp: block.timestamp,
            serviceType: serviceType,
            gaslessSponsored: true
        });
        
        restaurants[restaurant].totalOrders++;
        emit OrderCreated(orderId, customer, restaurant, amount, serviceType);
        
        return orderId;
    }
    
    function updateOrderStatus(uint256 orderId, string memory status) external {
        require(orders[orderId].orderId != 0, "Order does not exist");
        require(msg.sender == orders[orderId].restaurant || authorizedAgents[msg.sender], "Not authorized");
        
        orders[orderId].status = status;
        emit OrderStatusUpdated(orderId, status);
        
        // Auto-reward loyalty tokens when order is delivered
        if (keccak256(bytes(status)) == keccak256(bytes("delivered"))) {
            uint256 rewardAmount = (orders[orderId].amount * LOYALTY_REWARD_PERCENT) / 100;
            loyaltyTokens[orders[orderId].customer] += rewardAmount;
            emit LoyaltyRewarded(orders[orderId].customer, rewardAmount);
        }
    }
    
    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
    
    function getRestaurant(address restaurant) external view returns (Restaurant memory) {
        return restaurants[restaurant];
    }
    
    function getUserLoyaltyTokens(address user) external view returns (uint256) {
        return loyaltyTokens[user];
    }
}
