//SPDX-License-Identifier: UNLICENSED


pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

contract Crowdfunder {

	using SafeMath for uint;
	IERC20 dai; 
	address public feeAccount; // the account that receives exchange fees
	uint256 public feePercent; // the fee percentage
	uint256 public projectCount;
	mapping(uint256 => _Project) public projects;
	mapping (uint256 => bool) public projectCancelled;
	mapping (uint256 => bool) public projectFundsTransfered;
	mapping(uint256 => mapping (address => uint256)) public supporterFunds;
	event ProjectMade (
		uint256 id,
		string name,
		string description,
		string imgHash,
		address indexed creator,
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
		uint256 id,
		address indexed supporter,
		uint256 supporterCount,
		uint256 totalFunds,
		uint256 fundAmount,	
		uint256 timestamp		
	);
	event Transfer (
		uint256 id,
		address indexed creator,
		uint256 fundAmount,
		uint256 feeAmount,
		uint256 timestamp
	);
	event Refund (
		uint256 id,
		address indexed supporter,
		uint256 refundAmount,
		uint256 timestamp	
	);
	struct _Project {
		uint256 id;
		string name; 
		string description;
		string imgHash;
		address creator;
		uint256 fundGoal;
		uint256 timeGoal;
		uint256 timestamp;
		uint256 totalFunds;
		uint256 supporterCount;
	}

	constructor (address daiAddress, address _feeAccount, uint256 _feePercent) {
		dai = IERC20(daiAddress);
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}
	modifier onlyValidIds (uint256 _id) {
		require(_id > 0 && _id <= projectCount, 'Error, wrong id');
		_;
	}
	modifier onlyNoncancelled (uint256 _id) {
		require(!projectCancelled[_id], 'Error, project is canceled');
		_;
	}

	// Fallback: reverts if Ether is sent to this smart contract by mistake
    fallback () external { revert(); }


	function makeProject(string memory _name, string memory _description, string memory _imgHash, uint256 _fundGoal, uint256 _timeGoal) external {
		require(_timeGoal > 0, 'Error, time goal must exist in the future');
		require(_timeGoal < 5184000, 'Error, time goal must be less than 60 days');
		require(bytes(_name).length > 0, 'Error, name must exist');
		require(bytes(_description).length > 0, 'Error, description must exist');
		require(bytes(_imgHash).length > 0, 'Error, image hash must exist');
		projectCount = projectCount.add(1);
		projects[projectCount] = _Project(projectCount, _name, _description, _imgHash, msg.sender, _fundGoal, _timeGoal, block.timestamp, 0, 0);
		emit ProjectMade(projectCount, _name, _description, _imgHash, msg.sender, _fundGoal, _timeGoal, block.timestamp);
	}

	function IsOpen(uint256 _timeGoal, uint256 _timestamp) internal view returns(bool) {
		return(_timeGoal.add(_timestamp) > block.timestamp);
	}

	function cancelProject(uint256 _id) onlyValidIds(_id) external {
		_Project storage _project = projects[_id];
		require(IsOpen(_project.fundGoal, _project.timestamp), 'Error, project must be open');
		require(address(_project.creator) == msg.sender, 'Error, only creator can cancel their project');
		projectCancelled[_id] = true;
		emit Cancel(_project.id, msg.sender, _project.fundGoal, _project.timeGoal, block.timestamp);
	}

	function contribute(uint256 _id, uint256 _amount) onlyValidIds(_id) onlyNoncancelled(_id) external {
		require(!projectCancelled[_id], 'Error, project is canceled');
		_Project memory _project = projects[_id];
		require(msg.sender != _project.creator, 'Error, creators are not allowed to add funds to their own projects');
		require(IsOpen(_project.timeGoal, _project.timestamp), 'Error, project must be open');
		require(dai.transferFrom(msg.sender, address(this), _amount));
		if(supporterFunds[_id][msg.sender] == 0) {
			_project.supporterCount = _project.supporterCount.add(1);	
		}
		_project.totalFunds = _project.totalFunds.add(_amount);
		supporterFunds[_id][msg.sender] = supporterFunds[_id][msg.sender].add(_amount);
		projects[_id] = _project;
		emit Contribution (_id, msg.sender, _project.supporterCount, _project.totalFunds, _amount, block.timestamp);	
	}

	function transfer(uint256 _id) onlyNoncancelled(_id) external {
		require(!projectFundsTransfered[_id], 'Error, collected project funds already transfered');
		_Project storage _project = projects[_id];
		require(address(_project.creator) == msg.sender, 'Error, only creator can transfer collected project funds');
		require(!IsOpen(_project.timeGoal, _project.timestamp), 'Error, project still open');
		require(_project.totalFunds >= _project.fundGoal, 'Error, project did not meet funding goal in time');
		uint256 _totalFunds = _project.totalFunds;
		uint256 _feeAmount = _totalFunds.mul(feePercent).div(100);
		require(dai.transfer(_project.creator, _totalFunds.sub(_feeAmount)));
		require(dai.transfer(feeAccount, _feeAmount));
		projectFundsTransfered[_id] = true;
		emit Transfer(_id, _project.creator, _totalFunds.sub(_feeAmount), _feeAmount, block.timestamp);
	}

	function refund(uint256 _id) external {
		_Project storage _project = projects[_id];
		bool underFunded = _project.totalFunds < _project.fundGoal;
		bool _failed = !IsOpen(_project.timeGoal, _project.timestamp) && underFunded;
		require(_failed || projectCancelled[_id], 'Error, no refunds unless project has been canceled or does not meet funding goal in time');
		uint256 _supporterFunds = supporterFunds[_id][msg.sender];
		require(dai.transfer(msg.sender, _supporterFunds));
		delete supporterFunds[_id][msg.sender];
		emit Refund(_id, msg.sender, _supporterFunds, block.timestamp);
	}
}

// Place timeGoal and fundingGoal limits
// timeGoal limit would depend on fundgoal
// timeGoalLimit == fundGoal*C
// timeGoalLimit would not depend on the fundGoal digit number
// change _amount data type from uint256 to uint16
