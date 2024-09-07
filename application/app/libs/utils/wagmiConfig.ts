import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { baseSepolia, polygonAmoy, sepolia } from 'wagmi/chains'


// 1. Get projectId from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
if (!projectId) {
    throw new Error('NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is required')
}

// 2. Create wagmiConfig
const metadata = {
    name: 'Web3Modal',
    description: 'Web3Modal Example',
    url: 'https://web3modal.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const chains = [baseSepolia, sepolia, polygonAmoy] as const
export const config = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
})