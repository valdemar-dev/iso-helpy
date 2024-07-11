import { DataTypes, InferAttributes, Sequelize, InferCreationAttributes, ModelDefined, Optional } from "sequelize";

interface NoteAttributes {
    id: string;
    verificationImage: string;
    isConfessionBanned: boolean;
}

type NoteCreationAttributes = NoteAttributes;

export default (sequelize: Sequelize,) => {

    const Users: ModelDefined<
        NoteAttributes,
        NoteCreationAttributes
    > = sequelize.define('users', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		verificationImage: {
			type: DataTypes.STRING,
			allowNull: true,
		},
        isConfessionBanned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
	}, {
		timestamps: false,
	});

    return Users;
};
