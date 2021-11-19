//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
pragma abicoder v2;

import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol';

interface IUniSwapRouter is ISwapRouter {
    function refundETH() external payable;
}

contract Swap {
    uint24 public constant poolFee = 3000;
    address public dai;
    address public weth;
    IUniSwapRouter public constant swapRouter = IUniSwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    event Converted (
        address user,
        uint256 amountOut,
        uint256 amountInMaximum,
        uint256 amountIn
    );
    constructor(address _dai, address _weth) {
        dai = _dai;
        weth = _weth;
    }

    // Used to accept swapRouter refund 
    receive() external payable {
    }
    // This function is a read only function but can't be marked as view because it relies on non-view functiions to compute the result.
    function getEthInputAmount(uint256 _amountOut) external payable returns(uint256 _amountIn) {
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

    function convertEthToExactDai(uint256 _daiAmountOut, uint256 _deadline) external payable {
        require(_daiAmountOut > 0, "Error, DAI amount out must be greater than 0");
        require(msg.value > 0, "Error, ETH amount must be greater than 0");
        address _tokenIn = weth;
        address _tokenOut = dai;
        uint24 _fee = poolFee;
        address _recipient = msg.sender;
        uint256 _amountInMaximum = msg.value;
        uint160 _sqrtPriceLimitX96 = 0;
        ISwapRouter.ExactOutputSingleParams memory params =
            ISwapRouter.ExactOutputSingleParams(
                _tokenIn,
                _tokenOut,
                _fee,
                _recipient,
                _deadline,
                _daiAmountOut,
                _amountInMaximum,
                _sqrtPriceLimitX96
            );

        uint256 _amountIn = swapRouter.exactOutputSingle{value: msg.value}(params);
        swapRouter.refundETH();
        // Send the refunded ETH back to sender
        (bool success, ) = msg.sender.call{value: address(this).balance }('');
        require(success, "Transfer failed");
        emit Converted (msg.sender, _daiAmountOut, msg.value, _amountIn);
    }
}
