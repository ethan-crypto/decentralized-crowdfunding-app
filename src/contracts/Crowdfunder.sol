//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./Project.sol"; 

contract Crowdfunder {
	address public dai; 
	address public feeAccount; // the account that receives transfer fees
	uint256 public feePercent; // the fee percentage
	uint256 public projectCount;
	mapping(uint256 => Project) public projects;
	event ProjectMade (
		uint256 id,
		string name,
		string description,
		string imgHash,
		address creator,
		uint256 fundGoal,
		uint256 timeGoal,
		uint256 timestamp
	);
	event Cancel (
		uint256 id,
		address indexed creator,
		uint256 fundGoal,
		uint256 timeGoal,
		uint256 timestamp	
	);
	event Contribution (
		uint256 indexed id,
		address indexed supporter,
		bool newSupporter,
		uint256 raisedFunds,
		uint256 fundAmount,	
		uint256 timestamp		
	);
	event Disburse (
		uint256 id,
		address indexed creator,
		uint256 disburseAmount,
		uint256 feeAmount,
		uint256 timestamp
	);
	event Refund (
		uint256 indexed id,
		address indexed supporter,
		uint256 raisedFunds,
		uint256 refundAmount,
		uint256 timestamp	
	);

	constructor (address _dai, address _feeAccount, uint256 _feePercent) {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
		dai = _dai;
	}

	// Fallback: reverts if Ether is sent to this smart contract by mistake
    fallback () external { revert(); }
    
    function makeProject(string memory _name, string memory _description, string memory _imgHash, uint256 _fundGoal, uint256 _timeGoal) external {
        require(_timeGoal > block.timestamp, 'Error, time goal must exist in the future');
		require(_timeGoal < 60 days + block.timestamp, 'Error, time goal must be less than 60 days');
		require(bytes(_name).length > 0, 'Error, name must exist');
		require(bytes(_description).length > 0, 'Error, description must exist');
		require(bytes(_imgHash).length > 0, 'Error, image hash must exist');
		Project project = new Project(_name, _description, _imgHash, address(msg.sender), _fundGoal, _timeGoal, block.timestamp, dai);
		projectCount ++;
		projects[projectCount] = project;
		emit ProjectMade(projectCount, _name, _description, _imgHash, msg.sender, _fundGoal, _timeGoal, block.timestamp);
    }

	function cancel(uint256 _id) external {
	    (uint256 _fundGoal, uint256 _timeGoal, uint256 _timestamp) = projects[_id].cancel(msg.sender);
		emit Cancel(_id, msg.sender, _fundGoal, _timeGoal, _timestamp);
	}

	function contribute(uint256 _id, uint256 _amount) external {
	    (bool _newSupporter, uint256 _raisedFunds, uint256 _timestamp) = projects[_id].contribute(_amount, msg.sender);
		emit Contribution (_id, msg.sender, _newSupporter, _raisedFunds, _amount, _timestamp);	
	}

	function disburse(uint256 _id) external {
        (uint256 _disburseAmount, uint256 _feeAmount, uint256 _timestamp) = projects[_id].disburse(feePercent, feeAccount, msg.sender);  
		emit Disburse(_id, msg.sender, _disburseAmount, _feeAmount, _timestamp);
	}

	function claimRefund(uint256 _id) external {
	    (uint256 _raisedFunds, uint256 _supporterFunds, uint256 _timestamp) = projects[_id].claimRefund(msg.sender);
		emit Refund(_id, msg.sender, _raisedFunds, _supporterFunds, _timestamp);
	}
}

// Place timeGoal and fundingGoal limits
// timeGoal limit would depend on fundgoal
// timeGoalLimit == fundGoal*C
// timeGoalLimit would not depend on the fundGoal digit number
// change _amount data type from uint256 to uint16
