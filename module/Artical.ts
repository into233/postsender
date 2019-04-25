import sequelize from '../db';
import { Model, HasOneGetAssociationMixin, INTEGER, STRING, HasManyAddAssociationMixin } from "sequelize";
import {User} from './User';
import { Comment } from './Comment';
import { Collect } from './Collect';

class Artical extends Model {
    public id: number;
    public title:string;
    public content: string;
    public imagedir: string;
    public userid: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getUser: HasOneGetAssociationMixin<User>;//It's just a interface for "typescript", so DONT custom it
    public addComment: HasManyAddAssociationMixin<Comment, number>;
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
        type: STRING(340),
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
Artical.belongsTo(User);
User.hasMany(Artical, { constraints: false });

Collect.hasMany(Artical, { constraints: false });
Artical.belongsTo(Collect);
User.hasMany(Collect, {constraints:false});
Collect.belongsTo(User);


export default Artical;