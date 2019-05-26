import sequelize from '../db';
import Artical from './Artical';
import { Model, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyAddAssociationMixin, INTEGER, STRING, HasManyCreateAssociationMixin } from 'sequelize';
import { createHash } from 'crypto';
import { Comment } from './Comment';
import { CommentPraise } from './CommentPraise';
import { Collect } from './Collect';
import { logger } from '../utils/logger';

function md5(str: string): string {
    let mdg = createHash('md5');
    return mdg.update(str).digest('hex');

}//community user
class User extends Model {
    public id: number;
    public username: string;
    public password: string;
    public gender: string;
    public email: string;
    public headimage: string;
    public phonenumber ?: number;
    public qianming: string;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArticals: HasManyGetAssociationsMixin<Artical>;
    public getCollects: HasManyGetAssociationsMixin<Collect>;
    public countArticals: HasManyCountAssociationsMixin;
    public countCollects: HasManyCountAssociationsMixin;
    public hasArtical: HasManyHasAssociationMixin<Artical, number>;
    public addArtical: HasManyAddAssociationMixin<Artical, number>;//haha this tm in the __prototype
    public createComment: HasManyCreateAssociationMixin<Comment>;
    public addComment: HasManyAddAssociationMixin<Comment, number>;
    public addCommentPraise: HasManyAddAssociationMixin<CommentPraise, number>;
    public createArtical: HasManyCreateAssociationMixin<Artical>;
    public createCollect: HasManyCreateAssociationMixin<Collect>;
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
    qianming: {
        type: STRING(144),
        allowNull: true,
    },
    email: {
        type: STRING(64),
        allowNull: true,
    },
    gender: {
        type: STRING(6),
        allowNull: true,
    },
    headimage: {
        type: STRING(256),
        allowNull: true,
    },
    phonenumber: {
        type: STRING(20),
        allowNull: true,
        unique:true,
    },

}, {
        tableName: 'users',
        modelName: 'User',
        sequelize: sequelize,
    });



interface IUser {
    id?: number,
    username: string,
    password: string,
    gender: string,
    qianming?:string,
    email?: string | null,
    headimage?: string | null,
    phonenumber?: number | null;
}


var createUser = async (user: IUser) => {
    return User.create({
        username: user.username,
        password: md5(user.password),
        gender: user.gender,
        email: user.email,
        headimage: user.headimage,
        phonenumber: user.phonenumber
    })
};
var updateUser = async (user: IUser, changinguser: User) => {
    if (!user.id) {
        throw new Error('user id is null');
    }
    
    if (!changinguser) {
        throw new Error('user not found');
    }
    changinguser.gender = user.gender || '';
    changinguser.email = user.email || '';
    changinguser.headimage = user.headimage || 'default.jpg';
    changinguser.phonenumber = user.phonenumber || undefined;
    changinguser.qianming = user.qianming || '';
    changinguser.save();
}
var changePassword = async (username:string, oldpw:string,  newpw:string)=>{
    if(!username){
        throw new Error('username is null');
    }
    var changinguser = await findUser({username:username, password:oldpw});
    if(!oldpw || !newpw){
        throw new Error('oldpassword or newpassword is null');
    }
    if(!changinguser){
        throw new Error('not find user or user password is wrong');
    }
    try{
        changinguser.password = newpw;
        changinguser.save();
    }catch(err){
        logger.error('changePassword error', err);
    }

}

/* 
    仅仅为找密码用的
 */
var findUser = async (user: any) => {
    return User.findOne({
        where: {
            username: user.username,
            password: md5(user.password),
        }
    });
};


export { User, createUser, findUser, updateUser, changePassword }