import { Arg, Resolver, Mutation, Ctx, UseMiddleware, Int } from "type-graphql"
import { Context } from "../types/types"
import { Authentication } from "../middleware/Authentication";
import { getConnection } from "typeorm"
import { Upvote } from "../entities/Upvote"

@Resolver()
export class VoteResolver {

    @Mutation(() => Boolean)
    @UseMiddleware(Authentication)
    async vote(
        @Arg('postId', () => Int) postId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: Context
    ) {
        const isUpvote = value !== -1
        const realValue = isUpvote ? 1 : -1
        const userId = req.session.userId
        const upvote = await Upvote.findOne({ where: { postId, userId } })

        // * the user has voted on the post before and they are changing their vote
        if (upvote && upvote.value !== realValue) {
            await getConnection().transaction(async (tm) => {
                await tm.query(`
                    update upvote
                    set value = $1
                    where "postId" = $2 and "userId" = $3
                `, [realValue, postId, userId])

                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2
                `, [2 * realValue, postId])
            })
        } else if (!upvote) {
            // * has never voted on the post before
            await getConnection().transaction(async (tm) => {
                await tm.query(`
                    insert into upvote ("userId", "postId", value)
                    values ($1, $2, $3);
                `, [userId, postId, realValue])

                await tm.query(`
                    update post
                    set points = points + $1
                    where id = $2;
                `, [realValue, postId])

            })
        }

        return true
    }

}