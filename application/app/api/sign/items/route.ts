import { IndexService } from "@ethsign/sp-sdk";
import { decodeAttestations } from "../lib/parse";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
    const indexingValue = req.nextUrl.searchParams.get('indexingValue')
    const env = process.env.ETH_NETWORK as 'testnet' | 'mainnet' ?? 'testnet'
    const indexService = new IndexService(env);

    const res = await indexService.queryAttestationList({
        page: 1,
        indexingValue: indexingValue ?? "",
    });

    if (!res) {
        return NextResponse.json({ attestaions: [] })
    }
    const attestations = decodeAttestations(res)
    return NextResponse.json({ attestations });
}
