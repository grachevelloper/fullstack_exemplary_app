import {MigrationInterface, QueryRunner} from "typeorm";

export class RefreshTokensTable1762709412691 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID NOT NULL,
                token_hash TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                revoked BOOLEAN DEFAULT FALSE
            )
        `);

        await queryRunner.query(`
            ALTER TABLE refresh_tokens 
            ADD CONSTRAINT fk_refresh_tokens_user_id 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);

        await queryRunner.query(`
            CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX idx_refresh_tokens_user_id`);

        await queryRunner.query(`
            ALTER TABLE refresh_tokens 
            DROP CONSTRAINT fk_refresh_tokens_user_id
        `);

        await queryRunner.query(`DROP TABLE refresh_tokens`);
    }
}
