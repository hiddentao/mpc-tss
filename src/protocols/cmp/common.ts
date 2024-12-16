import { CustomError } from "ts-custom-error";

export class CmpInvalidThresholdError extends CustomError {
  constructor() {
    super("Threshold must be between 1 and the number of parties minus 1");
  }
}

export class CmpMinimumPartiesError extends CustomError {
  constructor() {
    super("At least 2 parties are required for CMP");
  }
}
