import { createLogger, format } from 'winston';
const { combine, timestamp, label, printf } = format;
import winston = require('winston');

const myFormat = printf(({ level, message }) => {
    return `${level}: ${message}\t${new Date().toLocaleString()}`;
  });

const logger = createLogger({
    levels: winston.config.syslog.levels,
    format: myFormat,
    defaultMeta: { service: 'user-serviece' },
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log'}),
    ]
});

if(process.env.NODE_ENV !== 'production'){
    logger.add(new winston.transports.Console({
        format: myFormat, level:'debug'
    }))
}
var info = function(sql:string){
    logger.debug("SQL :: " + sql);
}

export {logger, info};