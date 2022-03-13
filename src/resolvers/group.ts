import { GroupInput } from "../inputs/GroupInput"
import { Arg, Query, Resolver, Mutation, Ctx, UseMiddleware, Int } from "type-graphql"
import { Context } from "../types/types"
import { GroupResponse } from "../responses/GroupResponse"
import { Group } from "../entities/Group"
import { Authentication } from "../middleware/Authentication";
import { getConnection } from "typeorm"
import { Member } from "../entities/Member"

@Resolver(Group)
export class GroupResolver {

    @Mutation(() => Boolean)
    @UseMiddleware(Authentication)
    async member(
        @Arg('groupId', () => Int) groupId: number,
        @Arg('value', () => Int) value: number,
        @Ctx() { req }: Context
    ) {
        const { userId } = req.session

        await Member.insert({ userId, groupId, value })

        await Group.update({ id: groupId }, { membersnumber: value })

        return true
    }

    // * ALL GROUPS
    @Query(() => [Group], { nullable: true })
    async groups(): Promise<Group[]> {
        return Group.find({ relations: ["posts", "members"]})
    }

    // * SINGLE GROUP
    @Query(() => Group, { nullable: true })
    group(@Arg("id", () => Int) id: number): Promise<Group | undefined> {
        return Group.findOne(id, { relations: ["posts", "members"]})
    }

    // * CREATE GROUP
    @Mutation(() => GroupResponse)
    @UseMiddleware(Authentication)
    async createGroup(
        @Arg('options') options: GroupInput,
        @Ctx() { req }: Context
    ): Promise<GroupResponse> {
        if (options.name.length <= 2 || options.name.length >= 20) {
            return {
                errors: [{
                    field: 'name',
                    message: "group name should be between two and twenty characters long",
                }]
            }
        }

        let group
        try {
            const result = await getConnection().createQueryBuilder().insert().into(Group).values({
                name: options.name,
                description: options.description,
                creatorId: req.session.userId
            }).returning('*').execute()
            group = result.raw[0]
        } catch (err) {
            // * duplicate group name error
            if (err.code === 23505) {
                return {
                    errors: [{
                        field: 'name',
                        message: "group with this name already taken"
                    }]
                }
            }
        }

        return { group }
    }

    // * UPDATE GROUP
    @Mutation(() => Group, { nullable: true })
    @UseMiddleware(Authentication)
    async updateGroup(
        @Arg('id', () => Int) id: number,
        @Arg('name') name: string,
        @Arg('description') description: string,
        @Ctx() { req }: Context
    ): Promise<Group | null> {
        const group = await Group.findOne(id)
        if (!group) {
            return null
        }
        if (group.creatorId !== req.session.userId) {
            throw new Error("not authorized")
        }

        const result = getConnection().createQueryBuilder().update(Group).set({ name, description })
            .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId }).returning("*").execute()

        return (await result).raw[0]
    }

}