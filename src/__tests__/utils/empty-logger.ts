import { ConsoleLogger } from '@nestjs/common'

export class EmptyLogger extends ConsoleLogger {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  log(message: string): void {
    // Sonar doesn't like empty blocks
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(message: string): void {
    // Sonar doesn't like empty blocks
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(message: string): void {
    // Sonar doesn't like empty blocks
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  debug(message: string): void {
    // Sonar doesn't like empty blocks
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verbose(message: string): void {
    // Sonar doesn't like empty blocks
  }
}
