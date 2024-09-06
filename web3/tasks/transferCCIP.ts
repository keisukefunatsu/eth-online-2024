import { task } from "hardhat/config";
import { CCIP_PARAMS } from "../scripts/params/CCIPParams";
import { TokenTransferor__factory } from "../typechain";

task("transferCCIPFee", "Transfer tokens using CCIP")
    .addParam("destinationChainSelector", "The destination chain selector")
    .addParam("tokenTransferorAddress", "The address of the TokenTransferor contract")    .addParam("amount", "The amount of tokens to transfer")
    .addParam("attestationId", "The attestation ID")
    .setAction(async (taskArgs, hre) => {
        const [deployer] = await hre.ethers.getSigners();
        console.log(`Using account: ${await deployer.getAddress()}`);
        const chainId = hre.network.config.chainId?.toString() as keyof typeof CCIP_PARAMS;
        if (!chainId || !(chainId in CCIP_PARAMS)) {
            throw new Error("Unsupported chain");
        }

        const usdcContractAddress = CCIP_PARAMS[chainId].USDC_TOKEN_ADDRESS
        const amount = hre.ethers.parseUnits(taskArgs.amount, 6)
        const tokenTransferor = TokenTransferor__factory.connect(taskArgs.tokenTransferorAddress, deployer);

        // USDC contract approval
        const abi = ["function transfer(address to, uint amount)", "function approve(address spender, uint amount)"];        
        const usdcContract = await hre.ethers.getContractAt(abi, usdcContractAddress);
        console.log(`Approving ${amount} USDC(in uint) for TokenTransferor contract`);
        const approveTx = await usdcContract.approve(taskArgs.tokenTransferorAddress, amount);
        console.log(`Approval transaction sent: ${approveTx.hash}`);
        await approveTx.wait();
        console.log("Approval transaction confirmed");

        const tx = await tokenTransferor.transferTokensPayLINK(
            taskArgs.destinationChainSelector,
            usdcContractAddress,
            amount,
            BigInt(taskArgs.attestationId)
        ).catch((error) => {
            console.log(error)
        }).then()

        if (tx) {
            console.log(`Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log("Transaction confirmed");
        }
    });