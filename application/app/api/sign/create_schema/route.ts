import { privateKeyToAccount } from 'viem/accounts'

import { DataLocationOnChain, delegateSignAttestation, EvmChains, SchemaResult, SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const privateKey = '0x' + process.env.PRIVATE_KEY as `0x${string}`
    const schemas: SchemaResult[] = []

    const chains: string[] = [EvmChains.baseSepolia, EvmChains.polygonAmoy, EvmChains.sepolia]

    chains.forEach(async chain => {
        let client = new SignProtocolClient(SpMode.OnChain, {
            chain: chain as EvmChains,
            account: privateKeyToAccount(privateKey)
        });

        // const result = await client.createSchema({
        //     name: "Item",
        //     description: "Item",
        //     dataLocation: DataLocationOnChain.ONCHAIN,
        //     data: [                
        //         { name: "price", type: "uint256" },
        //         { name: "key", type: "string" },
        //         { name: "id", type: "string" },
        //         { name: "paymentAddress", type: "address" },
        //         { name: "version", type: "string" },
        //     ],
        //     registrant: privateKeyToAccount(privateKey).address,
        // })

        const result = await client.createSchema({
            name: "OwnedItem",
            description: "OwnedItem",
            dataLocation: DataLocationOnChain.ONCHAIN,
            data: [
                { name: "key", type: "string" },
                { name: "id", type: "string" },
            ],
            registrant: privateKeyToAccount(privateKey).address,
        })
        console.log(result.schemaId)
    })

    return NextResponse.json({ message: "success" });
}