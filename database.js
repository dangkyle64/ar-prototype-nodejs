import 'dotenv/config.js'
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
        rejectUnauthorized: false,
        statement_timeout: 60000,
            query_timeout: 60000,
        },
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 60000,
        idle: 10000,
    },
    logging: false,
});

export { sequelize, DataTypes };
