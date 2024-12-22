import { CustomError } from "ts-custom-error";
import { checkScalarsRangeAndCoprime } from "./math/arithmetic";
import { SerializableObject } from "./object";

class InvalidPedersenParamsError extends CustomError {
  constructor(msg: string) {
    super(msg);
  }
}

export class PedersenParams extends SerializableObject  {
  public readonly n: bigint;
  public readonly s: bigint;
  public readonly t: bigint;
  public readonly lambda: bigint;

  constructor({ n, s, t, lambda }: { n: bigint; s: bigint; t: bigint; lambda: bigint }) {
    super()
    this.n = n;
    this.s = s;
    this.t = t;
    this.lambda = lambda;
  }

  public static validate(params: PedersenParams): void {
    if (!params.n || !params.s || !params.t) {
      throw new InvalidPedersenParamsError(`Pederson parameters must be non-zero`);
    }

    if (!checkScalarsRangeAndCoprime(params.n, params.s, params.t)) {
      throw new InvalidPedersenParamsError(`Pederson parameters must be in range [1,…,N-1] and co-prime to N`);
    }

    if (params.s == params.t) {
      throw new InvalidPedersenParamsError(`Pederson parameters s and t must be different`);
    }
  }
}


