import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {ArticlesModule} from "../articles/articles.module";
import {Like} from "../likes/likes.entity";
import {LikesModule} from "../likes/likes.module";
import {TodosModule} from "../todos/todos.module";
import {UsersModule} from "../users/users.module";
import {CommentsController} from "./comments.controller";
import {Comment} from "./comments.entity";
import {CommentsService} from "./comments.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment, Like]),
        UsersModule,
        forwardRef(() => TodosModule),
        ArticlesModule,
        LikesModule,
    ],
    controllers: [CommentsController],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule {}
