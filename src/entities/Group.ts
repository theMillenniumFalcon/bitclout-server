import {Entity, PrimaryGeneratedColumn, CreateDateColumn, Column, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Post } from "./Post";
import { Member } from "./Member";

@ObjectType() // * to convert the class to a graphql type
@Entity()
export class Group extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  name!: string;

  @Field()
  @Column()
  description!: string;

  @Field()
  @Column()
  creatorId: number;

  @Field()
  @Column({ type: "int", default: 1 })
  membersnumber!: number;

  @Field(() => [Post])
  @OneToMany(() => Post, post => post.group)
  posts: Post[];

  @Field(() => [Member])
  @OneToMany(() => Member, member => member.group)
  members: Member[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}