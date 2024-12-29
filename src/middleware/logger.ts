import morgan, { StreamOptions } from "morgan";
import logger from "jet-logger";
import { Request } from "express";

// ANSI 색상 코드 적용 함수
const colorizeStatus = (status: number) => {
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`;      // Red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`;      // Yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`;      // Cyan
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`;      // Green
  return `\x1b[37m${status}\x1b[0m`;                         // White
};

const stream: StreamOptions = {
  write: (message: string) => logger.info(message.trim()),
};

const morganFormat = process.env.NODE_ENV === "production"
  ? `:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" \nheaders :headers \nquery :query \nbody :body`
  : `:method :url :status :response-time ms - :res[content-length] \nheaders :headers \nquery :query \nbody :body`;

// Custom tokens
morgan.token("body", (req: Request) => JSON.stringify(req.body));
morgan.token("query", (req: Request) => JSON.stringify(req.query));
morgan.token("headers", (req: Request) => JSON.stringify(req.headers));
morgan.token("status", (req, res) => colorizeStatus(res.statusCode));

const morganMW = morgan(morganFormat, { stream });

export const logInfo = (message: string) => logger.info(message);
export const logError = (message: string) => logger.err(message);
export const logWarn = (message: string) => logger.warn(message);

export { logger, morganMW }; 