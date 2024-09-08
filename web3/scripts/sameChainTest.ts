import hre from "hardhat";
import { Attester__factory } from "../typechain";
import { CCIP_PARAMS } from "./params/CCIPParams";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const chainId = hre.network.config.chainId?.toString() as keyof typeof CCIP_PARAMS;
    if (!chainId || !(chainId in CCIP_PARAMS)) {
        throw new Error("Unsupported chain");
    }
    const usdcContractAddress = CCIP_PARAMS[chainId].USDC_TOKEN_ADDRESS
    const spContractAddress = CCIP_PARAMS[chainId].SP_CONTRACT_ADDRESS
    console.log(`Using account: ${await deployer.getAddress()}`);
    const Attester = await hre.ethers.getContractFactory('Attester')
    const attester = await Attester.deploy(
        spContractAddress, 
        BigInt(0xdf),
        usdcContractAddress,
        "SignEverythingItem_v1"
    )
    await attester.waitForDeployment()
    console.log('contract deployed to: ', await attester.getAddress())

    const amount = hre.ethers.parseUnits('0.001', 6)

    // USDC contract approval
    const abi = ["function transfer(address to, uint amount)", "function approve(address spender, uint amount)"];        
    const usdcContract = await hre.ethers.getContractAt(abi, usdcContractAddress);
    console.log(`Approving ${amount} USDC(in uint) for TokenTransferor contract`);
    const approveTx = await usdcContract.approve(await attester.getAddress(), amount);
    console.log(`Approval transaction sent: ${approveTx.hash}`);
    await approveTx.wait();
    console.log("Approval transaction confirmed");

    const tx = await attester.paymentAndAttest(
        BigInt(0x1a5),
    ).catch((error) => {
        console.log(error)
    }).then()
    
    if (tx) {
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log("Transaction confirmed");
    }
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

