/**
 * @fileoverview Common errors
 */

import { CustomError } from "ts-custom-error";

export class MaxIterationsExceededError extends CustomError {
  constructor(functionName: string, maxIterations: number) {
    super(`Maximum number of iterations exceeded: ${functionName} - ${maxIterations}`);
  }
}
