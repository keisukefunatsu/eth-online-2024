import hre from "hardhat";
import { AttestTest__factory } from "../typechain";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const AttestTest = await hre.ethers.getContractFactory('AttestTest')
    const contract = await AttestTest.deploy('0x4e4af2a21ebf62850fD99Eb6253E1eFBb56098cD')
    await contract.waitForDeployment()
    console.log('contract deployed to: ', await contract.getAddress())


    // const contract = AttestTest__factory.connect("0xc72f2a1c5a87937735ccd702494c712aef99216b", deployer)
    const a = await contract.testFlow(684).catch((error) => {
        console.log(error)
    })
    // const abiCoder = new hre.ethers.AbiCoder();
    // const data = abiCoder.decode(
    //     [{ components: att.schema.data, 
    //         type: "tuple" }],
    //     a[9] as `0x${string}`
    // );
    // parsedData = data[0];

    // console.log(decodedData)
    if(a) {
        console.log(a.hash)
    }
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});