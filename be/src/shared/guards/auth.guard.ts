import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";
import {Request} from "express";
import {JWT_SECRET} from "src/processes/auth/constants";

import {UsersService} from "@/users/users.service";

import {IS_PUBLIC_KEY} from "../decorators/auth.decorator";

interface JwtPayload {
    sub: string;
    iat: number;
    exp: number;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
        private usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        const req: Request = context.switchToHttp().getRequest();
        const token = req.cookies.accessToken;

        if (!token) {
            if (isPublic) {
                return true;
            }

            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(
                token,
                {
                    secret: JWT_SECRET,
                },
            );

            const user = await this.usersService.findById(payload.sub);

            req["user"] = {
                id: payload.sub,
                iat: payload.iat,
                role: user.role,
                exp: payload.exp,
            };
        } catch {
            if (isPublic) {
                return true;
            }

            throw new UnauthorizedException();
        }

        return true;
    }
}
