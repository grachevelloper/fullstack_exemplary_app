import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {APP_GUARD} from "@nestjs/core";
import {TypeOrmModule} from "@nestjs/typeorm";
import * as dotenv from "dotenv";

import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {AuthModule} from "./auth/auth.module";
import {AuthGuard} from "./guards/auth.guard";
import {Todo} from "./todos/todos.entity";
import {TodosModule} from "./todos/todos.module";
import {UsersModule} from "./users/users.module";

dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ["../.env"],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("DB_HOST"),
                port: configService.get("DB_PORT"),
                username: configService.get("DB_USER"),
                password: configService.get("DB_PASSWORD"),
                database: configService.get("DB_NAME"),
                entities: [Todo],
                synchronize: false,
                autoLoadEntities: true,
                migrations: ["dist/migrations/**/*.js"],
                migrationsRun: process.env.NODE_ENV !== "production",
                migrationsTableName: "migrations",
            }),
            inject: [ConfigService],
        }),
        TodosModule,
        AuthModule,
        UsersModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
