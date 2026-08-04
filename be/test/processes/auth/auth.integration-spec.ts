import {afterAll, beforeAll, describe, expect, it} from "@jest/globals";
import {JwtService} from "@nestjs/jwt";
import bcrypt from "bcrypt";
import {User} from "src/modules/users/users.entity";
import {UsersService} from "src/modules/users/users.service";
import {AggregateDeletionService} from "src/processes/aggregate-deletion/aggregate-deletion.service";
import {AuthService} from "src/processes/auth/auth.service";
import {RefreshToken} from "src/processes/auth/refresh-token/refresh-token.entity";
import {RefreshTokensService} from "src/processes/auth/refresh-token/refresh-token.service";
import {hashToken} from "src/processes/auth/utils";
import {Role} from "src/types";
import {DataSource} from "typeorm";
import {SnakeNamingStrategy} from "typeorm-naming-strategies";

describe("Users and auth PostgreSQL integration", () => {
    let dataSource: DataSource;
    let usersService: UsersService;
    let authService: AuthService;
    let refreshTokensService: RefreshTokensService;

    beforeAll(async () => {
        dataSource = new DataSource({
            type: "postgres",
            host: process.env.TEST_DB_HOST ?? "127.0.0.1",
            port: Number(process.env.TEST_DB_PORT ?? 55432),
            username: process.env.TEST_DB_USER ?? "postgres",
            password: process.env.TEST_DB_PASSWORD ?? "postgres",
            database: process.env.TEST_DB_NAME ?? "backend_stage3_test",
            entities: [User, RefreshToken],
            synchronize: true,
            dropSchema: true,
            namingStrategy: new SnakeNamingStrategy(),
        });
        await dataSource.initialize();
        usersService = new UsersService(
            dataSource.getRepository(User),
            {} as AggregateDeletionService,
        );
        refreshTokensService = new RefreshTokensService(
            dataSource.getRepository(RefreshToken),
        );
        authService = new AuthService(
            usersService,
            refreshTokensService,
            new JwtService({secret: "test-secret"}),
        );
    });

    afterAll(async () => {
        if (dataSource?.isInitialized) {
            await dataSource.destroy();
        }
    });

    it("persists a bcrypt hash and authenticates without returning plaintext", async () => {
        const email = `reader-${crypto.randomUUID()}@example.com`;
        const created = await usersService.create({
            username: "reader",
            email,
            password: "StrongPassword123",
            role: Role.USER,
        });

        const persisted = await dataSource
            .getRepository(User)
            .createQueryBuilder("user")
            .addSelect("user.password")
            .where("user.id = :id", {id: created.id})
            .getOneOrFail();
        const publicRead = await dataSource.getRepository(User).findOneByOrFail({
            id: created.id,
        });

        expect(persisted.password).not.toBe("StrongPassword123");
        expect(publicRead.password).toBeUndefined();
        await expect(
            bcrypt.compare("StrongPassword123", persisted.password!),
        ).resolves.toBe(true);
        await expect(
            authService.signIn(email, "StrongPassword123"),
        ).resolves.toMatchObject({id: created.id, email});
    });

    it("enforces unique email at the application boundary", async () => {
        const email = `duplicate-${crypto.randomUUID()}@example.com`;
        const input = {
            username: "reader",
            email,
            password: "StrongPassword123",
            role: Role.USER,
        };

        await usersService.create(input);
        await expect(usersService.create(input)).rejects.toMatchObject({
            status: 409,
        });
    });

    it("stores, validates, revokes, and replaces refresh tokens", async () => {
        const user = await usersService.create({
            username: "token-owner",
            email: `token-${crypto.randomUUID()}@example.com`,
            password: "StrongPassword123",
            role: Role.USER,
        });
        const rawToken = await refreshTokensService.createToken(user.id);

        const stored = await dataSource
            .getRepository(RefreshToken)
            .findOneByOrFail({
                userId: user.id,
            });
        expect(stored.tokenHash).toBe(hashToken(rawToken));
        await expect(
            refreshTokensService.validateToken(user.id, rawToken),
        ).resolves.toBe(true);

        await refreshTokensService.revokeToken(user.id, rawToken);
        await expect(
            refreshTokensService.validateToken(user.id, rawToken),
        ).resolves.toBe(false);

        const replacement = await refreshTokensService.createToken(user.id);
        expect(replacement).not.toBe(rawToken);
        await expect(
            refreshTokensService.validateToken(user.id, replacement),
        ).resolves.toBe(true);

        await dataSource.getRepository(RefreshToken).save({
            userId: user.id,
            tokenHash: hashToken("expired-token"),
            expiresAt: new Date(Date.now() - 1_000),
        });
        await expect(
            refreshTokensService.findByHash(hashToken("expired-token")),
        ).resolves.toBeNull();
    });
});
