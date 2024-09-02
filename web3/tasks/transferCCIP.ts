import { task } from "hardhat/config";
import { CCIP_PARAMS } from "../scripts/params/CCIPParams";
import { TokenTransferor__factory } from "../typechain";

task("transferCCIPFee", "Transfer tokens using CCIP")
    .addParam("destinationChainSelector", "The destination chain selector")
    .addParam("tokenTransferorAddress", "The address of the TokenTransferor contract")
    .addParam("receiver", "The receiver address")
    .addParam("token", "The token address")
    .addParam("amount", "The amount of tokens to transfer")
    .setAction(async (taskArgs, hre) => {
        const [deployer] = await hre.ethers.getSigners();
        console.log(`Using account: ${await deployer.getAddress()}`);
        const chainId = hre.network.config.chainId?.toString();
        if (!chainId || !(chainId in CCIP_PARAMS)) {
            throw new Error("Unsupported chain");
        }

        const amount = hre.ethers.parseUnits(taskArgs.amount, 6)
        const destinationChainParams = CCIP_PARAMS[chainId as keyof typeof CCIP_PARAMS];
        const tokenTransferor = TokenTransferor__factory.connect(taskArgs.tokenTransferorAddress, deployer);

        // USDC contract approval
        const usdcContract = await hre.ethers.getContractAt("IERC20", taskArgs.token);
        console.log(`Approving ${amount} USDC(in uint) for TokenTransferor contract`);
        const approveTx = await usdcContract.approve(taskArgs.tokenTransferorAddress, amount);
        console.log(`Approval transaction sent: ${approveTx.hash}`);
        await approveTx.wait();
        console.log("Approval transaction confirmed");

        const tx = await tokenTransferor.transferTokensPayLINK(
            taskArgs.receiver,
            taskArgs.token,
            amount
        ).catch((error) => {
            console.log(error)
        }).then()

        if (tx) {
            console.log(`Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log("Transaction confirmed");
        }
    });