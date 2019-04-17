import { Model, HasOneGetAssociationMixin, INTEGER, STRING } from "sequelize/types";
import sequelize from '../db';
import CMUser from './User';

class Artical extends Model {
    public id!: number;
    public content!: string;
    public imagedir!: string;
    public CMUserId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getCMUser!: HasOneGetAssociationMixin<CMUser>;//It's just a interface for "typescript", so DONT custom it
};
Artical.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: STRING(140),
        allowNull: false,
    },
    imagedir: {
        type: STRING(140),
        allowNull: true,
    }
}, {
        tableName: 'articals',
        modelName: 'Artical',
        sequelize: sequelize
    })

Artical.belongsTo(CMUser);

export = Artical;