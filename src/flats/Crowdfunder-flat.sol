// File: @uniswap/v3-core/contracts/interfaces/callback/IUniswapV3SwapCallback.sol
// SPDX-License-Identifier: GPL-2.0-or-later

pragma solidity >=0.5.0;

/// @title Callback for IUniswapV3PoolActions#swap
/// @notice Any contract that calls IUniswapV3PoolActions#swap must implement this interface
interface IUniswapV3SwapCallback {
    /// @notice Called to `msg.sender` after executing a swap via IUniswapV3Pool#swap.
    /// @dev In the implementation you must pay the pool tokens owed for the swap.
    /// The caller of this method must be checked to be a UniswapV3Pool deployed by the canonical UniswapV3Factory.
    /// amount0Delta and amount1Delta can both be 0 if no tokens were swapped.
    /// @param amount0Delta The amount of token0 that was sent (negative) or must be received (positive) by the pool by
    /// the end of the swap. If positive, the callback must send that amount of token0 to the pool.
    /// @param amount1Delta The amount of token1 that was sent (negative) or must be received (positive) by the pool by
    /// the end of the swap. If positive, the callback must send that amount of token1 to the pool.
    /// @param data Any data passed through by the caller via the IUniswapV3PoolActions#swap call
    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external;
}

// File: @uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol

// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.5;
pragma abicoder v2;


