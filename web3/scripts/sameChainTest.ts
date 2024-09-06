import hre from "hardhat";
import { AttestTest__factory } from "../typechain";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const AttestTest = await hre.ethers.getContractFactory('AttestTest')
    const contract = await AttestTest.deploy('0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD', BigInt(0x1c8))
    await contract.waitForDeployment()
    console.log('contract deployed to: ', await contract.getAddress())


    // const contract = AttestTest__factory.connect("0x7613252de56305A563d2Ba73E05B55BAe9a64ebc", deployer)
    const a = await contract.testFlow(0x483).catch((error) => {
        console.log(error)
    })

    if(a) {
        console.log(a.hash)
    }
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});