export type LoggerLevel = "debug" | "info" | "error"

export abstract class Logger {
  protected readonly prefix: string
  protected minLevel: LoggerLevel
  protected readonly children: Logger[] = []

  protected constructor({ prefix, minLevel = "debug" }: { prefix: string, minLevel?: LoggerLevel }) {
    this.prefix = prefix
    this.minLevel = minLevel
  }
  
  public createSub(subPrefix: string): Logger {
    const c = Object.create(this, {
      prefix: { value: `${this.prefix}/${subPrefix}` },
      minLevel: { value: this.minLevel }
    })
    this.children.push(c)
    return c
  }

  public setMinLevel(minLevel: LoggerLevel): void {
    this.minLevel = minLevel
    this.children.forEach(c => c.setMinLevel(minLevel))
  }

  public debug(...message: any[]): void {
    if (this.minLevel === "debug") {
      message.forEach(m => this._debug(m))
    }
  }

  public info(...message: any[]): void {
    if (this.minLevel === "info" || this.minLevel === "debug") {
      message.forEach(m => this._info(m))
    }
  }

  public error(...message: any[]): void {
    message.forEach(m => this._error(m))
  }

  public abstract _debug(message: any): void
  public abstract _info(message: any): void
  public abstract _error(message: any): void
}

