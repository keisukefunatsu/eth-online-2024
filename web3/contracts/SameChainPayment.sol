// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {ISP} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import {Attestation} from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import {Schema} from "@ethsign/sign-protocol-evm/src/models/Schema.sol";
import {DataLocation} from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract Attester {
    ISP public spContract;
    uint64 public schemaId;
    address public token;
    event Debug(string message);
    event DebugUint256(uint256 value);
    event DebugString(string value);
    address public paymentAddress;

    constructor(address _spContractAddress, uint64 _schemaId, address _token) {
        spContract = ISP(_spContractAddress);
        schemaId = _schemaId;
        token = _token;
    }

    function paymentAndAttest(
        uint64 attestationId
    ) external returns (uint256, string memory) {
        Attestation memory attestation = spContract.getAttestation(
            attestationId
        );

        (
            uint256 price,
            string memory key,
            string memory id,
            address _paymentAddress
        ) = abi.decode(attestation.data, (uint256, string, string, address));
        paymentAddress = _paymentAddress;

        // get token balance
        uint256 initialBalance = IERC20(token).balanceOf(address(this));

        // transfer ERC20 token
        IERC20(token).transferFrom(msg.sender, address(this), price);

        // calculate token amount sent
        uint256 finalBalance = IERC20(token).balanceOf(address(this));
        uint256 amount = finalBalance - initialBalance;

        // confirm that the amount is greater than or equal to the price
        require(
            price <= amount,
            "Amount must be greater than or equal to price"
        );

        // Create a new attestation
        bytes memory newData = abi.encode(key, id);
        bytes[] memory recipients = new bytes[](1);
        recipients[0] = abi.encode(msg.sender);
        Attestation memory newAttestation = Attestation({
            schemaId: schemaId,
            attester: address(this),
            data: newData,
            validUntil: 0,
            linkedAttestationId: 0,
            revoked: false,
            attestTimestamp: 0,
            revokeTimestamp: 0,
            dataLocation: DataLocation.ONCHAIN,
            recipients: recipients
        });

        string memory sender = Strings.toHexString(
            uint256(uint160(msg.sender)),
            20
        );
        string memory uniqueKey = string(abi.encodePacked(sender, id));

        // Call the attest function
        spContract.attest(newAttestation, uniqueKey, "", ""); // Ensure the parameters match the function signature

        return (price, key);
    }
}
