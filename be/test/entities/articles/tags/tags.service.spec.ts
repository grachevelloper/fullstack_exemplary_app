import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {ConflictException} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {Tag} from "src/modules/articles/tags/tags.entity";
import {TagsService} from "src/modules/articles/tags/tags.service";
import {Repository} from "typeorm";

describe("TagsService", () => {
    let service: TagsService;
    let repository: jest.Mocked<Repository<Tag>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TagsService,
                {
                    provide: getRepositoryToken(Tag),
                    useValue: {
                        create: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        manager: {
                            transaction: jest.fn(),
                        },
                        remove: jest.fn(),
                        save: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get(TagsService);
        repository = module.get(getRepositoryToken(Tag));
    });

    it("normalizes tag names before creating a tag", async () => {
        const tag = Object.assign(new Tag(), {
            id: "dc86f84f-f3e6-4d9c-96ca-83f2a8c48fd7",
            name: "nestjs",
        });
        repository.findOne.mockResolvedValue(null);
        repository.create.mockReturnValue(tag);
        repository.save.mockResolvedValue(tag);

        await service.create({name: " NestJS "});

        expect(repository.findOne).toHaveBeenCalledWith({
            where: {name: "nestjs"},
        });
        expect(repository.create).toHaveBeenCalledWith({name: "nestjs"});
    });

    it("rejects duplicate tag names", async () => {
        repository.findOne.mockResolvedValue(
            Object.assign(new Tag(), {
                id: "dc86f84f-f3e6-4d9c-96ca-83f2a8c48fd7",
                name: "nestjs",
            }),
        );

        await expect(service.create({name: " NestJS "})).rejects.toBeInstanceOf(
            ConflictException,
        );
        expect(repository.save).not.toHaveBeenCalled();
    });

    it("finds existing tags and creates only missing names", async () => {
        const existing = Object.assign(new Tag(), {
            id: "dc86f84f-f3e6-4d9c-96ca-83f2a8c48fd7",
            name: "nestjs",
        });
        const created = Object.assign(new Tag(), {
            id: "5c72f3d6-4e62-43bf-9765-4da630a57736",
            name: "typeorm",
        });
        repository.find.mockResolvedValue([existing]);
        repository.create.mockReturnValue(created);
        repository.save.mockResolvedValue([created] as never);

        const result = await service.findOrCreateByNames([
            " NestJS ",
            "typeorm",
            "nestjs",
        ]);

        expect(repository.create).toHaveBeenCalledTimes(1);
        expect(repository.create).toHaveBeenCalledWith({name: "typeorm"});
        expect(result).toEqual([existing, created]);
    });

    it("removes article-tag links before deleting a tag", async () => {
        const tag = Object.assign(new Tag(), {
            id: "dc86f84f-f3e6-4d9c-96ca-83f2a8c48fd7",
            name: "nestjs",
        });
        const execute = jest.fn(async () => ({}));
        const remove = jest.fn(async (..._args: unknown[]) => tag);
        const manager = {
            createQueryBuilder: jest.fn(() => ({
                delete: jest.fn().mockReturnThis(),
                execute,
                from: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
            })),
            remove,
        };
        repository.findOne.mockResolvedValue(tag);
        (repository.manager.transaction as jest.Mock).mockImplementation(
            async (...args: unknown[]) => {
                const callback = args.find(
                    (arg) => typeof arg === "function",
                ) as (transactionManager: unknown) => Promise<unknown>;

                return callback(manager);
            },
        );

        await service.delete(tag.id);

        expect(manager.createQueryBuilder).toHaveBeenCalled();
        expect(execute).toHaveBeenCalled();
        expect(manager.remove).toHaveBeenCalledWith(Tag, tag);
    });
});
