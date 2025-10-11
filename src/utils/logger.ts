/* eslint-disable no-console */
import chalk from 'chalk'

interface StepTimer {
  name: string
  startTime: number
}

class Logger {
  private currentStep: StepTimer | null = null
  private totalStartTime: number = 0

  /**
   * Start tracking total execution time
   */
  startTotal() {
    this.totalStartTime = Date.now()
  }

  /**
   * Start a new step with a message
   */
  start(message: string) {
    // End previous step if exists
    if (this.currentStep) {
      this.endCurrentStep()
    }

    console.log(chalk.blueBright(`\n${message}...\n`))
    this.currentStep = {
      name: message,
      startTime: Date.now(),
    }
  }

  /**
   * End the current step with a success message
   */
  end(message: string) {
    if (!this.currentStep) {
      console.log(chalk.greenBright(`${message}\n`))
      return
    }

    const elapsed = Date.now() - this.currentStep.startTime
    console.log(chalk.greenBright(`${message} ${chalk.gray(`(${this.formatTime(elapsed)})`)} \n`))
    this.currentStep = null
  }

  /**
   * End current step without message (for internal use)
   */
  private endCurrentStep() {
    if (this.currentStep) {
      const elapsed = Date.now() - this.currentStep.startTime
      console.log(chalk.greenBright(`Done. ${chalk.gray(`(${this.formatTime(elapsed)})`)} \n`))
      this.currentStep = null
    }
  }

  /**
   * Log an error message
   */
  error(message: string) {
    console.error(chalk.redBright(message))
  }

  /**
   * Log a success message without step timing
   */
  success(message: string) {
    const totalElapsed = this.totalStartTime ? Date.now() - this.totalStartTime : 0
    if (totalElapsed > 0) {
      console.log(chalk.greenBright(`${message} ${chalk.gray(`(Total: ${this.formatTime(totalElapsed)})`)} `))
    }
    else {
      console.log(chalk.greenBright(message))
    }
  }

  /**
   * Format time in human-readable format
   */
  private formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`
    }
    const seconds = (ms / 1000).toFixed(2)
    return `${seconds}s`
  }
}

export const logger = new Logger()
