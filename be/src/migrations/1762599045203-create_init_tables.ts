import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateInitTables1762599045203 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE todo_priority_enum AS ENUM ('low', 'medium', 'high', 'super')
        `);

        await queryRunner.query(`
            CREATE TYPE todo_state_enum AS ENUM ('in_work', 'planning', 'finished', 'canceled')
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                email character varying NOT NULL,
                password character varying NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                title character varying NOT NULL,
                content character varying NOT NULL,
                "authorId" UUID NOT NULL,
                priority todo_priority_enum NOT NULL DEFAULT 'medium',
                state todo_state_enum NOT NULL DEFAULT 'planning',
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            ALTER TABLE todos 
            ADD CONSTRAINT FK_todos_author_id 
            FOREIGN KEY ("authorId") REFERENCES users(id) ON DELETE CASCADE
        `);

        await queryRunner.query(`
            CREATE INDEX IDX_todos_authorId ON todos ("authorId")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IDX_todos_authorId`);

        await queryRunner.query(`
            ALTER TABLE todos
            DROP CONSTRAINT FK_todos_author_id
        `);

        await queryRunner.query(`DROP TABLE todos`);
        await queryRunner.query(`DROP TABLE users`);

        await queryRunner.query(`DROP TYPE todo_priority_enum`);
        await queryRunner.query(`DROP TYPE todo_state_enum`);
    }
}
