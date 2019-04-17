import Artical from './Artical';
import { Model, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyAddAssociationMixin, INTEGER, STRING } from 'sequelize/types';
import sequelize from '../db';
//community user
class CMUser extends Model {
    public id!: number;
    public name!: string;
    public password!: string;
    public gender!: string;
    public headimage!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getArticals: HasManyGetAssociationsMixin<Artical>;
    public countArticals: HasManyCountAssociationsMixin;
    public hasArticals: HasManyHasAssociationMixin<Artical, number>;
    public addArtical: HasManyAddAssociationMixin<Artical, number>;

};


CMUser.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: STRING(32),
        allowNull: false,
        unique: true,
    },
    password: {
        type: STRING(32),
        allowNull: false
    },
    gender: {
        type: STRING(6),
        allowNull: true,
    }
}, {
        tableName: 'cmusers',
        modelName: 'CMUser',
        sequelize: sequelize,
    });
CMUser.hasMany(Artical);

export default CMUser;