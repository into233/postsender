import sequelize from '../db';
import Artical from './Artical';
import { User } from './User';
import { Model, INTEGER, HasOneGetAssociationMixin, HasManyGetAssociationsMixin, STRING } from 'sequelize';
import { Collect } from './Collect';

//收藏
class Star extends Model {
    public id: number;
    public UserId: number;
    public ArticalId: number;
    public CollectId: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArtical: HasManyGetAssociationsMixin<Artical>;
    public getUser: HasOneGetAssociationMixin<User>;
    public getCollect: HasOneGetAssociationMixin<Collect>;
};

Star.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
    },
}, {
        tableName: 'stars',
        modelName: 'Star',
        sequelize: sequelize,
    });

var createStar = async (user: User, artical:Artical, collect:Collect) => {
    return Star.create({
        UserId: user.id,
        ArticalId: artical.id,
        CollectId: collect.id,
    });
};
var destroyStar = async (userid: number, articalid:number, collectid:number)=>{
    var star = (await Star.findOne({where:{UserId: userid,
        ArticalId: articalid,
        CollectId:collectid,}}));
    if(star){
        return star.destroy();
    }else{
        return false;
    }
}
export { Star, createStar , destroyStar};