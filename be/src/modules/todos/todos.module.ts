import {forwardRef, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {AggregateDeletionModule} from "../../processes/aggregate-deletion/aggregate-deletion.module";
import {CommentsModule} from "../comments/comments.module";
import {LikesModule} from "../likes/likes.module";
import {ChecklistsModule} from "./checklists/checklist.module";
import {TodosController} from "./todos.controller";
import {Todo} from "./todos.entity";
import {TodosService} from "./todos.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Todo]),
        AggregateDeletionModule,
        ChecklistsModule,
        LikesModule,
        forwardRef(() => CommentsModule),
    ],
    controllers: [TodosController],
    providers: [TodosService],
    exports: [TodosService],
})
export class TodosModule {}
