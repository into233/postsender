import sequelize from '../db';
import Artical from './Artical';
import { User } from './User';
import { Model, INTEGER, HasOneGetAssociationMixin } from 'sequelize';

class ArticalPraise extends Model {
    public id: number;
    public UserId: number;
    public ArticalId: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArtical: HasOneGetAssociationMixin<Artical>;
    public getUser: HasOneGetAssociationMixin<User>;
};

ArticalPraise.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
    },
    ArticalId: {
        type: INTEGER.UNSIGNED,
        allowNull: false
    },
}, {
        tableName: 'articalpraises',
        modelName: 'ArticalPraise',
        sequelize: sequelize,
    });
User.hasMany(ArticalPraise, { constraints: false });
ArticalPraise.belongsTo(User);
Artical.hasMany(ArticalPraise, { constraints: false });
ArticalPraise.belongsTo(Artical);



var createArticalPraise = async (articalId:number, UserId:number) => {
    return ArticalPraise.create({
        UserId: UserId,
        ArticalId: articalId,
    })
};

export { ArticalPraise, createArticalPraise };