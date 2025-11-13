import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {JwtService} from "@nestjs/jwt";
import {Request} from "express";

import {JWT_SECRET} from "@/auth/constants";

import {IS_PUBLIC_KEY} from "../utils/auth";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true;
        }

        const req: Request = context.switchToHttp().getRequest();

        const token = req.cookies.accessToken;
        console.log("Refresh token received:", req.cookies);
        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: JWT_SECRET,
            });
            req["user"] = payload;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}
