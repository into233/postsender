import sequelize from '../db';
import Artical from './Artical';
import { User } from './User';
import { Comment } from './Comment';
import { Model, INTEGER, HasOneGetAssociationMixin, where } from 'sequelize';

class CommentPraise extends Model {
    public id: number;
    public UserId: number;
    public CommentId: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArtical: HasOneGetAssociationMixin<Artical>;
    public getComment: HasOneGetAssociationMixin<Comment>;
};


CommentPraise.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    UserId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
    },
    CommentId: {
        type: INTEGER.UNSIGNED,
        allowNull: false
    },
}, {
        tableName: 'commentpraises',
        modelName: 'CommentPraise',
        sequelize: sequelize,
    });
User.hasMany(CommentPraise, { constraints: false });
CommentPraise.belongsTo(User);
Comment.hasMany(CommentPraise, { constraints: false });
CommentPraise.belongsTo(Comment);

interface ICommentPraise {
    UserId?: number;
    id?: number;
    CommentId?: number;
}


var createCommentPraise = async (comment: Comment, user: User) => {
    return CommentPraise.create({
        UserId: user.id,
        CommentId: comment.id,
    })
};
var deleteCommentPraise = async (userid: number, commentid: number) => {
    return await CommentPraise.destroy({where:{
        UserId: userid,
        CommentId: commentid,
    }})
};

export { CommentPraise, createCommentPraise, deleteCommentPraise};