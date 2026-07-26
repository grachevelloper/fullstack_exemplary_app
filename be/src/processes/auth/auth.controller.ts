import {
    Body,
    ConflictException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from "@nestjs/common";
import {randomBytes, timingSafeEqual} from "crypto";
import {Request, Response} from "express";

import {UserResponseDto} from "@/users/dto/user-response.dto";
import {SigninUserDto, SignupUserDto} from "@/users/user.dto";
import {UsersMapper} from "@/users/users.mapper";

import {Public} from "../../shared/decorators/auth.decorator";
import {CurrentUser} from "../../shared/decorators/current-user.decorator";
import {AuthGuard} from "../../shared/guards/auth.guard";
import {AuthenticatedUser} from "../../types";
import {AuthService} from "./auth.service";
import {ACCESS_TOKEN_TTL_IN_MS, REFRESH_TOKEN_TTL_IN_MS} from "./constants";
import {clearTokenConfig, tokenConfig} from "./utils";
import {YandexOAuthService} from "./yandex-oauth.service";

const YANDEX_STATE_COOKIE = "yandexOauthState";
const YANDEX_SOURCE_COOKIE = "yandexOauthSource";
const YANDEX_STATE_TTL_IN_MS = 10 * 60 * 1000;
type YandexAuthSource = "signin" | "signup";

@Controller("auth")
export class AuthController {
    constructor(
        private authService: AuthService,
        private yandexOAuthService: YandexOAuthService,
    ) {}

    @Public()
    @HttpCode(HttpStatus.CREATED)
    @Post("/signup")
    async signUp(
        @Body() signUpDto: SignupUserDto,
        @Res({passthrough: true}) response: Response,
    ): Promise<UserResponseDto> {
        const result = await this.authService.signUp(
            signUpDto.username,

            signUpDto.email,
            signUpDto.password,
        );

        await this.setTokenCookies(result, response);
        return UsersMapper.toResponse(result);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("/signin")
    async signIn(
        @Body() signInDto: SigninUserDto,
        @Res({passthrough: true}) response: Response,
    ): Promise<UserResponseDto> {
        const result = await this.authService.signIn(
            signInDto.email,
            signInDto.password,
        );

        await this.setTokenCookies(result, response);
        return UsersMapper.toResponse(result);
    }

    @Public()
    @Get("/yandex")
    yandexSignIn(
        @Query("source") requestedSource: string | undefined,
        @Res() response: Response,
    ): void {
        const source: YandexAuthSource =
            requestedSource === "signup" ? "signup" : "signin";
        const state = randomBytes(32).toString("hex");

        response.cookie(
            YANDEX_STATE_COOKIE,
            state,
            tokenConfig(YANDEX_STATE_TTL_IN_MS),
        );
        response.cookie(
            YANDEX_SOURCE_COOKIE,
            source,
            tokenConfig(YANDEX_STATE_TTL_IN_MS),
        );
        response.redirect(this.yandexOAuthService.getAuthorizationUrl(state));
    }

    @Public()
    @Get("/yandex/callback")
    async yandexCallback(
        @Query("code") code: string | undefined,
        @Query("state") state: string | undefined,
        @Query("error") yandexError: string | undefined,
        @Req() request: Request,
        @Res() response: Response,
    ): Promise<void> {
        const source: YandexAuthSource =
            request.cookies?.[YANDEX_SOURCE_COOKIE] === "signup"
                ? "signup"
                : "signin";
        const errorPath = `/auth/${source}`;

        response.clearCookie(YANDEX_STATE_COOKIE, clearTokenConfig());
        response.clearCookie(YANDEX_SOURCE_COOKIE, clearTokenConfig());

        if (yandexError) {
            response.redirect(`${errorPath}?oauthError=access_denied`);
            return;
        }
        if (
            !code ||
            !state ||
            !this.isValidState(request.cookies?.[YANDEX_STATE_COOKIE], state)
        ) {
            response.redirect(`${errorPath}?oauthError=invalid_state`);
            return;
        }

        try {
            const user = await this.yandexOAuthService.authenticate(code);
            await this.setTokenCookies(user, response);
            response.redirect("/");
        } catch (error) {
            const errorCode =
                error instanceof ConflictException
                    ? "email_conflict"
                    : error instanceof UnauthorizedException
                      ? "unauthorized"
                      : "provider_error";
            response.redirect(`${errorPath}?oauthError=${errorCode}`);
        }
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post("/refresh")
    async refresh(
        @Req() request: Request,
        @Res({passthrough: true}) response: Response,
    ) {
        const result = await this.authService.refresh(
            request.cookies?.refreshToken,
        );

        this.setCookies(response, result.accessToken, result.refreshToken);

        return {message: "Tokens refreshed successfully"};
    }

    @HttpCode(HttpStatus.OK)
    @Post("/logout")
    async logout(
        @Req() req: Request,
        @CurrentUser() user: AuthenticatedUser,
        @Res({passthrough: true}) response: Response,
    ) {
        await this.authService.logout(user.id, req.cookies?.refreshToken);

        response.clearCookie("accessToken", clearTokenConfig());
        response.clearCookie("refreshToken", clearTokenConfig());

        return {message: "Logged out successfully"};
    }

    @HttpCode(HttpStatus.OK)
    @Get("check")
    @UseGuards(AuthGuard)
    check(@CurrentUser() user: AuthenticatedUser) {
        return !!user;
    }

    @HttpCode(HttpStatus.OK)
    @Get("me")
    @UseGuards(AuthGuard)
    async getMe(
        @CurrentUser() user: AuthenticatedUser,
    ): Promise<UserResponseDto> {
        return UsersMapper.toResponse(await this.authService.isMe(user.id));
    }

    private async setTokenCookies(
        user: Parameters<AuthService["issueTokens"]>[0],
        response: Response,
    ): Promise<void> {
        const {accessToken, refreshToken} =
            await this.authService.issueTokens(user);

        this.setCookies(response, accessToken, refreshToken);
    }

    private setCookies(
        response: Response,
        accessToken: string,
        refreshToken: string,
    ): void {
        response.cookie(
            "refreshToken",
            refreshToken,
            tokenConfig(REFRESH_TOKEN_TTL_IN_MS),
        );
        response.cookie(
            "accessToken",
            accessToken,
            tokenConfig(ACCESS_TOKEN_TTL_IN_MS),
        );
    }

    private isValidState(
        expectedState: string | undefined,
        actualState: string,
    ): boolean {
        if (!expectedState || expectedState.length !== actualState.length) {
            return false;
        }
        return timingSafeEqual(
            Buffer.from(expectedState),
            Buffer.from(actualState),
        );
    }
}
