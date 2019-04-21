import sequelize from '../db';
import Artical from './Artical';
import { User } from './User';
import { Model , INTEGER, STRING, HasOneGetAssociationMixin, HasManyAddAssociationMixin } from 'sequelize';

class Comment extends Model {
    public id: number;
    public content: string;
    public praised: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArtical: HasOneGetAssociationMixin<Artical>;
    public getUser: HasOneGetAssociationMixin<User>;
};


Comment.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: STRING(144),
        allowNull: false,
        unique: false,
    },
    praised: {
        type: INTEGER,
        allowNull: false
    },
}, {
        tableName: 'comments',
        modelName: 'Comment',
        sequelize: sequelize,
    });



interface IComment {
    content?: string;
    praised?: string;
    id?:number;
    UserId?:number;
    ArticleId?:number;
}


var createComment = async (comment: IComment) => {
    return Comment.create({
        content: comment.content,
        praised: 0,
    })
};
var praiseComment = async (comment: IComment) => {
    var ifexit = null;

    if(comment.id){
        ifexit = await Comment.findOne({where:{id:comment.id}})
    }
    if(comment.ArticleId && comment.UserId){
        ifexit = await Comment.findOne({where:{ArticleId:comment.ArticleId, UserId:comment.UserId}});
    }
    if(ifexit) {
        ifexit.praised += 1;
        ifexit.save();
    };
    return ifexit;
}


export { Comment, createComment, praiseComment};