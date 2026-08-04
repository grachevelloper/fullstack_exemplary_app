import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {AggregateDeletionModule} from "../../processes/aggregate-deletion/aggregate-deletion.module";
import {AttachmentModule} from "../attachments/attachments.module";
import {LikesModule} from "../likes/likes.module";
import {UsersModule} from "../users/users.module";
import {ArticlesController} from "./articles.controller";
import {Article} from "./articles.entity";
import {ArticlesService} from "./articles.service";
import {TagsModule} from "./tags/tags.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Article]),
        AttachmentModule,
        UsersModule,
        LikesModule,
        TagsModule,
        AggregateDeletionModule,
    ],
    controllers: [ArticlesController],
    providers: [ArticlesService],
    exports: [ArticlesService],
})
export class ArticlesModule {}
