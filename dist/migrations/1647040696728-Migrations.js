"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migrations1647040696728 = void 0;
class Migrations1647040696728 {
    constructor() {
        this.name = 'Migrations1647040696728';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE "upvote" (
                "value" integer NOT NULL,
                "userId" integer NOT NULL,
                "postId" integer NOT NULL,
                CONSTRAINT "PK_802ac6b9099f86aa24eb22d9c05" PRIMARY KEY ("userId", "postId")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "member" (
                "value" integer NOT NULL,
                "userId" integer NOT NULL,
                "groupId" integer NOT NULL,
                CONSTRAINT "PK_4e3e4366436e4b8753d6f0c5927" PRIMARY KEY ("userId", "groupId")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user" (
                "id" SERIAL NOT NULL,
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "post" (
                "id" SERIAL NOT NULL,
                "title" character varying NOT NULL,
                "text" character varying NOT NULL,
                "points" integer NOT NULL DEFAULT '0',
                "creatorId" integer NOT NULL,
                "groupId" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "group" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "creatorId" integer NOT NULL,
                "membersnumber" integer NOT NULL DEFAULT '1',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_8a45300fd825918f3b40195fbdc" UNIQUE ("name"),
                CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "upvote"
            ADD CONSTRAINT "FK_3abd9f37a94f8db3c33bda4fdae" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "upvote"
            ADD CONSTRAINT "FK_efc79eb8b81262456adfcb87de1" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "member"
            ADD CONSTRAINT "FK_1fee827e34a9a032a93cb9d56e3" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "post"
            ADD CONSTRAINT "FK_2393250dfaedc012a2286f7854e" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_2393250dfaedc012a2286f7854e"
        `);
        await queryRunner.query(`
            ALTER TABLE "post" DROP CONSTRAINT "FK_9e91e6a24261b66f53971d3f96b"
        `);
        await queryRunner.query(`
            ALTER TABLE "member" DROP CONSTRAINT "FK_1fee827e34a9a032a93cb9d56e3"
        `);
        await queryRunner.query(`
            ALTER TABLE "member" DROP CONSTRAINT "FK_08897b166dee565859b7fb2fcc8"
        `);
        await queryRunner.query(`
            ALTER TABLE "upvote" DROP CONSTRAINT "FK_efc79eb8b81262456adfcb87de1"
        `);
        await queryRunner.query(`
            ALTER TABLE "upvote" DROP CONSTRAINT "FK_3abd9f37a94f8db3c33bda4fdae"
        `);
        await queryRunner.query(`
            DROP TABLE "group"
        `);
        await queryRunner.query(`
            DROP TABLE "post"
        `);
        await queryRunner.query(`
            DROP TABLE "user"
        `);
        await queryRunner.query(`
            DROP TABLE "member"
        `);
        await queryRunner.query(`
            DROP TABLE "upvote"
        `);
    }
}
exports.Migrations1647040696728 = Migrations1647040696728;
//# sourceMappingURL=1647040696728-Migrations.js.map