import { PostInput } from "../inputs/PostInput"
import { Arg, Query, Resolver, Mutation, Ctx, UseMiddleware, Int } from "type-graphql"
import { Context } from "../types/types"
import { PostResponse } from "../responses/PostResponse"
import { Post } from "../entities/Post"
import { Authentication } from "../middleware/Authentication";
import { getConnection } from "typeorm"
import { Upvote } from "../entities/Upvote"

@Resolver(Post)
export class PostResolver {

    // * ALL POSTS
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        return Post.find({ relations: ["creator", "group"] })
    }

    // * SINGLE POST
    @Query(() => Post, { nullable: true })
    post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id, { relations: ["creator", "group"] })
    }

    // * CREATE POST
    @Mutation(() => PostResponse)
    @UseMiddleware(Authentication)
    async createPost(
        @Arg('options') options: PostInput,
        @Ctx() { req }: Context
    ): Promise<PostResponse> {
        if (options.title.length <= 2) {
            return {
                errors: [{
                    field: 'title',
                    message: "Title should be atleast two characters long",
                }]
            }
        }

        if (options.text.length <= 0) {
            return {
                errors: [{
                    field: 'text',
                    message: "Text should not be empty",
                }]
            }
        }

        let post
        const _groupId = parseInt(options.groupId)
        try {
            const result = await getConnection().createQueryBuilder().insert().into(Post).values({
                title: options.title,
                text: options.text,
                creatorId: req.session.userId,
                groupId: _groupId
            }).returning('*').execute()
            post = result.raw[0]
        } catch (err) {
            if (options.groupId === '0') {
                return {
                    errors: [{
                        field: 'groupId',
                        message: "Please select a group",
                    }]
                }
            }
        }

        return { post }
    }

    // * UPDATE POST
    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(Authentication)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: Context
    ): Promise<Post | null> {
        const post = await Post.findOne(id)
        if (!post) {
            return null
        }
        if (post.creatorId !== req.session.userId) {
            throw new Error("not authorized")
        }

        const result = getConnection().createQueryBuilder().update(Post).set({ title, text })
            .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId }).returning("*").execute()

        return (await result).raw[0]
    }

    // * DELETE POST
    @Mutation(() => Boolean)
    @UseMiddleware(Authentication)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: Context
    ): Promise<boolean> {
        const post = await Post.findOne(id)
        if (!post) {
            return false
        }
        if (post.creatorId !== req.session.userId) {
            throw new Error("not authorized")
        }

        await Upvote.delete({ postId: id })
        await Post.delete({ id })

        return true
    }

}