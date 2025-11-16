import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  transports: [new winston.transports.Console()],
});

export const apiLogger = (req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
};

export default apiLogger;
