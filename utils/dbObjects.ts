import { Sequelize } from "sequelize";

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});


import UsersModel from "../models/Users";
import ConfessionsModel from "../models/Confessions";

const Users = UsersModel(sequelize);
const Confessions = ConfessionsModel(sequelize);

export { Users, Confessions, };
