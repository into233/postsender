import sequelize from '../db';
import Artical from './Artical';
import { Model, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyAddAssociationMixin, INTEGER, STRING, HasManyCreateAssociationMixin } from 'sequelize';
import { createHash } from 'crypto';
import {Comment} from './Comment';
function md5(str: string): string {
    let mdg = createHash('md5');
    return mdg.update(str).digest('hex');

}//community user
class User extends Model {
    public id: number;
    public username: string;
    public password: string;
    public gender: string;
    public headimage: string;
    public phonenumber: number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArticals: HasManyGetAssociationsMixin<Artical>;
    public countArticals: HasManyCountAssociationsMixin;
    public hasArticals: HasManyHasAssociationMixin<Artical, number>;
    public addArtical: HasManyAddAssociationMixin<Artical, number>;//haha this tm in the __prototype
    public createComment: HasManyCreateAssociationMixin<Comment>;
    public addComment: HasManyAddAssociationMixin<Comment, number>;
};


User.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: STRING(32),
        allowNull: false,
        unique: true,
    },
    password: {
        type: STRING(32),
        allowNull: false
    },
    gender: {
        type: STRING(6),
        allowNull: true,
    }
}, {
        tableName: 'users',
        modelName: 'User',
        sequelize: sequelize,
    });



interface IUser {
    username: string,
    password: string,
    gender: string,
    headimage: string | null,
    phonenumber: number | null;
}


var createUser = async (user: IUser)=>{
    return User.create({
        username: user.username,
        password: md5(user.password),
        gender: user.gender,
        headimage: user.headimage,
        phonenumber: user.phonenumber
    })
};
var findUser = async (user:any)=>{
    return User.findOne({where:{
        username: user.username,
        password: md5(user.password),
    }});
};


export { User , createUser, findUser}