// File: @openzeppelin/contracts/token/ERC20/IERC20.sol

// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.0 (token/ERC20/IERC20.sol)

pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

// File: src/contracts/Project.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;


contract Project {
    IERC20 public dai;
    address public parentAddress;
	string public name; 
	string public description;
	string public imgHash;
	address public creator;
	uint256 public fundGoal;
	uint256 public timeGoal;
	uint256 public raisedFunds;
	uint256 public timestamp;
	bool public cancelled;
	mapping (address => uint256) public supporterFunds;
	
	event Cancel (
		address indexed creator,
		uint256 fundGoal,
		uint256 timeGoal,
		uint256 timestamp	
	);
	event Contribution (
		address indexed supporter,
		bool indexed newSupporter,
		uint256 raisedFunds,
		uint256 fundAmount,	
		uint256 timestamp		
	);
	event Disburse (
		address indexed creator,
		uint256 disburseAmount,
		uint256 feeAmount,
		uint256 timestamp
	);
	event Refund (
		address indexed supporter,
		uint256 raisedFunds,
		uint256 refundAmount,
		uint256 timestamp	
	);	
	constructor(
    	string memory _name,
    	string memory _description,
    	string memory _imgHash,
    	address _creator,
    	uint256 _fundGoal,
    	uint256 _timeGoal,
    	uint256 _timestamp,
    	address _dai
	 ) 
	{
        name = _name;
        description = _description;
        imgHash = _imgHash;
        creator = _creator;
        fundGoal = _fundGoal;
        timeGoal = _timeGoal;
        timestamp = _timestamp;
        dai = IERC20(_dai);
        parentAddress = msg.sender;
	}
	
	// Fallback: reverts if Ether is sent to this smart contract by mistake
    fallback () external { revert(); }
	
	modifier onlyParentContract () {
		require(parentAddress == msg.sender, 'Error, only parent contract can interact with this contract');
		_;
	}
	
	function isOpen() internal view returns(bool) {
		return(timeGoal > block.timestamp);
	}
	
	function callerIsCreator(address _user) internal view returns(bool) {
	    return(_user == creator);
	}
	
	function fullyFunded() internal view returns(bool) {
	    return(raisedFunds >= fundGoal);
	}

	function cancel(address _user) onlyParentContract external returns(uint256, uint256, uint256) {
		require(isOpen(), 'Error, project must be open');
		require(callerIsCreator(_user), 'Error, only creator can cancel their project');
		cancelled = true;
		emit Cancel(_user, fundGoal, timeGoal, block.timestamp);
		return(fundGoal, timeGoal, block.timestamp);    
	}

	function contribute(uint256 _amount, address _user,bool _swapped) onlyParentContract external returns(bool, uint256, uint256) {
	    bool _newSupporter;
		require(!cancelled, 'Error, project cancelled');
		require(!callerIsCreator(_user), 'Error, creators are not allowed to add funds to their own projects');
		require(isOpen(), 'Error, project must be open');
		if(supporterFunds[_user] == 0) {
			_newSupporter = true;	
		}
		raisedFunds += _amount;
		supporterFunds[_user] += _amount;
		if(!_swapped)require(dai.transferFrom(_user, address(this), _amount));
		emit Contribution (_user, _newSupporter, raisedFunds , _amount, block.timestamp);	
		return(_newSupporter, raisedFunds, block.timestamp);
	}
	
	function disburse(uint256 _feePercent, address _feeAccount, address _user) onlyParentContract external returns(uint256, uint256, uint256) {
		require(!cancelled, 'Error, project cancelled');
		require(callerIsCreator(_user), 'Error, only creator can disburse collected project funds');
		require(!isOpen(), 'Error, project still open');
		require(fullyFunded(), 'Error, project not fullyFunded');
		uint256 _feeAmount = (raisedFunds * _feePercent)/100;
		uint256 _disburseAmount = raisedFunds - _feeAmount; 
		delete raisedFunds;
		require(dai.transfer(_feeAccount, _feeAmount));
		require(dai.transfer(_user, _disburseAmount));
		emit Disburse(_user, _disburseAmount, _feeAmount, block.timestamp);
		return(_disburseAmount, _feeAmount, block.timestamp);
	}

	function claimRefund(address _user) onlyParentContract external returns (uint256, uint256, uint256) {
		bool _failed = !isOpen() && !fullyFunded();
		require(_failed || cancelled, 'Error, no refunds unless project has been cancelled or did not meet funding goal');
		uint256 _supporterFunds = supporterFunds[_user];
		delete supporterFunds[_user];
		raisedFunds -= _supporterFunds;
		require(dai.transfer(_user, _supporterFunds));
		emit Refund(_user, raisedFunds, _supporterFunds, block.timestamp);
		return(raisedFunds,_supporterFunds, block.timestamp);
	}
}
