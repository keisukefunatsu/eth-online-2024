import { IndexService } from "@ethsign/sp-sdk";
import { decodeAttestations } from "../lib/parse";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
    const schemaId = req.nextUrl.searchParams.get("schemaId")
    if (!schemaId) {
        return NextResponse.json({ attestations: [] });
    }
    const env = process.env.ETH_NETWORK as 'testnet' | 'mainnet' ?? 'testnet'
    const indexService = new IndexService(env);
    const res = await indexService.queryAttestationList({
        page: 1,
        indexingValue: "684"
    });

    const attestations = decodeAttestations(res)
    return NextResponse.json({ attestations });
}
