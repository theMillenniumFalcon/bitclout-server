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
exports.PostResolver = void 0;
const PostInput_1 = require("../inputs/PostInput");
const type_graphql_1 = require("type-graphql");
const PostResponse_1 = require("../responses/PostResponse");
const Post_1 = require("../entities/Post");
const Authentication_1 = require("../middleware/Authentication");
const typeorm_1 = require("typeorm");
const Upvote_1 = require("../entities/Upvote");
let PostResolver = class PostResolver {
    async posts() {
        return Post_1.Post.find({ relations: ["creator", "group"] });
    }
    post(id) {
        return Post_1.Post.findOne(id, { relations: ["creator", "group"] });
    }
    async createPost(options, { req }) {
        if (options.title.length <= 2) {
            return {
                errors: [{
                        field: 'title',
                        message: "Title should be atleast two characters long",
                    }]
            };
        }
        if (options.text.length <= 0) {
            return {
                errors: [{
                        field: 'text',
                        message: "Text should not be empty",
                    }]
            };
        }
        let post;
        const _groupId = parseInt(options.groupId);
        try {
            const result = await (0, typeorm_1.getConnection)().createQueryBuilder().insert().into(Post_1.Post).values({
                title: options.title,
                text: options.text,
                creatorId: req.session.userId,
                groupId: _groupId
            }).returning('*').execute();
            post = result.raw[0];
        }
        catch (err) {
            if (options.groupId === '0') {
                return {
                    errors: [{
                            field: 'groupId',
                            message: "Please select a group",
                        }]
                };
            }
        }
        return { post };
    }
    async updatePost(id, title, text, { req }) {
        const post = await Post_1.Post.findOne(id);
        if (!post) {
            return null;
        }
        if (post.creatorId !== req.session.userId) {
            throw new Error("not authorized");
        }
        const result = (0, typeorm_1.getConnection)().createQueryBuilder().update(Post_1.Post).set({ title, text })
            .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId }).returning("*").execute();
        return (await result).raw[0];
    }
    async deletePost(id, { req }) {
        const post = await Post_1.Post.findOne(id);
        if (!post) {
            return false;
        }
        if (post.creatorId !== req.session.userId) {
            throw new Error("not authorized");
        }
        await Upvote_1.Upvote.delete({ postId: id });
        await Post_1.Post.delete({ id });
        return true;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [Post_1.Post]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => PostResponse_1.PostResponse),
    (0, type_graphql_1.UseMiddleware)(Authentication_1.Authentication),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput_1.PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(Authentication_1.Authentication),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('title')),
    __param(2, (0, type_graphql_1.Arg)('text')),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(Authentication_1.Authentication),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(Post_1.Post)
], PostResolver);
exports.PostResolver = PostResolver;
//# sourceMappingURL=post.js.map