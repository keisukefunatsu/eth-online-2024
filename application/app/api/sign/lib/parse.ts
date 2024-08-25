import { AttestationInfo, PageInfo } from "@ethsign/sp-sdk/dist/types/indexService";
import { decodeAbiParameters } from "viem";

export const decodeAttestations = (res: PageInfo & {
    rows: AttestationInfo[];
}) => {
    const attestations = res.rows.map(att => {
        if (!att.data || att.revoked) return undefined;
        let parsedData: any = {};
        if (att.mode === "onchain") {
            try {
                const data = decodeAbiParameters(
                    [att.dataLocation === "onchain" ? { components: att.schema.data, type: "tuple" } : { type: "string" }],
                    att.data as `0x${string}`
                );
                parsedData = data[0]
                return {
                    chainId: att.chainId,
                    transactionHash: att.transactionHash,
                    id: att.id,
                    schemaId: att.fullSchemaId,
                    attester: att.attester,
                    revoked: att.revoked,
                    recipients: att.recipients,
                    data: convertBigIntValues(parsedData)
                }
            } catch (error) {
                // Looking for a regular schema format if the nested parse fails
                try {
                    const data = decodeAbiParameters(
                        att.dataLocation === "onchain" ? att.schema.data : [{ type: "string" }],
                        att.data as `0x${string}`
                    );
                    const obj: any = {};
                    data.forEach((item: any, i: number) => {
                        obj[att.schema.data[i].name] = item;
                    });
                    parsedData = obj;
                    return {
                        chainId: att.chainId,
                        transactionHash: att.transactionHash,
                        id: att.id,
                        schemaId: att.fullSchemaId,
                        attester: att.attester,
                        revoked: att.revoked,
                        recipients: att.recipients,
                        data: convertBigIntValues(parsedData)
                    }
                } catch (error) {
                    return undefined;
                }
            }
        } else {
            // Try parsing as a string (off-chain attestation)
            try {
                parsedData = JSON.parse(att.data);
                return parsedData
            } catch (error) {
                return undefined;
            }
        }
    }).filter(Boolean)
    return attestations
}

const convertBigIntValues = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(convertBigIntValues);
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        const value = obj[key];
        newObj[key] = typeof value === 'bigint' ? value.toString() : convertBigIntValues(value);
    }
    return newObj;
}
