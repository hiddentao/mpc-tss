import { Logger } from "./base";

export class ConsoleLogger extends Logger {
  public _debug(message: any): void {
    console.debug(`[DEBUG] ${this.prefix}: ${message}`)
  }

  public _info(message: any): void {
    console.info(`[INFO] ${this.prefix}: ${message}`)
  }

  public _error(message: any): void {
    console.error(`[ERROR] ${this.prefix}: ${message}`)
  }
}


