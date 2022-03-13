import { Field, ObjectType } from "type-graphql";
import { FieldError } from "../errors/FieldError";
import { Group } from "../entities/Group";

@ObjectType()
export class GroupResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => Group, { nullable: true })
    group?: Group
}