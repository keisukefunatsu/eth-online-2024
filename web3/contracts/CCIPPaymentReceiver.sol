// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";

contract Payment {
    address public allowedToken; 
    mapping(bytes32 => bool) public receipts; 

    event PaymentReceived(
        address indexed userAddress,
        string attestationId,
        uint256 amount,
        address token,
        uint256 tokenAmount
    );

    constructor(address _allowedToken) {
        allowedToken = _allowedToken; 
    }

    function processPayment(
        bytes calldata data,
        address token,
        uint256 tokenAmount
    ) external {
        require(token == allowedToken, "Token not allowed"); 

        // データの復元
        (address userAddress, string memory attestationId, uint256 amount) = abi.decode(
            data,
            (address, string, uint256)
        );

        require(tokenAmount >= amount, "Insufficient token amount"); 

        bytes32 receiptId = keccak256(abi.encode(userAddress, attestationId, amount));
        receipts[receiptId] = true;

        emit PaymentReceived(userAddress, attestationId, amount, token, tokenAmount);
    }
}