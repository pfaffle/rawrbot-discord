import pino from "pino"

export const logger = pino({
  formatters: {
    level(label, number) {
      return { level: label }
    },
  },
})
