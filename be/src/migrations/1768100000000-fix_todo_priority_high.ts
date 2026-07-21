import {MigrationInterface, QueryRunner} from "typeorm";

export class FixTodoPriorityHigh1768100000000 implements MigrationInterface {
    name = "FixTodoPriorityHigh1768100000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'todo_priority') THEN
                    ALTER TYPE todo_priority RENAME TO todo_priority_old;
                    CREATE TYPE todo_priority AS ENUM ('High', 'Medium', 'Low', 'Super');
                    ALTER TABLE todos ALTER COLUMN priority DROP DEFAULT;
                    ALTER TABLE todos ALTER COLUMN priority TYPE todo_priority
                        USING (
                            CASE priority::text
                                WHEN 'Hight' THEN 'High'
                                ELSE priority::text
                            END
                        )::todo_priority;
                    ALTER TABLE todos ALTER COLUMN priority SET DEFAULT 'Medium';
                    DROP TYPE todo_priority_old;
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'todo_priority') THEN
                    ALTER TYPE todo_priority RENAME TO todo_priority_old;
                    CREATE TYPE todo_priority AS ENUM ('Hight', 'Medium', 'Low', 'Super');
                    ALTER TABLE todos ALTER COLUMN priority DROP DEFAULT;
                    ALTER TABLE todos ALTER COLUMN priority TYPE todo_priority
                        USING (
                            CASE priority::text
                                WHEN 'High' THEN 'Hight'
                                ELSE priority::text
                            END
                        )::todo_priority;
                    ALTER TABLE todos ALTER COLUMN priority SET DEFAULT 'Medium';
                    DROP TYPE todo_priority_old;
                END IF;
            END $$;
        `);
    }
}
