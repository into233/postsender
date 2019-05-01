import * as Sequelize from 'sequelize';
import {db, testdb} from './config';
var dbconfig = db;
var logging = true;
if(process.env.NODE_ENV == 'test'){
    dbconfig = testdb;
    logging = false;
}
var sequelize = new Sequelize.Sequelize(dbconfig.database, dbconfig.user, dbconfig.password, {
    port: 3306,
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000,
    },
    logging:logging,
    dialectOptions: {
        useUTC: false,
        dateStrings: true,
        typeCast: function (field: { type: string; string: () => void; }, next: () => void) { // for reading from database
            if (field.type === 'DATETIME') {
                return field.string();
            }
            return next()
        },
    },
    timezone: '+08:00',
});



export default sequelize;
