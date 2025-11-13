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
                username character varying NOT NULL, 
                email character varying NOT NULL,
                password character varying NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT now(),
                updated_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS todos (
                id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                title character varying NOT NULL,
                content character varying NOT NULL,
                author_id UUID NOT NULL,
                priority todo_priority_enum NOT NULL DEFAULT 'medium',
                state todo_state_enum NOT NULL DEFAULT 'planning',
                updated_at TIMESTAMP NOT NULL DEFAULT now(),
                created_at TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        await queryRunner.query(`
            ALTER TABLE todos 
            ADD CONSTRAINT fk_todos_author_id 
            FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        await queryRunner.query(`
            CREATE INDEX idx_todos_author_id ON todos (author_id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX idx_todos_author_id`);

        await queryRunner.query(`
            ALTER TABLE todos
            DROP CONSTRAINT fk_todos_author_id
        `);

        await queryRunner.query(`DROP TABLE todos`);
        await queryRunner.query(`DROP TABLE users`);

        await queryRunner.query(`DROP TYPE todo_priority_enum`);
        await queryRunner.query(`DROP TYPE todo_state_enum`);
    }
}
