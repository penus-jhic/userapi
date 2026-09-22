import { sequelize } from '../config/database.js';
import User from './user.model.js';

export { sequelize, User };
export default {
  sequelize,
  User
};
