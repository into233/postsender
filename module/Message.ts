import sequelize from '../db';
import Artical from './Artical';
import { User } from './User';
import { Model, INTEGER, STRING, HasOneGetAssociationMixin, HasManyAddAssociationMixin, HasManyCountAssociationsMixin } from 'sequelize';
import { ArticalPraise } from './ArticalPraise';
import { Comment } from './Comment';
import { Follower } from './Follower';

enum MessageType{
    addArticalPraise,addFollower,addComment
}

class Message extends Model {
    public id: number;
    public type: number;
    public UserId: number;
    public ArticalPraiseId: number;
    public CommentId: number;
    public FollowerId: number;
    public FanId: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

};


Message.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: INTEGER,
        allowNull: false,
        unique: false,
    },
    ArticalPraiseId: {
        type: INTEGER.UNSIGNED,
        allowNull:true,
        unique:false,
    },
    UserId: {
        type: INTEGER.UNSIGNED,
        allowNull:false,
        unique:false,
    },
    FollowerId: {
        type: INTEGER.UNSIGNED,
        allowNull:true,
        unique:false,
    },CommentId:{
        type: INTEGER.UNSIGNED,
        allowNull:true,
        unique:false,
    },
    FanId:{
        type:INTEGER.UNSIGNED,
        allowNull:true,
        unique:false,
    }
}, {
        tableName: 'messages',
        modelName: 'Message',
        sequelize: sequelize,
    });

interface IMessage {
    type: MessageType;
    UserId: number;
    ArticalPraiseId?: number;
    CommentId?:number;
    FollowerId?:number;
    FanId?:number;
}


var createMessage = async (message: IMessage) => {
    return await Message.create({
        CommentId:message.CommentId,
        ArticalPraiseId:message.ArticalPraiseId,
        UserId: message.UserId,
        FollowerId:message.FollowerId,
        type:message.type,
        FanId:message.FanId,
    })
};

ArticalPraise.hasMany(Message, {onDelete:'CASCADE'});
Comment.hasMany(Message, {onDelete:'CASCADE'});


export { Message, createMessage, MessageType };