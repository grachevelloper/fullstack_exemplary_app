import {Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";

import {UsersService} from "../users/users.service";
import {REFRESH_SECRET} from "./constants";
import {RefreshTokensService} from "./refresh-token/refresh-token.service";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private refreshTokensService: RefreshTokensService,
    ) {}

    async signIn(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user?.password !== pass) {
            throw new UnauthorizedException();
        }
        const payload = {sub: user.id, email: user.email};

        const refresh_token = this.refreshTokensService.createToken(user.id);

        return {
            access_token: await this.jwtService.signAsync(payload),
            refresh_token,
        };
    }

    async refreshTokens(refreshToken: string) {
        const payload: {sub: string; tokenId: string} = this.jwtService.verify(
            refreshToken,
            {
                secret: REFRESH_SECRET,
            },
        );

        const isValid = await this.refreshTokensService.validateToken(
            payload.tokenId,
            payload.sub,
        );

        if (!isValid) {
            throw new UnauthorizedException();
        }

        await this.refreshTokensService.revokeToken(
            payload.tokenId,
            payload.sub,
        );

        const newPayload = {sub: payload.sub};
        const [access_token, refresh_token] = await Promise.all([
            this.jwtService.signAsync(newPayload),
            this.refreshTokensService.createToken(payload.sub),
        ]);

        return {access_token, refresh_token};
    }
}
