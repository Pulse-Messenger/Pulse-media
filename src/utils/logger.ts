import log4js from "log4js";

log4js.configure({
  appenders: { out: { type: "stdout" } },
  categories: { default: { appenders: ["out"], level: "debug" } },
});

const logger = log4js.getLogger();
console.log = logger.info.bind(logger);
console.warn = logger.warn.bind(logger);
console.error = logger.error.bind(logger);
console.debug = logger.debug.bind(logger);
