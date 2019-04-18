import sequelize from '../db';
import Artical from './Artical';
import { Model, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyAddAssociationMixin, INTEGER, STRING } from 'sequelize';
import { createHash } from 'crypto';
function md5(str:string):string{
    let mdg = createHash('md5');
    return mdg.update(str).digest('hex');    

}//community user
class User extends Model {
    public id: number;
    public username: string;
    public password: string;
    public gender: string;
    public headimage: string;
    public phonenumber:number;

    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    public getArticals: HasManyGetAssociationsMixin<Artical>;
    public countArticals: HasManyCountAssociationsMixin;
    public hasArticals: HasManyHasAssociationMixin<Artical, number>;
    public addArtical: HasManyAddAssociationMixin<Artical, number>;//haha this tm in the __prototype
};


User.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
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
User.hasMany(Artical, {foreignKey:'user_id',constraints:false});


interface IUser {
    username: string,
    password: string,
    gender:string,
    headimage:string|null,
    phonenumber:number|null;
}

export default {
    async createUser(user:IUser){
        return User.create({
            username:user.username,
            password: md5(user.password),
            gender:user.gender,
            headimage:user.headimage,
            phonenumber:user.phonenumber
        })
    }
};


export {User}