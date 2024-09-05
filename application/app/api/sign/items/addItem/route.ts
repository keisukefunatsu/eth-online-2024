import { privateKeyToAccount } from 'viem/accounts'

import { DataLocationOnChain, delegateSignAttestation, EvmChains, SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
    return NextResponse.json({ message: "Hello, world!" });
}

export async function POST(req: NextRequest) {
    const privateKey = '0x' + process.env.PRIVATE_KEY as `0x${string}`
    const body = await req.json();
    if (!body.price || !body.key) {
        return NextResponse.json({ error: "price and key are required" }, { status: 400 });
    }

    const { price, key } = body;

    const chains: {
        schemaId: string,
        chain: EvmChains
    }[] = [
            { schemaId: "0x1c6", chain: EvmChains.baseSepolia },
            { schemaId: "0x34", chain: EvmChains.polygonAmoy },
            { schemaId: "0xdb", chain: EvmChains.sepolia }]

    const id = nanoid()
    chains.forEach(async chain => {
        const client = new SignProtocolClient(SpMode.OnChain, {
            chain: chain.chain,
            account: privateKeyToAccount(privateKey)
        });

        const res = await client.createAttestation({
            schemaId: chain.schemaId,
            data: { price: price, key: key, id },
            indexingValue: id,
        });

        console.log(chain.chain, res.attestationId)
    })
    return NextResponse.json({ message: "success" });
}