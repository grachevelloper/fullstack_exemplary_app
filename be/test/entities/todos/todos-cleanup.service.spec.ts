import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {Test} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {Todo} from "src/modules/todos/todos.entity";
import {
    getCompletedTodoCleanupCutoff,
    TodosCleanupService,
} from "src/modules/todos/todos-cleanup.service";
import {AggregateDeletionService} from "src/processes/aggregate-deletion/aggregate-deletion.service";
import {TodoState} from "src/types/todo";
import {Repository} from "typeorm";

describe("TodosCleanupService", () => {
    let service: TodosCleanupService;
    let repository: jest.Mocked<Repository<Todo>>;
    let aggregateDeletionService: jest.Mocked<AggregateDeletionService>;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                TodosCleanupService,
                {
                    provide: getRepositoryToken(Todo),
                    useValue: {find: jest.fn()},
                },
                {
                    provide: AggregateDeletionService,
                    useValue: {deleteTodoAggregate: jest.fn()},
                },
            ],
        }).compile();

        service = moduleRef.get(TodosCleanupService);
        repository = moduleRef.get(getRepositoryToken(Todo));
        aggregateDeletionService = moduleRef.get(AggregateDeletionService);
    });

    it("uses the start of the previous Moscow day as the cleanup cutoff", () => {
        expect(
            getCompletedTodoCleanupCutoff(
                new Date("2026-08-07T12:00:00.000Z"),
            ).toISOString(),
        ).toBe("2026-08-05T21:00:00.000Z");
    });

    it("deletes every completed todo created before the cutoff", async () => {
        repository.find.mockResolvedValue([
            {id: "expired-first"},
            {id: "expired-second"},
        ] as Todo[]);
        aggregateDeletionService.deleteTodoAggregate.mockResolvedValue();

        await service.removeExpiredCompletedTodos();

        expect(repository.find).toHaveBeenCalledWith(
            expect.objectContaining({
                select: {id: true},
                where: expect.objectContaining({state: TodoState.FINISHED}),
            }),
        );
        expect(aggregateDeletionService.deleteTodoAggregate).toHaveBeenNthCalledWith(
            1,
            "expired-first",
        );
        expect(aggregateDeletionService.deleteTodoAggregate).toHaveBeenNthCalledWith(
            2,
            "expired-second",
        );
    });
});
