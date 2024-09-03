// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ISP} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import {Attestation} from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import {Schema} from "@ethsign/sign-protocol-evm/src/models/Schema.sol";
import {DataLocation} from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract AttestTest {
    ISP public spContract;

    // イベントの定義
    event Debug(string message);
    event DebugUint256(uint256 value);
    event DebugString(string value);

    constructor(address _spContractAddress) {
        spContract = ISP(_spContractAddress);
    }

    function testFlow(
        uint64 attestationId
    ) external returns (uint256, string memory) {
        Attestation memory attestation = spContract.getAttestation(
            attestationId
        );

        (uint256 price, string memory key) = abi.decode(
            attestation.data,
            (uint256, string)
        );        

        // Create a new attestation
        bytes memory newData = abi.encode(10000000000000000, "ItemName");
        bytes[] memory recipients = new bytes[](1);
        recipients[0] = abi.encode(address(this));
        Attestation memory newAttestation = Attestation({
            schemaId: attestation.schemaId,
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
        // TODO: Create Unique key for Query Owned Items
        // Call the attest function
        spContract.attest(newAttestation, sender, "", ""); // Ensure the parameters match the function signature

        return (price, key);
    }

    function uintToString(uint64 value) internal pure returns (string memory) {
        // Convert uint64 to string
        if (value == 0) {
            return "0";
        }
        uint64 temp = value;
        uint64 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint64(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
