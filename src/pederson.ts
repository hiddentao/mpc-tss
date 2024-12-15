export class PedersenParams {
  public readonly n: bigint;
  public readonly s: bigint;
  public readonly t: bigint;
  public readonly lambda: bigint;

  constructor({ n, s, t, lambda }: { n: bigint; s: bigint; t: bigint; lambda: bigint }) {
    this.n = n;
    this.s = s;
    this.t = t;
    this.lambda = lambda;
  }
}
