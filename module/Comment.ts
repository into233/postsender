import sequelize from '../db';
import Artical from './Artical';
import { User } from './User';
import { Model, INTEGER, STRING, HasOneGetAssociationMixin, HasManyAddAssociationMixin } from 'sequelize';

class Comment extends Model {
    public id: number;
    public content: string;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArtical: HasOneGetAssociationMixin<Artical>;
    public getUser: HasOneGetAssociationMixin<User>;
    public addCommentPraise: HasManyAddAssociationMixin<Comment, number>;
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


Artical.hasMany(Comment, { constraints: false });
Comment.belongsTo(Artical);
User.hasMany(Comment, { constraints: false });
Comment.belongsTo(User);



interface IComment {
    content: string;
    id?: number;
    UserId?: number;
    ArticleId?: number;
}


var createComment = async (comment: IComment) => {
    return Comment.create({
        content: comment.content,
        praised: 0,
    })
};



export { Comment, createComment };