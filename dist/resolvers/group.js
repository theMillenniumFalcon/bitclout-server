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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupResolver = void 0;
const GroupInput_1 = require("../inputs/GroupInput");
const type_graphql_1 = require("type-graphql");
const GroupResponse_1 = require("../responses/GroupResponse");
const Group_1 = require("../entities/Group");
const Authentication_1 = require("../middleware/Authentication");
const typeorm_1 = require("typeorm");
const Member_1 = require("../entities/Member");
let GroupResolver = class GroupResolver {
    async member(groupId, value, { req }) {
        const { userId } = req.session;
        await Member_1.Member.insert({ userId, groupId, value });
        await Group_1.Group.update({ id: groupId }, { membersnumber: value });
        return true;
    }
    async groups() {
        return Group_1.Group.find({ relations: ["posts", "members"] });
    }
    group(id) {
        return Group_1.Group.findOne(id, { relations: ["posts", "members"] });
    }
    async createGroup(options, { req }) {
        if (options.name.length <= 2 || options.name.length >= 20) {
            return {
                errors: [{
                        field: 'name',
                        message: "group name should be between two and twenty characters long",
                    }]
            };
        }
        let group;
        try {
            const result = await (0, typeorm_1.getConnection)().createQueryBuilder().insert().into(Group_1.Group).values({
                name: options.name,
                description: options.description,
                creatorId: req.session.userId
            }).returning('*').execute();
            group = result.raw[0];
        }
        catch (err) {
            if (err.code === 23505) {
                return {
                    errors: [{
                            field: 'name',
                            message: "group with this name already taken"
                        }]
                };
            }
        }
        return { group };
    }
    async updateGroup(id, name, description, { req }) {
        const group = await Group_1.Group.findOne(id);
        if (!group) {
            return null;
        }
        if (group.creatorId !== req.session.userId) {
            throw new Error("not authorized");
        }
        const result = (0, typeorm_1.getConnection)().createQueryBuilder().update(Group_1.Group).set({ name, description })
            .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId }).returning("*").execute();
        return (await result).raw[0];
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(Authentication_1.Authentication),
    __param(0, (0, type_graphql_1.Arg)('groupId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('value', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], GroupResolver.prototype, "member", null);
__decorate([
    (0, type_graphql_1.Query)(() => [Group_1.Group], { nullable: true }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GroupResolver.prototype, "groups", null);
__decorate([
    (0, type_graphql_1.Query)(() => Group_1.Group, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GroupResolver.prototype, "group", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => GroupResponse_1.GroupResponse),
    (0, type_graphql_1.UseMiddleware)(Authentication_1.Authentication),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GroupInput_1.GroupInput, Object]),
    __metadata("design:returntype", Promise)
], GroupResolver.prototype, "createGroup", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Group_1.Group, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(Authentication_1.Authentication),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('name')),
    __param(2, (0, type_graphql_1.Arg)('description')),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupResolver.prototype, "updateGroup", null);
GroupResolver = __decorate([
    (0, type_graphql_1.Resolver)(Group_1.Group)
], GroupResolver);
exports.GroupResolver = GroupResolver;
//# sourceMappingURL=group.js.map