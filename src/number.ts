import { bytesToNumberBE, utf8ToBytes } from "@noble/curves/abstract/utils";
import type { PartyId } from "./types";

export const idToBigInt = (id: PartyId): bigint => {
    return bytesToNumberBE(utf8ToBytes(id));
}

export const bigIntToHex = (n: bigint): string => {
    let hex = n.toString(16);
    return (hex.length % 2) ? `0${hex}` : hex
}