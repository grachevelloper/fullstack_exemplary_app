import "@/config/s3";

import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {APP_GUARD} from "@nestjs/core";
import {TypeOrmModule} from "@nestjs/typeorm";
import * as dotenv from "dotenv";
import {AuthGuard} from "src/shared/guards/auth.guard";

import {ArticlesModule} from "@/articles/articles.module";
import {TagsModule} from "@/articles/tags/tags.module";
import {AttachmentModule} from "@/attachments/attachments.module";
import {AuthModule} from "@/auth/auth.module";
import {CommentsModule} from "@/comments/comments.module";
import s3Config from "@/config/s3";
import {LikesModule} from "@/likes/likes.module";
import {TodosModule} from "@/todos/todos.module";
import {UsersModule} from "@/users/users.module";

import dataSourceOptions from "./data-source";
import {HealthModule} from "./health/health.module";

dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ["../.env"],
            load: [s3Config],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: () => ({
                ...dataSourceOptions,
                autoLoadEntities: true,
                migrationsTableName: "migrations",
            }),
            inject: [ConfigService],
        }),
        TodosModule,
        AuthModule,
        UsersModule,
        LikesModule,
        CommentsModule,
        ArticlesModule,
        TagsModule,
        AttachmentModule,
        HealthModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
