import {describe, expect, it, jest} from "@jest/globals";
import {ConflictException} from "@nestjs/common";
import {Request, Response} from "express";
import {User} from "src/modules/users/users.entity";
import {UsersMapper} from "src/modules/users/users.mapper";
import {AuthController} from "src/processes/auth/auth.controller";
import {AuthService} from "src/processes/auth/auth.service";
import {clearTokenConfig} from "src/processes/auth/utils";
import {YandexOAuthService} from "src/processes/auth/yandex-oauth.service";
import {Role} from "src/types";

describe("AuthController", () => {
    const user = Object.assign(new User(), {
        id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        username: "reader",
        email: "reader@example.com",
        password: "secret-hash",
        role: Role.USER,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
    });

    it("returns a safe user and delegates token issuance", async () => {
        const authService = {
            signIn: jest.fn<AuthService["signIn"]>().mockResolvedValue(user),
            issueTokens: jest
                .fn<AuthService["issueTokens"]>()
                .mockResolvedValue({
                    accessToken: "access-token",
                    refreshToken: "refresh-token",
                }),
        } as unknown as AuthService;
        const response = {cookie: jest.fn()} as unknown as Response;
        const controller = new AuthController(
            authService,
            {} as YandexOAuthService,
        );

        const result = await controller.signIn(
            {email: user.email, password: "StrongPassword123"},
            response,
        );

        expect(result).toEqual(UsersMapper.toResponse(user));
        expect(result).not.toHaveProperty("password");
        expect(authService.issueTokens).toHaveBeenCalledWith(user);
        expect(response.cookie).toHaveBeenCalledWith(
            "accessToken",
            "access-token",
            expect.objectContaining({httpOnly: true}),
        );
        expect(response.cookie).toHaveBeenCalledWith(
            "refreshToken",
            "refresh-token",
            expect.objectContaining({httpOnly: true}),
        );
    });

    it("delegates refresh rotation and writes replacement cookies", async () => {
        const authService = {
            refresh: jest.fn<AuthService["refresh"]>().mockResolvedValue({
                user,
                accessToken: "new-access",
                refreshToken: "new-refresh",
            }),
        } as unknown as AuthService;
        const response = {cookie: jest.fn()} as unknown as Response;
        const controller = new AuthController(
            authService,
            {} as YandexOAuthService,
        );

        await controller.refresh(
            {cookies: {refreshToken: "old-refresh"}} as unknown as Request,
            response,
        );

        expect(authService.refresh).toHaveBeenCalledWith("old-refresh");
        expect(response.cookie).toHaveBeenCalledWith(
            "accessToken",
            "new-access",
            expect.objectContaining({httpOnly: true}),
        );
        expect(response.cookie).toHaveBeenCalledWith(
            "refreshToken",
            "new-refresh",
            expect.objectContaining({httpOnly: true}),
        );
    });

    it("clears both authentication cookies on logout", async () => {
        const authService = {
            logout: jest.fn<AuthService["logout"]>().mockResolvedValue(),
        } as unknown as AuthService;
        const response = {clearCookie: jest.fn()} as unknown as Response;
        const controller = new AuthController(
            authService,
            {} as YandexOAuthService,
        );

        await controller.logout(
            {cookies: {refreshToken: "refresh-token"}} as unknown as Request,
            {id: user.id, role: user.role} as never,
            response,
        );

        expect(authService.logout).toHaveBeenCalledWith(
            user.id,
            "refresh-token",
        );
        expect(response.clearCookie).toHaveBeenCalledWith(
            "accessToken",
            clearTokenConfig(),
        );
        expect(response.clearCookie).toHaveBeenCalledWith(
            "refreshToken",
            clearTokenConfig(),
        );
    });

    it("rejects a Yandex callback with an invalid state", async () => {
        const authService = {} as AuthService;
        const yandexOAuthService = {
            authenticate: jest.fn<YandexOAuthService["authenticate"]>(),
        } as unknown as YandexOAuthService;
        const response = {
            clearCookie: jest.fn(),
            redirect: jest.fn(),
        } as unknown as Response;
        const controller = new AuthController(
            authService,
            yandexOAuthService,
        );

        await controller.yandexCallback(
            "code",
            "unexpected-state",
            undefined,
            {
                cookies: {
                    yandexOauthState: "expected-state",
                    yandexOauthSource: "signup",
                },
            } as unknown as Request,
            response,
        );

        expect(yandexOAuthService.authenticate).not.toHaveBeenCalled();
        expect(response.redirect).toHaveBeenCalledWith(
            "/auth/signup?oauthError=invalid_state",
        );
    });

    it("redirects an existing-email conflict back to password sign-in", async () => {
        const authService = {} as AuthService;
        const yandexOAuthService = {
            authenticate: jest
                .fn<YandexOAuthService["authenticate"]>()
                .mockRejectedValue(
                    new ConflictException(
                        "User with this email already exists",
                    ),
                ),
        } as unknown as YandexOAuthService;
        const response = {
            clearCookie: jest.fn(),
            redirect: jest.fn(),
        } as unknown as Response;
        const controller = new AuthController(
            authService,
            yandexOAuthService,
        );

        await controller.yandexCallback(
            "code",
            "expected-state",
            undefined,
            {
                cookies: {
                    yandexOauthState: "expected-state",
                    yandexOauthSource: "signin",
                },
            } as unknown as Request,
            response,
        );

        expect(response.redirect).toHaveBeenCalledWith(
            "/auth/signin?oauthError=email_conflict",
        );
    });
});
