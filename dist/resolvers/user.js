"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const UserRegisterInput_1 = require("../inputs/UserRegisterInput");
const UserLoginInput_1 = require("../inputs/UserLoginInput");
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const UserResponse_1 = require("../responses/UserResponse");
const argon2_1 = __importDefault(require("argon2"));
const constants_1 = require("../constants/constants");
const uuid_1 = require("uuid");
const sendEmail_1 = require("../utils/sendEmail");
let UserResolver = class UserResolver {
    email(user, { req }) {
        if (req.session.userId === user.id) {
            return user.email;
        }
        return "";
    }
    userLoggedIn({ req }) {
        if (!req.session.userId) {
            return null;
        }
        return User_1.User.findOne(req.session.userId);
    }
    async register(options, { req }) {
        if (!options.email.includes('@') || !options.email.includes('.com')) {
            return {
                errors: [{
                        field: 'email',
                        message: "please enter a valid email address",
                    }]
            };
        }
        if (options.username.length <= 2 || options.username.length >= 10) {
            return {
                errors: [{
                        field: 'username',
                        message: "username should be between two and ten characters long",
                    }]
            };
        }
        if (options.username.includes('@')) {
            return {
                errors: [{
                        field: 'username',
                        message: "username cannot include an @ sign",
                    }]
            };
        }
        if (options.password.length <= 5 || options.password.length >= 15) {
            return {
                errors: [{
                        field: 'password',
                        message: "password should be between five and fifteen characters long",
                    }]
            };
        }
        const hashedPassword = await argon2_1.default.hash(options.password);
        let user;
        try {
            const result = await (0, typeorm_1.getConnection)().createQueryBuilder().insert().into(User_1.User).values({
                username: options.username,
                email: options.email,
                password: hashedPassword,
            }).returning('*').execute();
            user = result.raw[0];
        }
        catch (err) {
            if (err.detail.includes('Key (email)')) {
                return {
                    errors: [{
                            field: 'email',
                            message: "An account is already linked with this email"
                        }]
                };
            }
            if (err.code === 23505) {
                return {
                    errors: [{
                            field: 'username',
                            message: "username already taken"
                        }]
                };
            }
        }
        req.session.userId = user.id;
        return { user };
    }
    async login(options, { req }) {
        const user = await User_1.User.findOne({ username: options.username });
        if (!user) {
            return {
                errors: [{
                        field: 'username',
                        message: "that username doesn't exist"
                    }]
            };
        }
        const validPassword = await argon2_1.default.verify(user.password, options.password);
        if (!validPassword) {
            return {
                errors: [{
                        field: 'password',
                        message: "incorrect password"
                    }]
            };
        }
        req.session.userId = user.id;
        return { user };
    }
    async forgotPassword(email, { redis }) {
        const user = await User_1.User.findOne({ where: { email } });
        if (!user) {
            return true;
        }
        const token = (0, uuid_1.v4)();
        await redis.set(constants_1.FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3);
        await (0, sendEmail_1.sendEmail)(email, `<a href="http://localhost:3000/reset-password/${token}">Reset Password</a>`);
        return true;
    }
    async resetPassword(token, newPassword, { req, redis }) {
        if (newPassword.length <= 5 || newPassword.length >= 15) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'password should be between five and fifteen characters long',
                    }
                ]
            };
        }
        const key = constants_1.FORGOT_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'token is invalid or is expired'
                    }
                ]
            };
        }
        const userIdNum = parseInt(userId);
        const user = await User_1.User.findOne(userIdNum);
        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'this user does not exist'
                    }
                ]
            };
        }
        await User_1.User.update({ id: userIdNum }, { password: await argon2_1.default.hash(newPassword) });
        await redis.del(key);
        req.session.userId = user.id;
        return { user };
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            res.clearCookie(constants_1.COOKIE);
            if (err) {
                console.log(err);
                resolve(false);
                return;
            }
            resolve(true);
        }));
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => String),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User_1.User, Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "email", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "userLoggedIn", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse_1.UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserRegisterInput_1.UserRegisterInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse_1.UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserLoginInput_1.UserLoginInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse_1.UserResponse),
    __param(0, (0, type_graphql_1.Arg)('token')),
    __param(1, (0, type_graphql_1.Arg)('newPassword')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "resetPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map