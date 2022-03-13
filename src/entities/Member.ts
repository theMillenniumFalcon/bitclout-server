import {Entity, BaseEntity, ManyToOne, PrimaryColumn, Column } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { User } from "./User";
import { Group } from "./Group";

// * user -> member <- group

@ObjectType() // * to convert the class to a graphql type
@Entity()
export class Member extends BaseEntity {
  @Field()
  @Column({ type: "int" })
  value: number;

  @Field()
  @PrimaryColumn()
  userId: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.members)
  user: User;

  @Field()
  @PrimaryColumn()
  groupId: number;

  @Field(() => Group)
  @ManyToOne(() => Group, group => group.members)
  group: Group;
}