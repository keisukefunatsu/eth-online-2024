import { privateKeyToAccount } from 'viem/accounts'

import { delegateSignAttestation, EvmChains, SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    return NextResponse.json({ message: "Hello, world!" });
}

export async function POST(req: NextRequest) {
    const env = process.env.ETH_NETWORK as 'testnet' | 'mainnet' ?? 'testnet'
    const privateKey = '0x' + process.env.PRIVATE_KEY as `0x${string}`
    const body = await req.json();
    if (!body.price || !body.key) {
        return NextResponse.json({ error: "price and key are required" }, { status: 400 });
    }

    const { price, key } = body;

    const client = new SignProtocolClient(SpMode.OnChain, {
        chain: EvmChains.baseSepolia,
        account: privateKeyToAccount(privateKey)
    });

    // // TODO: avoid item duplication
    const res = await client.createAttestation({
        schemaId: "0xd0",
        data: { price: price, key: key },
        //  linked with attesation ID
        indexingValue: "aaa 111",
    });

    // const res = await delegateSignAttestation( {
    //     schemaId: "0xd0",
    //     data: { price: price, key: key },
    //     indexingValue: "delegateSeller",
    // }, {
    //     chain: EvmChains.baseSepolia,
    //     delegationAccount: privateKeyToAccount(privateKey), 
    // });
    return NextResponse.json(res);
}