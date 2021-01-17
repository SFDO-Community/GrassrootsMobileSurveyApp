import { LOGGING_LEVEL } from '@env';

const LoggingLevel = {
  ERROR: 0,
  INFO: 1,
  DEBUG: 2,
  FINE: 3,
} as const;
type LoggingLevel = keyof typeof LoggingLevel;

export function logger(loggingLevel: LoggingLevel, name: string, message: string | object) {
  const userLoggingLevel = LOGGING_LEVEL ? LOGGING_LEVEL : 'DEBUG';
  if (LoggingLevel[loggingLevel] > LoggingLevel[userLoggingLevel]) {
    return;
  }
  const formattedLoggingLevel = `[${loggingLevel}]`.padEnd(7, ' ');
  const formattedMessage = typeof message === 'object' ? '\n' + JSON.stringify(message, undefined, '  ') : message;
  console.log(`${formattedLoggingLevel} ${new Date().toString()} | ${name} | ${formattedMessage}`);
}
