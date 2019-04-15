/// <reference  path="./node_modules/@types/sequelize/index.d.ts"/>

import * as Sequelize from 'sequelize';
import { NUMBER, Model, STRING, HasManyGetAssociationsMixin, HasManyCountAssociationsMixin, HasManyHasAssociationMixin, HasManyRemoveAssociationsMixin, HasOneGetAssociationMixin, HasManyAddAssociationMixin, INTEGER } from 'sequelize';
import uuid = require('uuid');

var sequelize = new Sequelize.Sequelize('wzqsq', 'root', '123456', {
    port: 3306,
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000,
    },
    dialectOptions: {
        useUTC: false,
        dateStrings: true,
        typeCast: function (field: { type: string; string: () => void; }, next: () => void) { // for reading from database
            if (field.type === 'DATETIME') {
                return field.string();
            }
            return next()
        },
    },
    timezone: '+08:00'
});
class Artical extends Model {
    public id!: number;
    public content!: string;
    public imagedir!: string;
    public CMUserId!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getCMUser!: HasOneGetAssociationMixin<CMUser>;//It's just a interface for "typescript", so DONT custom it
};
//community user
class CMUser extends Model {
    public id!: number;
    public name!: string;
    public password!: string;
    public gender!: string;
    public headimage!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getArticals!: HasManyGetAssociationsMixin<Artical>;
    public countArticals!: HasManyCountAssociationsMixin;
    public hasArticals!: HasManyHasAssociationMixin<Artical, number>;
    public addArtical!: HasManyAddAssociationMixin<Artical, number>;

};
CMUser.init({
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
        tableName: 'cmusers',
        modelName: 'CMUser',
        sequelize: sequelize,
    });

Artical.init({
    id: {
        type: INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    content: {
        type: STRING(140),
        allowNull: false,
    },
    imagedir: {
        type: STRING(140),
        allowNull: true,
    }
}, {
        tableName: 'articals',
        modelName: 'Artical',
        sequelize: sequelize
    })

CMUser.hasMany(Artical);
Artical.belongsTo(CMUser);

var exp = {
    fc: function () {
        return sequelize.sync().then(async () => {
            const newuser = await CMUser.create({
                name: 'tion',
                password: '123456',
                gender: 'male',
            })
            console.log(newuser.id);

            var newartical = await Artical.create({
                content: 'firstttt',
            });
            await newuser.addArtical(newartical);
            var a = await newartical.getCMUser();

            console.log('new artical userid = ', newartical.CMUserId);
            return a;

        })
    },

    CMUser: CMUser,
}

export = exp;