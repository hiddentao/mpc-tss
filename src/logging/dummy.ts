import { Logger } from "./base";

export class DummyLogger extends Logger {
  public _debug(_message: any): void {
    // Do nothing
  }

  public _info(_message: any): void {
    // Do nothing
  }

  public _error(_message: any): void {
    // Do nothing
  }
}