import { IndexService } from "@ethsign/sp-sdk";
import { decodeAttestations } from "../lib/parse";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
    const indexingValue = req.nextUrl.searchParams.get('indexingValue')
    if (!indexingValue) {
        return NextResponse.json({ error: 'indexingValue is required' }, { status: 400 })
    }
    const env = process.env.ETH_NETWORK as 'testnet' | 'mainnet' ?? 'testnet'
    const indexService = new IndexService(env);
    const res = await indexService.queryAttestationList({
        page: 1,
        indexingValue,       
    });
    const attestations = decodeAttestations(res)
    return NextResponse.json({ attestations });
}
