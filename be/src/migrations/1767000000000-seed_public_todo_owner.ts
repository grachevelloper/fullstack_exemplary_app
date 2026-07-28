import bcrypt from "bcrypt";
import {MigrationInterface, QueryRunner} from "typeorm";

const PUBLIC_TODO_OWNER_EMAIL = "gracheveloper@gmail.com";
const PUBLIC_TODO_OWNER_USERNAME = "Коля Грачев";

export class SeedPublicTodoOwner1767000000000 implements MigrationInterface {
    name = "SeedPublicTodoOwner1767000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
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
                ON CONFLICT ("email") DO NOTHING
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
            `
                DELETE FROM "users"
                WHERE "email" = $1
            `,
            [PUBLIC_TODO_OWNER_EMAIL],
        );
    }
}
