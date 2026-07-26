import {MigrationInterface, QueryRunner} from "typeorm";

export class AddYandexAuthToUsers1785000000000
    implements MigrationInterface
{
    name = "AddYandexAuthToUsers1785000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "users" ADD "yandex_id" character varying`,
        );
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_yandex_id" UNIQUE ("yandex_id")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "users" DROP CONSTRAINT "UQ_users_yandex_id"`,
        );
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "yandex_id"`);
        await queryRunner.query(
            `DELETE FROM "users" WHERE "password" IS NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL`,
        );
    }
}
