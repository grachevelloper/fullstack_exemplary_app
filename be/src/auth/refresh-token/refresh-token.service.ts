import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import bcrypt from "bcrypt";
import {randomUUID} from "crypto";
import {MoreThan, Repository} from "typeorm";

import {REFRESH_TOKEN_TTL_IN_MS} from "../constants";
import {hashToken} from "../utils";
import {RefreshToken} from "./refresh-token.entity";

@Injectable()
export class RefreshTokensService {
    constructor(
        @InjectRepository(RefreshToken)
        private refreshTokenRepo: Repository<RefreshToken>,
    ) {}

    async createToken(userId: string): Promise<string> {
        const token = randomUUID();
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_IN_MS);

        await this.refreshTokenRepo.save({
            userId,
            tokenHash,
            expiresAt,
        });

        return token;
    }

    async validateToken(userId: string, token: string): Promise<boolean> {
        const tokenHash = hashToken(token);
        const tokenEntity = await this.refreshTokenRepo.findOne({
            where: {
                userId,
                tokenHash,
                revoked: false,
                expiresAt: MoreThan(new Date()),
            },
        });

        return !!tokenEntity;
    }

    async revokeToken(userId: string, token: string): Promise<void> {
        const tokenHash = await bcrypt.hash(token, 10);

        await this.refreshTokenRepo.update(
            {userId, tokenHash},
            {revoked: true},
        );
    }

    async findByHash(tokenHash: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepo.findOne({
            where: {
                tokenHash,
                revoked: false,
                expiresAt: MoreThan(new Date()),
            },
        });
    }
}
