import { sequelize } from "./database.js";
import PlyModel from "./models/plyModel.js";

try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    await sequelize.sync({ alter: true });
    console.log('Model synced');

    const models = await PlyModel.findAll();
    console.log('📦 Records in DB:');
    models.forEach(model => {
        console.log(model.toJSON());
    });

    await sequelize.close();
} catch(error) {
    console.error('DB error: ', error);
}