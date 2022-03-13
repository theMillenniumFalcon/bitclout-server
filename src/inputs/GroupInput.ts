import { Field, InputType } from "type-graphql";

@InputType()
export class GroupInput {
    @Field()
    name: string;

    @Field()
    description: string;
}