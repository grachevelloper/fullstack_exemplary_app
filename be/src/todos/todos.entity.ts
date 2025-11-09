import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

import {TodoPriority, TodoState} from "../types/todo";

@Entity("todos")
export class Todo {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column()
    authorId: string;

    @Column({default: TodoPriority.MEDIUM})
    priority: TodoPriority;

    @Column({default: TodoState.PLANNING})
    state: TodoState;

    @UpdateDateColumn()
    updatedAt: string;

    @CreateDateColumn()
    createdAt: string;
}
