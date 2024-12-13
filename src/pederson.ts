export class PedersenParams {
  n: bigint;
  s: bigint;
  t: bigint;

  constructor(n: bigint, s: bigint, t: bigint) {
    this.n = n;
    this.s = s;
    this.t = t;
  }
}
