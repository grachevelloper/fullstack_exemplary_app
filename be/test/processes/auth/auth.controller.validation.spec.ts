import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {INestApplication, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {Test} from "@nestjs/testing";
import {configureApplication} from "src/app/application-setup";
import {AuthController} from "src/processes/auth/auth.controller";
import {AuthService} from "src/processes/auth/auth.service";
import {YandexOAuthService} from "src/processes/auth/yandex-oauth.service";
import request from "supertest";

describe("AuthController validation", () => {
    let app: INestApplication;

    const authService = {
        signIn: jest.fn(),
        issueTokens: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {provide: AuthService, useValue: authService},
                {provide: YandexOAuthService, useValue: {}},
                {provide: JwtService, useValue: {verifyAsync: jest.fn()}},
            ],
        }).compile();

        app = moduleRef.createNestApplication();
        configureApplication(app);
        await app.init();
        jest.clearAllMocks();
    });

    afterEach(async () => {
        if (app) {
            await app.close();
        }
    });

    it("passes weak signin passwords to authentication instead of password-strength validation", async () => {
        authService.signIn.mockRejectedValue(
            new UnauthorizedException("Incorrect password") as never,
        );

        const response = await request(app.getHttpServer())
            .post("/api/auth/signin")
            .send({
                email: "user@example.com",
                password: "wrong",
            })
            .expect(401);

        expect(authService.signIn).toHaveBeenCalledWith(
            "user@example.com",
            "wrong",
        );
        expect(response.body.message).toBe("Incorrect password");
    });
});
