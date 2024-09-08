type ChainInfo = {
    CHAIN_NAME: string;
    DESTINATION_CHAIN_SELECTOR: string;
    USDC_TOKEN_ADDRESS: string;
    TOKEN_TRANSFEROR_ADDRESS: string;
    SAMECHAIN_ATTESTER_ADDRESS: string,
};

type AddressBook = {
    [key: string]: ChainInfo;
};

export const addressBook: AddressBook = {
    '84532': {
        CHAIN_NAME: 'base_sepolia',
        DESTINATION_CHAIN_SELECTOR: '10344971235874465080',
        USDC_TOKEN_ADDRESS: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        TOKEN_TRANSFEROR_ADDRESS: "0x13f0AfA9A37A81d3a7D9325E79f4A580A5ff7bf4",
        SAMECHAIN_ATTESTER_ADDRESS: "0x5876997097e3310Dea9a178e26eE582d05e6bade",
    },
    '11155111': {
        CHAIN_NAME: 'sepolia',
        DESTINATION_CHAIN_SELECTOR: '16015286601757825753',
        USDC_TOKEN_ADDRESS: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        TOKEN_TRANSFEROR_ADDRESS: "0x34db52B8AB3C80B7532a9DE76f13659a1f75736E",
        SAMECHAIN_ATTESTER_ADDRESS: "0x4e01b8fB278DDC4407b31E2E937CF1b3B34f4337",
    },
    '80002': {
        CHAIN_NAME: 'amoy',
        DESTINATION_CHAIN_SELECTOR: '16281711391670634445',
        USDC_TOKEN_ADDRESS: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
        TOKEN_TRANSFEROR_ADDRESS: "0x58aa60ACd3Ab94782B5e62878B58C9D2Dcd27860",
        SAMECHAIN_ATTESTER_ADDRESS: "0x00c0975D098bc17Af0fd32938357582E17AAE32E",
    },
};

export const getAddressesByChainId = (chainId: string) => {
    const chainInfo = addressBook[chainId];
    if (!chainInfo) {
        throw new Error(`Chain ID ${chainId} not found in address book`);
    }
    return {
        usdcTokenAddress: chainInfo.USDC_TOKEN_ADDRESS,
        tokenTransferorAddress: chainInfo.TOKEN_TRANSFEROR_ADDRESS
    };
};