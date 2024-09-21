import { DataTypes, InferAttributes, Sequelize, InferCreationAttributes, ModelDefined, Optional } from "sequelize";

// You can also define modules in a functional way
interface NoteAttributes {
  messageLink: string;
  authorId: string;
}

// You can also set multiple attributes optional at once
type NoteCreationAttributes = NoteAttributes;

export default (sequelize: Sequelize,) => {
    const Confessions: ModelDefined<
        NoteAttributes,
        NoteCreationAttributes
    > = sequelize.define('confessions', {
		messageLink: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		authorId: {
			type: DataTypes.STRING,
			allowNull: true,
		}, 
	}, {
		timestamps: false,
	});

    return Confessions;
};
