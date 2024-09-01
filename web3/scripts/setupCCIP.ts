import hre from 'hardhat'
import { CCIP_PARAMS } from './CCIPParams';

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    Object.entries(CCIP_PARAMS).forEach(async ([chainId, params]) => {
        const { CHAIN_NAME, DESTINATION_CHAIN_SELECTOR, ROUTER_ADDRESS, LINK_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS } = params;
        const _chainId = hre.network.config.chainId;
        if (_chainId?.toString() !== chainId) {
            return
        }

        console.log(`Deploying on ${CHAIN_NAME} with account: ${await deployer.getAddress()}`);

        // TokenTransferorコントラクトをデプロイ
        const TokenTransferor = await hre.ethers.getContractFactory("TokenTransferor");
        const tokenTransferor = await TokenTransferor.deploy(ROUTER_ADDRESS!, LINK_TOKEN_ADDRESS!);
        const deployResult = await tokenTransferor.waitForDeployment();
        console.log(`TokenTransferor deployed to: ${await deployResult.getAddress()} on ${CHAIN_NAME}`);
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});