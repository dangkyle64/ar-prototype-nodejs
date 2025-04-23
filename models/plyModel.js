import { sequelize , DataTypes } from '../database.js'

const PlyModel = sequelize.define('PlyModel', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'models',
  timestamps: true,
});

export default PlyModel;
