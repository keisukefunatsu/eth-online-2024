import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv'

dotenv.config()

import "./tasks/transferCCIP"

const PRIVATE_KEY = process.env.PRIVATE_KEY ?? ""

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            viaIR: true,
            optimizer: {
                enabled: true,
                runs: 200
            },
            debug: {
                revertStrings: "debug" 
            }
        }
    },
    networks: {
        amoy: {
            url: "https://polygon-amoy-bor-rpc.publicnode.com",
            chainId: 80002,
            accounts: [`0x${PRIVATE_KEY}`],
        },
        fuji: {
            url: "https://ava-testnet.public.blastapi.io/ext/bc/C/rpc	",
            chainId: 43113,
            accounts: [`0x${PRIVATE_KEY}`],
        },
        sepolia: {
            url: "https://1rpc.io/sepolia",
            chainId: 11155111,
            accounts: [`0x${PRIVATE_KEY}`],
        },
        "base-sepolia": {
            url: "https://rpc.ankr.com/base_sepolia",
            chainId: 84532,
            accounts: [`0x${PRIVATE_KEY}`],
        },
    },
    typechain: {
        outDir: 'typechain',
    },

};

export default config;
