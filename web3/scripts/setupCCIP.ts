import hre from 'hardhat'
import { CCIP_PARAMS } from './params/CCIPParams';

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    Object.entries(CCIP_PARAMS).forEach(async ([chainId, params]) => {
        const { CHAIN_NAME, DESTINATION_CHAIN_SELECTOR, ROUTER_ADDRESS, LINK_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS } = params;
        const _chainId = hre.network.config.chainId;
        if (_chainId?.toString() !== chainId) {
            return
        }

        console.log(`Deploying on ${CHAIN_NAME} with account: ${await deployer.getAddress()}`);

        // Deploy token transferor
        const TokenTransferor = await hre.ethers.getContractFactory("TokenTransferor");
        const tokenTransferor = await TokenTransferor.deploy(ROUTER_ADDRESS!, LINK_TOKEN_ADDRESS!);
        const deployResult = await tokenTransferor.waitForDeployment();
        console.log(`TokenTransferor deployed to: ${await deployResult.getAddress()} on ${CHAIN_NAME}`);

        
        // Allow all destination chain selectors
        for (const [, chainParams] of Object.entries(CCIP_PARAMS)) {
            if (chainParams.DESTINATION_CHAIN_SELECTOR !== DESTINATION_CHAIN_SELECTOR) {
                await tokenTransferor.allowlistDestinationChain(BigInt(chainParams.DESTINATION_CHAIN_SELECTOR), true);
                console.log(`Allowed destination chain: ${chainParams.CHAIN_NAME} (${chainParams.DESTINATION_CHAIN_SELECTOR})`);
            }
        }

        // send LINK token for fee token
        const linkAmount = hre.ethers.parseUnits("0.1", 18); 
        const linkToken = await hre.ethers.getContractAt("IERC20", LINK_TOKEN_ADDRESS);
        await linkToken.transfer(await tokenTransferor.getAddress(), linkAmount);
        console.log(`Transferred ${hre.ethers.formatUnits(linkAmount, 18)} LINK to TokenTransferor contract`);        
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});