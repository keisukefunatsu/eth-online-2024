import { privateKeyToAccount } from 'viem/accounts'

import { EvmChains, SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const privateKey = '0x' + process.env.PRIVATE_KEY as `0x${string}`
    const chain = req.nextUrl.searchParams.get('chain') as EvmChains
    const attestationId = req.nextUrl.searchParams.get('attestationId') as string
    const client = new SignProtocolClient(SpMode.OnChain, {
        chain: chain,
        account: privateKeyToAccount(privateKey),
    });

    const res = await client.revokeAttestation(attestationId, {
        reason: "not used"
    });
    console.log(res)
    return NextResponse.json({ message: `revoke ${chain} ${attestationId} success` });
}