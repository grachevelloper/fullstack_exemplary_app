import {Body, Controller, HttpCode, HttpStatus, Post} from "@nestjs/common";

import {SignInDto} from "@/users/dto/auth";

import {Public} from "../utils/auth";
import {AuthService} from "./auth.service";

@Controller("auth")
@Public()
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post("/login")
    signIn(@Body() signInDto: SignInDto) {
        return this.authService.signIn(signInDto.email, signInDto.password);
    }

    @Post("/refresh")
    async refresh(@Body("refreshToken") refreshToken: string) {
        return this.authService.refreshTokens(refreshToken);
    }
}
