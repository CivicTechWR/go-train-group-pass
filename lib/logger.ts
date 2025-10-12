/* eslint-disable no-console */

type LogPayload = Record<string, unknown> | string | Error;

const formatPayload = (payloads: LogPayload[]): unknown[] =>
  payloads.map(entry => {
    if (entry instanceof Error) {
      return {
        name: entry.name,
        message: entry.message,
        stack: entry.stack,
      };
    }
    return entry;
  });

export const logger = {
  info: (...payload: LogPayload[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(...formatPayload(payload));
    }
  },
  warn: (...payload: LogPayload[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(...formatPayload(payload));
    }
  },
  error: (...payload: LogPayload[]) => {
    console.error(...formatPayload(payload));
  },
  audit: (...payload: LogPayload[]) => {
    console.log(...formatPayload(payload));
  },
};
