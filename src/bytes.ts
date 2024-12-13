export const bytesToBigInt = (bytes: Uint8Array): bigint => {
    return BigInt("0x" + Buffer.from(bytes).toString("hex"));
}
