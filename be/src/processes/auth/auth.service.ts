import {Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import bcrypt from "bcrypt";

import {User} from "../../modules/users/users.entity";
import {UsersService} from "../../modules/users/users.service";
import {Role} from "../../types";
import {RefreshTokensService} from "./refresh-token/refresh-token.service";
import {hashToken} from "./utils";

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshResult extends TokenPair {
    user: User;
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private refreshTokensService: RefreshTokensService,
        private jwtService: JwtService,
    ) {}

    async signUp(
        username: string,
        email: string,
        password: string,
    ): Promise<User> {
        const user = await this.usersService.create({
            email,
            password,
            username,
            role: Role.USER,
        });

        return user;
    }

    async signIn(email: string, pass: string): Promise<User> {
        const user = await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException("User not found");
        }
        if (!user.password || !(await bcrypt.compare(pass, user.password))) {
            throw new UnauthorizedException("Incorrect password");
        }
        return user;
    }

    async isMe(id: string): Promise<User> {
        const user = await this.usersService.findById(id);

        return user;
    }

    async issueTokens(user: User): Promise<TokenPair> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({sub: user.id, role: user.role}),
            this.refreshTokensService.createToken(user.id),
        ]);

        return {accessToken, refreshToken};
    }

    async refresh(refreshToken: string | undefined): Promise<RefreshResult> {
        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token not found");
        }

        const tokenHash = hashToken(refreshToken);
        const tokenEntity =
            await this.refreshTokensService.findByHash(tokenHash);

        if (!tokenEntity) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const user = await this.isMe(tokenEntity.userId);

        await this.refreshTokensService.revokeToken(user.id, refreshToken);
        const tokens = await this.issueTokens(user);

        return {
            user,
            ...tokens,
        };
    }

    async logout(userId: string, refreshToken: string | undefined): Promise<void> {
        if (refreshToken) {
            await this.refreshTokensService.revokeToken(userId, refreshToken);
        }
    }
}
