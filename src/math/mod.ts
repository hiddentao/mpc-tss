// TODO: This is the original implementation from other repo
// const modSymmetric1 = (x: bigint, n: bigint): bigint => {
//   const absMod = (abs(x) as bigint) % n;
//   const negated = modMultiply([-absMod], n);
//   if (negated <= absMod) {
//     return -negated;
//   } else {
//     return absMod;
//   }
// }

const modSymmetric2 = (x: bigint, n: bigint): bigint => {
  const absMod = ((x % n) + n) % n;
  return absMod > n / 2n ? absMod - n : absMod;
};


export const modSymmetric = modSymmetric2