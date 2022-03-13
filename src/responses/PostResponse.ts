import { Post } from "../entities/Post";
import { Field, ObjectType } from "type-graphql";
import { FieldError } from "../errors/FieldError";

@ObjectType()
export class PostResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => Post, { nullable: true })
    post?: Post
}