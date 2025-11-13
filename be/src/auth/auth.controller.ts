import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UnauthorizedException,
} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {Request, Response} from "express";

import {SignInDto, SignUpDto} from "@/users/dto/auth";

import {Public} from "../utils/auth";
import {AuthService} from "./auth.service";
import {ACCESS_TOKEN_TTL_IN_MS, REFRESH_TOKEN_TTL_IN_MS} from "./constants";
import {RefreshTokensService} from "./refresh-token/refresh-token.service";
import {hashToken, tokenConfig} from "./utils";

@Controller("auth")
@Public()
export class AuthController {
    constructor(
        private authService: AuthService,
        private refreshTokensService: RefreshTokensService,
        private jwtService: JwtService,
    ) {}

    @HttpCode(HttpStatus.CREATED)
    @Post("/signup")
    async signUp(
        @Body() signUpDto: SignUpDto,
        @Res({passthrough: true}) response: Response,
    ) {
        const result = await this.authService.signUp(
            signUpDto.username,
            signUpDto.email,
            signUpDto.password,
        );

        const payload = {sub: result.id, email: result.email};
        const refreshToken = await this.refreshTokensService.createToken(
            result.id,
        );
        const accessToken = await this.jwtService.signAsync(payload);

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

        return result;
    }

    @HttpCode(HttpStatus.OK)
    @Post("/signin")
    async signIn(
        @Body() signInDto: SignInDto,
        @Res({passthrough: true}) response: Response,
    ) {
        const result = await this.authService.signIn(
            signInDto.email,
            signInDto.password,
        );

        const payload = {sub: result.id, email: result.email};
        const refreshToken = await this.refreshTokensService.createToken(
            result.id,
        );
        const accessToken = await this.jwtService.signAsync(payload);

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

        return result;
    }

    @HttpCode(HttpStatus.OK)
    @Post("/refresh")
    async refresh(
        @Req() request: Request,
        @Res({passthrough: true}) response: Response,
    ) {
        const refreshToken = request.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token not found");
        }

        const tokenHash = hashToken(refreshToken);
        const tokenEntity =
            await this.refreshTokensService.findByHash(tokenHash);

        if (!tokenEntity) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const userId = tokenEntity.userId;

        await this.refreshTokensService.revokeToken(userId, refreshToken);

        const [accessToken, newRefreshToken] = await Promise.all([
            this.jwtService.signAsync({sub: userId}),
            this.refreshTokensService.createToken(userId),
        ]);

        response.cookie(
            "accessToken",
            accessToken,
            tokenConfig(ACCESS_TOKEN_TTL_IN_MS),
        );

        response.cookie(
            "refreshToken",
            newRefreshToken,
            tokenConfig(REFRESH_TOKEN_TTL_IN_MS),
        );

        return {message: "Tokens refreshed successfully"};
    }

    @HttpCode(HttpStatus.OK)
    @Post("/logout")
    logout(
        @Req() request: Request,
        @Res({passthrough: true}) response: Response,
    ) {
        const refreshToken = request.cookies?.refreshToken;

        if (refreshToken) {
            // await this.refreshTokensService.revokeToken(refreshToken);
        }

        response.clearCookie("accessToken", {
            path: "/",
        });
        response.clearCookie("refreshToken", {
            path: "/",
        });

        return {message: "Logged out successfully"};
    }
}
