import {MigrationInterface, QueryRunner} from "typeorm";

export class AddArticleDescription1790000000000
    implements MigrationInterface
{
    name = "AddArticleDescription1790000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "likes"
            WHERE "entity_type" = 'comment'
              AND "entity_id" IN (
                  SELECT "id"
                  FROM "comments"
                  WHERE "entity_type" = 'article'
              )
        `);
        await queryRunner.query(
            `DELETE FROM "comments" WHERE "entity_type" = 'article'`,
        );
        await queryRunner.query(
            `DELETE FROM "likes" WHERE "entity_type" = 'article'`,
        );
        await queryRunner.query(
            `DELETE FROM "attachments" WHERE "entity_type" = 'article'`,
        );
        await queryRunner.query(`DELETE FROM "articles"`);
        await queryRunner.query(
            `ALTER TABLE "articles" ADD "description" character varying(300) NOT NULL`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "articles" DROP COLUMN "description"`,
        );
    }
}
