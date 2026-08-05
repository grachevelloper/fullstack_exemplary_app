import {Injectable, Logger} from "@nestjs/common";
import {Cron} from "@nestjs/schedule";
import {InjectRepository} from "@nestjs/typeorm";
import {LessThan, Repository} from "typeorm";

import {AggregateDeletionService} from "../../processes/aggregate-deletion/aggregate-deletion.service";
import {TodoState} from "../../types/todo";
import {Todo} from "./todos.entity";

const MOSCOW_TIME_ZONE = "Europe/Moscow";

const getMoscowDateParts = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: MOSCOW_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const valueByType = new Map(
        parts.map((part) => [part.type, Number(part.value)]),
    );

    return {
        year: valueByType.get("year")!,
        month: valueByType.get("month")!,
        day: valueByType.get("day")!,
    };
};

export const getCompletedTodoCleanupCutoff = (now: Date): Date => {
    const {year, month, day} = getMoscowDateParts(now);
    const currentMoscowMidnight = new Date(
        Date.UTC(year, month - 1, day, -3),
    );

    return new Date(currentMoscowMidnight.getTime() - 24 * 60 * 60 * 1000);
};

@Injectable()
export class TodosCleanupService {
    private readonly logger = new Logger(TodosCleanupService.name);

    constructor(
        @InjectRepository(Todo)
        private readonly todosRepository: Repository<Todo>,
        private readonly aggregateDeletionService: AggregateDeletionService,
    ) {}

    @Cron("0 10 0 * * *", {timeZone: MOSCOW_TIME_ZONE})
    async removeExpiredCompletedTodos(): Promise<void> {
        const cutoff = getCompletedTodoCleanupCutoff(new Date());
        const todos = await this.todosRepository.find({
            select: {id: true},
            where: {
                state: TodoState.FINISHED,
                createdAt: LessThan(cutoff.toISOString()),
            },
        });

        for (const todo of todos) {
            try {
                await this.aggregateDeletionService.deleteTodoAggregate(todo.id);
            } catch (error) {
                this.logger.error("Failed to remove expired completed todo", {
                    todoId: todo.id,
                    error,
                });
            }
        }
    }
}
