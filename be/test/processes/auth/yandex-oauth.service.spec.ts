import {afterEach, describe, expect, it, jest} from "@jest/globals";
import {ConfigService} from "@nestjs/config";
import {User} from "src/modules/users/users.entity";
import {UsersService} from "src/modules/users/users.service";
import {YandexOAuthService} from "src/processes/auth/yandex-oauth.service";
import {Role} from "src/types";

describe("YandexOAuthService", () => {
    const config = {
        YANDEX_CLIENT_ID: "client-id",
        YANDEX_CLIENT_SECRET: "client-secret",
        YANDEX_REDIRECT_URI: "https://example.com/auth/yandex/callback",
    };

    afterEach(() => {
        jest.restoreAllMocks();
    });

    function createService(usersService: Partial<UsersService>) {
        const configService = {
            get: jest.fn((name: keyof typeof config) => config[name]),
        };

        return new YandexOAuthService(
            configService as unknown as ConfigService,
            usersService as UsersService,
        );
    }

    it("builds an authorization URL with state and the configured callback", () => {
        const service = createService({});
        const url = new URL(service.getAuthorizationUrl("secure-state"));

        expect(url.origin + url.pathname).toBe(
            "https://oauth.yandex.ru/authorize",
        );
        expect(url.searchParams.get("client_id")).toBe("client-id");
        expect(url.searchParams.get("redirect_uri")).toBe(
            config.YANDEX_REDIRECT_URI,
        );
        expect(url.searchParams.get("state")).toBe("secure-state");
    });

    it("maps a new Yandex profile into standard user fields", async () => {
        const createdUser = Object.assign(new User(), {
            id: "user-id",
            yandexId: "yandex-user-id",
            username: "Nikolay Grachev",
            email: "nick@example.com",
            avatar:
                "https://avatars.yandex.net/get-yapic/avatar-id/islands-200",
            role: Role.USER,
        });
        const usersService = {
            findByYandexId: jest
                .fn<UsersService["findByYandexId"]>()
                .mockResolvedValue(null),
            createFromYandex: jest
                .fn<UsersService["createFromYandex"]>()
                .mockResolvedValue(createdUser),
        };
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                new Response(JSON.stringify({access_token: "oauth-token"}), {
                    status: 200,
                }),
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        id: "yandex-user-id",
                        default_email: "Nick@Example.com",
                        display_name: "Nikolay Grachev",
                        default_avatar_id: "avatar-id",
                        is_avatar_empty: false,
                    }),
                    {status: 200},
                ),
            );

        const service = createService(usersService);
        await expect(service.authenticate("confirmation-code")).resolves.toBe(
            createdUser,
        );
        expect(usersService.createFromYandex).toHaveBeenCalledWith({
            yandexId: "yandex-user-id",
            email: "nick@example.com",
            username: "Nikolay Grachev",
            avatar:
                "https://avatars.yandex.net/get-yapic/avatar-id/islands-200",
        });
    });

    it("returns an existing Yandex user without updating profile fields", async () => {
        const existingUser = Object.assign(new User(), {
            id: "user-id",
            yandexId: "yandex-user-id",
            username: "Locally edited name",
            email: "local@example.com",
            avatar: null,
            role: Role.USER,
        });
        const usersService = {
            findByYandexId: jest
                .fn<UsersService["findByYandexId"]>()
                .mockResolvedValue(existingUser),
            createFromYandex: jest.fn<UsersService["createFromYandex"]>(),
        };
        jest.spyOn(global, "fetch")
            .mockResolvedValueOnce(
                new Response(JSON.stringify({access_token: "oauth-token"}), {
                    status: 200,
                }),
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        id: "yandex-user-id",
                        default_email: "changed@example.com",
                        display_name: "Changed in Yandex",
                    }),
                    {status: 200},
                ),
            );

        const service = createService(usersService);
        await expect(service.authenticate("confirmation-code")).resolves.toBe(
            existingUser,
        );
        expect(usersService.createFromYandex).not.toHaveBeenCalled();
    });
});
