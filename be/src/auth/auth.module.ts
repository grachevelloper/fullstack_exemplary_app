import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {TypeOrmModule} from "@nestjs/typeorm";

import {UsersModule} from "../users/users.module";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {JWT_SECRET} from "./constants";
import {RefreshToken} from "./refresh-token/refresh-token.entity";
import {RefreshTokensService} from "./refresh-token/refresh-token.service";

@Module({
    providers: [AuthService, RefreshTokensService],
    controllers: [AuthController],
    imports: [
        TypeOrmModule.forFeature([RefreshToken]),
        UsersModule,
        JwtModule.register({
            secret: JWT_SECRET,
            global: true,
            signOptions: {expiresIn: "300s"},
        }),
    ],
    exports: [AuthService, RefreshTokensService],
})
export class AuthModule {}
