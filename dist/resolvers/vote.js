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
exports.VoteResolver = void 0;
const type_graphql_1 = require("type-graphql");
const Authentication_1 = require("../middleware/Authentication");
const typeorm_1 = require("typeorm");
const Upvote_1 = require("../entities/Upvote");
let VoteResolver = class VoteResolver {
    async vote(postId, value, { req }) {
        const isUpvote = value !== -1;
        const realValue = isUpvote ? 1 : -1;
        const userId = req.session.userId;
        const upvote = await Upvote_1.Upvote.findOne({ where: { postId, userId } });
        if (upvote && upvote.value !== realValue) {
            await (0, typeorm_1.getConnection)().transaction(async (tm) => {
                await tm.query(`
                    update upvote
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                `, [realValue, postId, userId]);
                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2
                `, [2 * realValue, postId]);
            });
        }
        else if (!upvote) {
            await (0, typeorm_1.getConnection)().transaction(async (tm) => {
                await tm.query(`
                    insert into upvote ("userId", "postId", value)
                    values ($1, $2, $3);
                `, [userId, postId, realValue]);
                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2;
                `, [realValue, postId]);
            });
        }
        return true;
    }
};
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(Authentication_1.Authentication),
    __param(0, (0, type_graphql_1.Arg)('postId', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('value', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], VoteResolver.prototype, "vote", null);
VoteResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], VoteResolver);
exports.VoteResolver = VoteResolver;
//# sourceMappingURL=vote.js.map