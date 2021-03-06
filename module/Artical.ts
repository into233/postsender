import sequelize from '../db';
import { Model, HasOneGetAssociationMixin, INTEGER, STRING, HasManyAddAssociationMixin, HasManyCountAssociationsMixin, HasManyGetAssociationsMixin } from "sequelize";
import {User} from './User';
import { Comment } from './Comment';
import { Collect } from './Collect';
import { ArticalPraise } from './ArticalPraise';
import { Star } from './Star';
import { Follower } from './Follower';
import { Message } from './Message';

class Artical extends Model {
    public id: number;
    public title:string;
    public content: string;
    public imagedir: string;
    public UserId: number;
    public type: string;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getUser: HasOneGetAssociationMixin<User>;//It's just a interface for "typescript", so DONT custom it
    public addComment: HasManyAddAssociationMixin<Comment, number>;
    public countArticalPraises:HasManyCountAssociationsMixin;
    public getComments: HasManyGetAssociationsMixin<Comment>;
    public countStars:HasManyCountAssociationsMixin;
    public countComments:HasManyCountAssociationsMixin;

    //在service里添加的
    articalpraise: number;
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
    type:{
        type:STRING(140),
        allowNull:true,
    }

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

Collect.hasMany(Star, {constraints:false});
Artical.hasMany(Star, {constraints:false});
User.hasMany(Star, {constraints:false});

User.hasMany(Follower, {constraints:false});

export default Artical;