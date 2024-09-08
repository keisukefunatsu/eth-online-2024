import { privateKeyToAccount } from 'viem/accounts'

import { EvmChains, SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
    return NextResponse.json({ message: "Hello, world!" });
}

export async function POST(req: NextRequest) {
    const privateKey = '0x' + process.env.PRIVATE_KEY as `0x${string}`
    const body = await req.json();
    if (!body.price || !body.key || !body.paymentAddress) {
        return NextResponse.json({ error: "price and key and address are required" }, { status: 400 });
    }

    const { price, key, paymentAddress } = body;
    const VERSION = "SignEverythingItem_v1"
    const chains: {
        schemaId: string,
        chain: EvmChains
    }[] = [
            { schemaId: "0x26b", chain: EvmChains.baseSepolia },
            { schemaId: "0x52", chain: EvmChains.polygonAmoy },
            { schemaId: "0x1bd", chain: EvmChains.sepolia }]

    const id = nanoid()
    chains.forEach(async chain => {
        const client = new SignProtocolClient(SpMode.OnChain, {
            chain: chain.chain,
            account: privateKeyToAccount(privateKey)
        });

        const res = await client.createAttestation({
            schemaId: chain.schemaId,
            data: {                 
                price,
                key,
                id,
                paymentAddress,
                version: VERSION,
            },
            indexingValue: VERSION,
            recipients: [paymentAddress as `0x${string}`]
        });
        
        console.log(chain.chain, res.attestationId)
    })
    return NextResponse.json({ message: "success" });
}