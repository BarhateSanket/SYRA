// Simple lightweight logger for production and development

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaString = meta ? ` | META: ${JSON.stringify(meta)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

const logger = {
  info: (message, meta) => {
    console.log(formatMessage("INFO", message, meta));
  },

  warn: (message, meta) => {
    console.warn(formatMessage("WARN", message, meta));
  },

  error: (message, meta) => {
    console.error(formatMessage("ERROR", message, meta));
  },

  debug: (message, meta) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatMessage("DEBUG", message, meta));
    }
  }
};

export default logger;
