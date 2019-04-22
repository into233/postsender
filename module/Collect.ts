import sequelize from '../db';
import Artical from './Artical';
import { User } from './User';
import { Model, INTEGER, HasOneGetAssociationMixin, HasManyGetAssociationsMixin, STRING } from 'sequelize';

class Collect extends Model {
    public id: number;
    public UserId: number;
    public title: string

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArticals: HasManyGetAssociationsMixin<Artical>;
    public getUser: HasOneGetAssociationMixin<User>;
};

Collect.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
    },
    title:{
        type: STRING(144),
        allowNull: false,
    }
}, {
        tableName: 'collects',
        modelName: 'Collect',
        sequelize: sequelize,
    });

Collect.hasMany(Artical, { constraints: false });
Artical.belongsTo(Collect);
User.hasMany(Collect, {constraints:false});
Collect.belongsTo(User);

var createCollect = async (user: User, title:string) => {
    return Collect.create({
        UserId: user.id,
        title: title || '{$no title$}',//这是一个标记  ATTENTION
    })
};

export { Collect, createCollect };