import sequelize from '../db';
import { User } from './User';
import { Model, INTEGER, HasOneGetAssociationMixin, STRING } from 'sequelize';

class Follower extends Model {
    public id: number;
    public UserId: number;
    public FanId: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getUser: HasOneGetAssociationMixin<User>;
};

Follower.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
    },
    FanId:{
        type: STRING(144),
        allowNull: false,
    }
}, {
        tableName: 'followers',
        modelName: 'Follower',
        sequelize: sequelize,
    });
var createFollower = async (user: User, fan:User) => {
    return Follower.create({
        UserId: user.id,
        FanId: fan.id,//这是一个标记  ATTENTION
    })
};
var isfollower = async(userid: number, fanid:number)=>{
    var isfollower = await Follower.findOne({where:{UserId:userid, FanId:fanid}});
    return !(isfollower == null);
}

export { Follower, createFollower, isfollower};