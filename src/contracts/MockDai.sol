//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockDai is ERC20 {
	constructor() ERC20('Dai Stablecoin', 'Dai') {}
	function faucet (address _recipient, uint256 _amount) public {
		_mint(_recipient, _amount);
	}
}

