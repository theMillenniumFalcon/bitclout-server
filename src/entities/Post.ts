import {Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, BaseEntity, ManyToOne, OneToMany} from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { User } from "./User";
import { Upvote } from "./Upvote";
import { Group } from "./Group";

@ObjectType() // * to convert the class to a graphql type
@Entity()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column()
  title!: string;
  
  @Field()
  @Column()
  text!: string;

  @Field()
  @Column({ type: "int", default: 0 })
  points!: number;

  @Field(() => Int, { nullable: true })
  voteStatus: number | null;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @Column()
  groupId: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.posts)
  creator: User;

  @OneToMany(() => Upvote, upvote => upvote.post)
  upvotes: Upvote[];

  @Field(() => Group)
  @ManyToOne(() => Group, group => group.posts)
  group: Group;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}