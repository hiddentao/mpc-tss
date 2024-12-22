import { CustomError } from "ts-custom-error";
import type { HashableInput, HashableInputFactory } from "./hasher";
import { checkScalarsRangeAndCoprime } from "./math/arithmetic";
import { SerializableObject } from "./object";

class InvalidPedersenParamsError extends CustomError {
  constructor(msg: string) {
    super(msg);
  }
}

export class PedersenPublicParams extends SerializableObject implements HashableInputFactory  {
  public readonly n: bigint;
  public readonly s: bigint;
  public readonly t: bigint;

  constructor({ n, s, t }: { n: bigint; s: bigint; t: bigint }) {
    super()
    this.n = n;
    this.s = s;
    this.t = t;
  }
  public getHashableInputs(): HashableInput[] {
    return [this.n, this.s, this.t]
  }

  public static validate(params: PedersenPublicParams): void {
    if (!params.n || !params.s || !params.t) {
      throw new InvalidPedersenParamsError(`Pederson public parameters must be non-zero`);
    }

    if (!checkScalarsRangeAndCoprime(params.n, params.s, params.t)) {
      throw new InvalidPedersenParamsError(`Pederson public parameters must be in range [1,…,N-1] and co-prime to N`);
    }

    if (params.s == params.t) {
      throw new InvalidPedersenParamsError(`Pederson public parameters s and t must be different`);
    }
  }
}


export class PedersenParams extends SerializableObject {
  public readonly publicParams: PedersenPublicParams;
  public readonly lambda: bigint;

  constructor({ n, s, t, lambda }: { n: bigint; s: bigint; t: bigint; lambda: bigint }) {
    super()
    this.publicParams = new PedersenPublicParams({ n, s, t });
    this.lambda = lambda;
  }
}