/// @title Router token swapping functionality
/// @notice Functions for swapping tokens via Uniswap V3
interface ISwapRouter is IUniswapV3SwapCallback {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);

    struct ExactInputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another along the specified path
    /// @param params The parameters necessary for the multi-hop swap, encoded as `ExactInputParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInput(ExactInputParams calldata params) external payable returns (uint256 amountOut);

    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps as little as possible of one token for `amountOut` of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactOutputSingleParams` in calldata
    /// @return amountIn The amount of the input token
    function exactOutputSingle(ExactOutputSingleParams calldata params) external payable returns (uint256 amountIn);

    struct ExactOutputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
    }

    /// @notice Swaps as little as possible of one token for `amountOut` of another along the specified path (reversed)
    /// @param params The parameters necessary for the multi-hop swap, encoded as `ExactOutputParams` in calldata
    /// @return amountIn The amount of the input token
    function exactOutput(ExactOutputParams calldata params) external payable returns (uint256 amountIn);
}

// File: @uniswap/v3-periphery/contracts/interfaces/IQuoter.sol

// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.7.5;
pragma abicoder v2;

/// @title Quoter Interface
/// @notice Supports quoting the calculated amounts from exact input or exact output swaps
/// @dev These functions are not marked view because they rely on calling non-view functions and reverting
/// to compute the result. They are also not gas efficient and should not be called on-chain.
interface IQuoter {
    /// @notice Returns the amount out received for a given exact input swap without executing the swap
    /// @param path The path of the swap, i.e. each token pair and the pool fee
    /// @param amountIn The amount of the first token to swap
    /// @return amountOut The amount of the last token that would be received
    function quoteExactInput(bytes memory path, uint256 amountIn) external returns (uint256 amountOut);

    /// @notice Returns the amount out received for a given exact input but for a swap of a single pool
    /// @param tokenIn The token being swapped in
    /// @param tokenOut The token being swapped out
    /// @param fee The fee of the token pool to consider for the pair
    /// @param amountIn The desired input amount
    /// @param sqrtPriceLimitX96 The price limit of the pool that cannot be exceeded by the swap
    /// @return amountOut The amount of `tokenOut` that would be received
    function quoteExactInputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint160 sqrtPriceLimitX96
    ) external returns (uint256 amountOut);

    /// @notice Returns the amount in required for a given exact output swap without executing the swap
    /// @param path The path of the swap, i.e. each token pair and the pool fee. Path must be provided in reverse order
    /// @param amountOut The amount of the last token to receive
    /// @return amountIn The amount of first token required to be paid
    function quoteExactOutput(bytes memory path, uint256 amountOut) external returns (uint256 amountIn);

    /// @notice Returns the amount in required to receive the given exact output amount but for a swap of a single pool
    /// @param tokenIn The token being swapped in
    /// @param tokenOut The token being swapped out
    /// @param fee The fee of the token pool to consider for the pair
    /// @param amountOut The desired output amount
    /// @param sqrtPriceLimitX96 The price limit of the pool that cannot be exceeded by the swap
    /// @return amountIn The amount required as the input for the swap in order to receive `amountOut`
    function quoteExactOutputSingle(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountOut,
        uint160 sqrtPriceLimitX96
    ) external returns (uint256 amountIn);
}

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

// File: src/contracts/Crowdfunder.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;
pragma abicoder v2;



interface IUniSwapRouter is ISwapRouter {
    function refundETH() external payable;
}


contract Crowdfunder {
    address public dai;
    address public feeAccount; // the account that receives transfer fees
    uint256 public feePercent; // the fee percentage
    uint256 public projectCount;
    mapping(uint256 => Project) public projects;
    uint24 public constant poolFee = 3000;
    address public weth;
    IUniSwapRouter public constant swapRouter =
        IUniSwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IQuoter public constant quoter =
        IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    event Converted(
        uint256 id,
        address user,
        uint256 amountOut,
        uint256 amountInMaximum,
        uint256 amountIn
    );
    event ProjectMade(
        uint256 id,
        string name,
        string description,
        string imgHash,
        address creator,
        uint256 fundGoal,
        uint256 timeGoal,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address indexed creator,
        uint256 fundGoal,
        uint256 timeGoal,
        uint256 timestamp
    );
    event Contribution(
        uint256 indexed id,
        address indexed supporter,
        bool newSupporter,
        uint256 raisedFunds,
        uint256 fundAmount,
        uint256 timestamp
    );
    event Disburse(
        uint256 id,
        address indexed creator,
        uint256 disburseAmount,
        uint256 feeAmount,
        uint256 timestamp
    );
    event Refund(
        uint256 indexed id,
        address indexed supporter,
        uint256 raisedFunds,
        uint256 refundAmount,
        uint256 timestamp
    );

    constructor(
        address _dai,
        address _weth,
        address _feeAccount,
        uint256 _feePercent
    ) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
        dai = _dai;
        weth = _weth;
    }

    // Used to accept swapRouter refund
    receive() external payable {}

    function getEthInputAmount(uint256 _amountOut)
        external
        payable
        returns (uint256 _amountIn)
    {
        address _tokenIn = weth;
        address _tokenOut = dai;
        uint24 _fee = 500;
        uint160 sqrtPriceLimitX96 = 0;
        _amountIn = quoter.quoteExactOutputSingle(
            _tokenIn,
            _tokenOut,
            _fee,
            _amountOut,
            sqrtPriceLimitX96
        );
    }

    function convertEthToExactDai(
        uint256 _id,
        uint256 _daiAmountOut,
        uint256 _deadline,
        address _user,
        uint256 _maxEthAmountIn
    ) internal {
        require(
            _daiAmountOut > 0,
            "Error, DAI amount out must be greater than 0"
        );
        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: weth,
                tokenOut: dai,
                fee: poolFee,
                recipient: address(projects[_id]),
                deadline: _deadline,
                amountOut: _daiAmountOut,
                amountInMaximum: _maxEthAmountIn,
                sqrtPriceLimitX96: 0
            });

        uint256 _amountIn = swapRouter.exactOutputSingle{
            value: _maxEthAmountIn
        }(params);
        swapRouter.refundETH();
        // Send the refunded ETH back to sender
        (bool success, ) = _user.call{value: address(this).balance}("");
        require(success, "Refund failed");
        emit Converted(_id, _user, _daiAmountOut, _maxEthAmountIn, _amountIn);
    }

    function makeProject(
        string memory _name,
        string memory _description,
        string memory _imgHash,
        uint256 _fundGoal,
        uint256 _timeGoal
    ) external {
        require(
            _timeGoal > block.timestamp,
            "Error, time goal must exist in the future"
        );
        require(
            _timeGoal < 60 days + block.timestamp,
            "Error, time goal must be less than 60 days"
        );
        require(bytes(_name).length > 0, "Error, name must exist");
        require(
            bytes(_description).length > 0,
            "Error, description must exist"
        );
        require(bytes(_imgHash).length > 0, "Error, image hash must exist");
        Project project = new Project(
            _name,
            _description,
            _imgHash,
            address(msg.sender),
            _fundGoal,
            _timeGoal,
            block.timestamp,
            dai
        );
        projectCount++;
        projects[projectCount] = project;
        emit ProjectMade(
            projectCount,
            _name,
            _description,
            _imgHash,
            msg.sender,
            _fundGoal,
            _timeGoal,
            block.timestamp
        );
    }

    function cancel(uint256 _id) external {
        (uint256 _fundGoal, uint256 _timeGoal, uint256 _timestamp) = projects[
            _id
        ].cancel(msg.sender);
        emit Cancel(_id, msg.sender, _fundGoal, _timeGoal, _timestamp);
    }

    function contribute(
        uint256 _id,
        uint256 _amount,
        uint256 _deadline
    ) external payable {
        require(_amount > 0, "Error, DAI amount must be greater than 0");
        bool swapped;
        if (msg.value > 0) {
            convertEthToExactDai(
                _id,
                _amount,
                _deadline,
                msg.sender,
                msg.value
            );
            swapped = true;
        }
        (
            bool _newSupporter,
            uint256 _raisedFunds,
            uint256 _timestamp
        ) = projects[_id].contribute(_amount, msg.sender, swapped);
        emit Contribution(
            _id,
            msg.sender,
            _newSupporter,
            _raisedFunds,
            _amount,
            _timestamp
        );
    }

    function disburse(uint256 _id) external {
        (
            uint256 _disburseAmount,
            uint256 _feeAmount,
            uint256 _timestamp
        ) = projects[_id].disburse(feePercent, feeAccount, msg.sender);
        emit Disburse(_id, msg.sender, _disburseAmount, _feeAmount, _timestamp);
    }

    function claimRefund(uint256 _id) external {
        (
            uint256 _raisedFunds,
            uint256 _supporterFunds,
            uint256 _timestamp
        ) = projects[_id].claimRefund(msg.sender);
        emit Refund(_id, msg.sender, _raisedFunds, _supporterFunds, _timestamp);
    }
}
