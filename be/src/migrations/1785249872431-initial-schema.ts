import bcrypt from "bcrypt";
import {MigrationInterface, QueryRunner} from "typeorm";

const PUBLIC_TODO_OWNER_EMAIL = "gracheveloper@gmail.com";
const PUBLIC_TODO_OWNER_USERNAME = "Коля Грачев";

export class InitialSchema1785249872431 implements MigrationInterface {
    name = "InitialSchema1785249872431";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."entity_liked_type" AS ENUM('comment', 'todo', 'article')`,
        );
        await queryRunner.query(
            `CREATE TABLE "likes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "author_id" uuid NOT NULL, "entity_type" "public"."entity_liked_type" NOT NULL, "entity_id" uuid NOT NULL, CONSTRAINT "UQ_likes_author_entity" UNIQUE ("author_id", "entity_type", "entity_id"), CONSTRAINT "PK_a9323de3f8bced7539a794b4a37" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "checklists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "text" text NOT NULL, "progress" integer NOT NULL DEFAULT '0', "todo_id" uuid NOT NULL, CONSTRAINT "UQ_0b84362a78c887d85b9b5a6403b" UNIQUE ("todo_id"), CONSTRAINT "REL_0b84362a78c887d85b9b5a6403" UNIQUE ("todo_id"), CONSTRAINT "PK_336ade2047f3d713e1afa20d2c6" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."todo_priority" AS ENUM('Low', 'Medium', 'High', 'Super')`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."todo_state" AS ENUM('In_work', 'Planning', 'Finished', 'Canceled')`,
        );
        await queryRunner.query(
            `CREATE TABLE "todos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "content" character varying NOT NULL, "author_id" uuid NOT NULL, "priority" "public"."todo_priority" NOT NULL DEFAULT 'Medium', "state" "public"."todo_state" NOT NULL DEFAULT 'Planning', "likes_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_ca8cafd59ca6faaf67995344225" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."user_role" AS ENUM('Admin', 'Writer', 'User')`,
        );
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying, "yandex_id" character varying, "role" "public"."user_role" NOT NULL DEFAULT 'User', "avatar" character varying, "now_reading" character varying, "now_watch" character varying, "now_being_in" character varying, "now_listening" character varying, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_ba43f6d899989a24b7a52b05c27" UNIQUE ("yandex_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."entity_image_type" AS ENUM('user', 'article', 'todo')`,
        );
        await queryRunner.query(
            `CREATE TABLE "attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "s3_key" character varying NOT NULL, "mime_type" character varying NOT NULL, "size" integer NOT NULL, "entity_type" "public"."entity_image_type" NOT NULL, "entity_id" uuid NOT NULL, CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_attachments_entity" ON "attachments" ("entity_type", "entity_id") `,
        );
        await queryRunner.query(
            `CREATE TYPE "public"."entity_commented_type" AS ENUM('todo', 'article')`,
        );
        await queryRunner.query(
            `CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "content" character varying NOT NULL, "entity_type" "public"."entity_commented_type" NOT NULL, "entity_id" uuid NOT NULL, "parent_id" uuid, "depth" integer NOT NULL DEFAULT '0', "likes_count" integer NOT NULL DEFAULT '0', "author_id" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" character varying(300) NOT NULL, "image" character varying NOT NULL, "content" text NOT NULL, "read_time" integer, "likes_count" integer NOT NULL DEFAULT '0', "is_draft" boolean NOT NULL DEFAULT true, "authorId" uuid, CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "revoked" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "article_tags" ("articleId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_bfcd6ae5865482ee63ece446586" PRIMARY KEY ("articleId", "tagId"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_acbc7f775fb5e3fe2627477b5f" ON "article_tags" ("articleId") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_83a0534713c9e7f6bb2110c7bc" ON "article_tags" ("tagId") `,
        );
        await queryRunner.query(
            `ALTER TABLE "checklists" ADD CONSTRAINT "FK_0b84362a78c887d85b9b5a6403b" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "comments" ADD CONSTRAINT "FK_e6d38899c31997c45d128a8973b" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "articles" ADD CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_acbc7f775fb5e3fe2627477b5f7" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );
        await queryRunner.query(
            `ALTER TABLE "article_tags" ADD CONSTRAINT "FK_83a0534713c9e7f6bb2110c7bcc" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        );

        const password = process.env.GRACHEVELOPERS_PASSWORD;
        if (!password) {
            throw new Error(
                "GRACHEVELOPERS_PASSWORD is required to seed public todo owner",
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);
        await queryRunner.query(
            `
                INSERT INTO "users" ("username", "email", "password", "role")
                VALUES ($1, $2, $3, $4)
            `,
            [
                PUBLIC_TODO_OWNER_USERNAME,
                PUBLIC_TODO_OWNER_EMAIL,
                passwordHash,
                "Admin",
            ],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "article_tags" DROP CONSTRAINT "FK_83a0534713c9e7f6bb2110c7bcc"`,
        );
        await queryRunner.query(
            `ALTER TABLE "article_tags" DROP CONSTRAINT "FK_acbc7f775fb5e3fe2627477b5f7"`,
        );
        await queryRunner.query(
            `ALTER TABLE "articles" DROP CONSTRAINT "FK_65d9ccc1b02f4d904e90bd76a34"`,
        );
        await queryRunner.query(
            `ALTER TABLE "comments" DROP CONSTRAINT "FK_e6d38899c31997c45d128a8973b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "checklists" DROP CONSTRAINT "FK_0b84362a78c887d85b9b5a6403b"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_83a0534713c9e7f6bb2110c7bc"`,
        );
        await queryRunner.query(
            `DROP INDEX "public"."IDX_acbc7f775fb5e3fe2627477b5f"`,
        );
        await queryRunner.query(`DROP TABLE "article_tags"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "articles"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TYPE "public"."entity_commented_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_attachments_entity"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
        await queryRunner.query(`DROP TYPE "public"."entity_image_type"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_role"`);
        await queryRunner.query(`DROP TABLE "todos"`);
        await queryRunner.query(`DROP TYPE "public"."todo_state"`);
        await queryRunner.query(`DROP TYPE "public"."todo_priority"`);
        await queryRunner.query(`DROP TABLE "checklists"`);
        await queryRunner.query(`DROP TABLE "likes"`);
        await queryRunner.query(`DROP TYPE "public"."entity_liked_type"`);
    }
}
