import sequelize from '../db';
import { Model, HasOneGetAssociationMixin, INTEGER, STRING } from "sequelize";
import {User} from './User';

class Artical extends Model {
    public id: number;
    public title:string;
    public content: string;
    public imagedir: string;
    public userid: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getUser: HasOneGetAssociationMixin<User>;//It's just a interface for "typescript", so DONT custom it
};
Artical.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    title:{
        type:STRING(100),
        allowNull:true,
    },
    content: {
        type: STRING(140),
        allowNull: false,
    },
    imagedir: {
        type: STRING(140),
        allowNull: true,
    },

}, {
        tableName: 'articals',
        modelName: 'Artical',
        sequelize
    })

// Artical.belongsTo(User);//something wrong??

export default Artical;