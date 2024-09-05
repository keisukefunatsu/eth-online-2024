// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ISP} from "@ethsign/sign-protocol-evm/src/interfaces/ISP.sol";
import {Attestation} from "@ethsign/sign-protocol-evm/src/models/Attestation.sol";
import {Schema} from "@ethsign/sign-protocol-evm/src/models/Schema.sol";
import {DataLocation} from "@ethsign/sign-protocol-evm/src/models/DataLocation.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract AttestTest {
    ISP public spContract;
    uint64 public schemaId;  
    // イベントの定義
    event Debug(string message);
    event DebugUint256(uint256 value);
    event DebugString(string value);

    constructor(address _spContractAddress) {
        spContract = ISP(_spContractAddress);
        schemaId = 456;
    }

    function testFlow(
        uint64 attestationId,
        address to
    ) external returns (uint256, string memory) {
        Attestation memory attestation = spContract.getAttestation(
            attestationId
        );

        (uint256 price, string memory key, string memory id) = abi.decode(
            attestation.data,
            (uint256, string, string)
        );

        // Create a new attestation
        bytes memory newData = abi.encode(key, id);
        bytes[] memory recipients = new bytes[](1);
        recipients[0] = abi.encode(to);
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
