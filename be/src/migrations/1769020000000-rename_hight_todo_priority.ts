import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameHightTodoPriority1769020000000
    implements MigrationInterface
{
    name = "RenameHightTodoPriority1769020000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON t.oid = e.enumtypid
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                        AND t.typname = 'todo_priority'
                        AND e.enumlabel = 'Hight'
                ) AND NOT EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON t.oid = e.enumtypid
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                        AND t.typname = 'todo_priority'
                        AND e.enumlabel = 'High'
                ) THEN
                    ALTER TYPE "public"."todo_priority" RENAME VALUE 'Hight' TO 'High';
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON t.oid = e.enumtypid
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                        AND t.typname = 'todo_priority'
                        AND e.enumlabel = 'High'
                ) AND NOT EXISTS (
                    SELECT 1
                    FROM pg_enum e
                    JOIN pg_type t ON t.oid = e.enumtypid
                    JOIN pg_namespace n ON n.oid = t.typnamespace
                    WHERE n.nspname = 'public'
                        AND t.typname = 'todo_priority'
                        AND e.enumlabel = 'Hight'
                ) THEN
                    ALTER TYPE "public"."todo_priority" RENAME VALUE 'High' TO 'Hight';
                END IF;
            END $$;
        `);
    }
}
