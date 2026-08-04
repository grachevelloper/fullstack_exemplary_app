import {BaseEntity} from "src/shared/utils/entity";
import {Column, Entity, OneToOne} from "typeorm";

import {TodoPriority, TodoState} from "@/types/todo";

import {CheckList} from "./checklists/checklists.entity";

@Entity("todos")
export class Todo extends BaseEntity {
    @Column()
    title: string;

    @Column()
    content: string;

    @Column({type: "uuid"})
    authorId: string;

    @Column({
        type: "enum",
        enumName: "todo_priority",
        enum: TodoPriority,
        default: TodoPriority.MEDIUM,
    })
    priority?: TodoPriority;

    @Column({
        type: "enum",
        enumName: "todo_state",
        enum: TodoState,
        default: TodoState.PLANNING,
    })
    state?: TodoState;

    @OneToOne(() => CheckList, (item) => item.todo, {
        cascade: true,
        nullable: true,
    })
    checklist?: CheckList;

    @Column({default: 0})
    likesCount?: number;
}
