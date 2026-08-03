import {describe, expect, it, jest} from "@jest/globals";
import {UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import bcrypt from "bcrypt";
import {User} from "src/modules/users/users.entity";
import {UsersService} from "src/modules/users/users.service";
import {AuthService} from "src/processes/auth/auth.service";
import {RefreshTokensService} from "src/processes/auth/refresh-token/refresh-token.service";
import {hashToken} from "src/processes/auth/utils";
import {Role} from "src/types";

describe("AuthService", () => {
    function createService({
        usersService = {},
        refreshTokensService = {},
        jwtService = {},
    }: {
        usersService?: Partial<UsersService>;
        refreshTokensService?: Partial<RefreshTokensService>;
        jwtService?: unknown;
    }): AuthService {
        return new AuthService(
            usersService as UsersService,
            refreshTokensService as RefreshTokensService,
            jwtService as JwtService,
        );
    }

    it("verifies a password with bcrypt", async () => {
        const user = Object.assign(new User(), {
            id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
            email: "reader@example.com",
            password: await bcrypt.hash("StrongPassword123", 4),
            role: Role.USER,
        });
        const usersService = {
            findByEmail: jest
                .fn<UsersService["findByEmail"]>()
                .mockResolvedValue(user),
        };
        const service = createService({usersService});
        await expect(
            service.signIn(user.email, "StrongPassword123"),
        ).resolves.toBe(user);
    });

    it("returns an incorrect password error when the email exists", async () => {
        const user = Object.assign(new User(), {
            id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
            email: "reader@example.com",
            password: await bcrypt.hash("StrongPassword123", 4),
            role: Role.USER,
        });
        const usersService = {
            findByEmail: jest
                .fn<UsersService["findByEmail"]>()
                .mockResolvedValue(user),
        };
        const service = createService({usersService});

        await expect(
            service.signIn(user.email, "wrong-password"),
        ).rejects.toEqual(new UnauthorizedException("Incorrect password"));
    });

    it("returns a user-not-found error when the email does not exist", async () => {
        const usersService = {
            findByEmail: jest
                .fn<UsersService["findByEmail"]>()
                .mockResolvedValue(null),
        };
        const service = createService({usersService});

        await expect(
            service.signIn("missing@example.com", "StrongPassword123"),
        ).rejects.toEqual(new UnauthorizedException("User not found"));
    });

    it("rotates a refresh token and signs a new access token with sub and role", async () => {
        const user = Object.assign(new User(), {
            id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
            email: "reader@example.com",
            role: Role.USER,
        });
        const usersService = {
            findById: jest.fn<UsersService["findById"]>().mockResolvedValue(user),
        };
        const refreshTokensService = {
            findByHash: jest
                .fn<RefreshTokensService["findByHash"]>()
                .mockResolvedValue({userId: user.id} as never),
            revokeToken: jest
                .fn<RefreshTokensService["revokeToken"]>()
                .mockResolvedValue(),
            createToken: jest
                .fn<RefreshTokensService["createToken"]>()
                .mockResolvedValue("new-refresh"),
        };
        const jwtService = {
            signAsync: jest
                .fn<(payload: {sub: string}) => Promise<string>>()
                .mockResolvedValue("new-access"),
        };
        const service = createService({
            usersService,
            refreshTokensService,
            jwtService,
        });

        await expect(service.refresh("old-refresh")).resolves.toEqual({
            user,
            accessToken: "new-access",
            refreshToken: "new-refresh",
        });
        expect(refreshTokensService.findByHash).toHaveBeenCalledWith(
            hashToken("old-refresh"),
        );
        expect(refreshTokensService.revokeToken).toHaveBeenCalledWith(
            user.id,
            "old-refresh",
        );
        expect(jwtService.signAsync).toHaveBeenCalledWith({
            sub: user.id,
        });
    });

    it("rejects missing and invalid refresh tokens", async () => {
        const refreshTokensService = {
            findByHash: jest
                .fn<RefreshTokensService["findByHash"]>()
                .mockResolvedValue(null),
        };
        const service = createService({refreshTokensService});

        await expect(service.refresh(undefined)).rejects.toEqual(
            new UnauthorizedException("Refresh token not found"),
        );
        await expect(service.refresh("unusable")).rejects.toEqual(
            new UnauthorizedException("Invalid refresh token"),
        );
    });
});
