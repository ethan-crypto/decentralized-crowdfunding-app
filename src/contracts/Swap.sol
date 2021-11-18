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
    address public weth9;
    IUniSwapRouter public constant swapRouter = IUniSwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IQuoter public constant quoter = IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    event Converted (
        address _user,
        uint256 _amountOut
    );
    constructor(address _dai, address _weth9) {
        dai = _dai;
        weth9 = _weth9;
    }

    // Used to accept swapRouter refund 
    receive() external payable {
    }
    // This function is a read only function but can't be marked as view because it relies on non-view functiions to compute the result.
    function getEthInputAmount(uint _amountOut) external payable returns(uint256 _amountIn) {
        require(_amountOut > 0, "Error, DAI amount out must be greater than 0");
        address _tokenIn = weth9;
        address _tokenOut = dai;
        uint24 fee = 500;
        uint160 sqrtPriceLimitX96 = 0;
        _amountIn = quoter.quoteExactOutputSingle(
            _tokenIn,
            _tokenOut,
            fee,
            _amountOut,
            sqrtPriceLimitX96
        );
    }

    function convertEthToExactDai(uint256 _amountOut) external payable {
        ISwapRouter.ExactOutputSingleParams memory params =
            ISwapRouter.ExactOutputSingleParams({
                tokenIn: weth9,
                tokenOut: dai,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountOut: _amountOut,
                amountInMaximum: msg.value,
                sqrtPriceLimitX96: 0
            });

        swapRouter.exactOutputSingle(params);
        swapRouter.refundETH();
        // Send the refunded ETH back to sender
        (bool success, ) = msg.sender.call{value: address(this).balance }('');
        require(success, "Transfer failed");
        emit Converted (msg.sender, _amountOut);
    }
}
