import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from "@nestjs/common";
import {Test, TestingModule} from "@nestjs/testing";
import {getRepositoryToken} from "@nestjs/typeorm";
import {Article} from "src/modules/articles/articles.entity";
import {ArticlesService} from "src/modules/articles/articles.service";
import {Tag} from "src/modules/articles/tags/tags.entity";
import {TagsService} from "src/modules/articles/tags/tags.service";
import {LikesService} from "src/modules/likes/likes.service";
import {UsersService} from "src/modules/users/users.service";
import {AggregateDeletionService} from "src/processes/aggregate-deletion/aggregate-deletion.service";
import {AuthenticatedUser, Order, Role, SortBy} from "src/types";
import {Repository} from "typeorm";

describe("ArticlesService", () => {
    let service: ArticlesService;
    let repository: jest.Mocked<Repository<Article>>;
    let tagsService: jest.Mocked<TagsService>;
    let usersService: jest.Mocked<UsersService>;
    let aggregateDeletionService: jest.Mocked<AggregateDeletionService>;
    let queryBuilder: ReturnType<typeof createArticleQueryBuilderMock>;

    const owner = {
        id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        role: Role.USER,
    } as AuthenticatedUser;
    const writer = {
        id: owner.id,
        role: Role.WRITER,
    } as AuthenticatedUser;
    const stranger = {
        id: "ddb9a455-441a-4e87-844a-e25629b9fe32",
        role: Role.USER,
    } as AuthenticatedUser;
    const admin = {
        id: "b1ace43e-cfb0-4b51-8657-02f092409ef7",
        role: Role.ADMIN,
    } as AuthenticatedUser;
    const author = {
        id: owner.id,
        username: "writer",
        email: "writer@example.com",
        role: Role.USER,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
    };
    const article = Object.assign(new Article(), {
        id: "f43e19d0-8c1a-41d4-81b2-983d19648916",
        title: "Article",
        image: "https://cdn.example.com/image.png",
        content: "Content",
        readTime: 4,
        likesCount: 0,
        isDraft: true,
        author,
        tags: [],
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-04T00:00:00.000Z",
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArticlesService,
                {
                    provide: getRepositoryToken(Article),
                    useValue: {
                        create: jest.fn(),
                        createQueryBuilder: jest.fn(),
                        delete: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        manager: {
                            transaction: jest.fn(),
                        },
                        save: jest.fn(),
                    },
                },
                {
                    provide: TagsService,
                    useValue: {
                        findOrCreateByNames: jest.fn(),
                    },
                },
                {
                    provide: LikesService,
                    useValue: {
                        hasLiked: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: AggregateDeletionService,
                    useValue: {
                        deleteArticleAggregate: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get(ArticlesService);
        repository = module.get(getRepositoryToken(Article));
        tagsService = module.get(TagsService);
        usersService = module.get(UsersService);
        aggregateDeletionService = module.get(AggregateDeletionService);
        queryBuilder = createArticleQueryBuilderMock();
        queryBuilder.getManyAndCount.mockResolvedValue([[article], 1] as never);
        repository.createQueryBuilder.mockReturnValue(queryBuilder as never);
    });

    it("creates a draft article for writers and normalizes tags", async () => {
        const tags = [Object.assign(new Tag(), {id: "tag-1", name: "nestjs"})];
        usersService.findById.mockResolvedValue(author as never);
        tagsService.findOrCreateByNames.mockResolvedValue(tags);
        repository.create.mockReturnValue({...article, tags});
        repository.save.mockResolvedValue({...article, tags});

        const result = await service.create({
            actor: writer,
            data: {
                title: "Article",
                content: "Content",
                tags: [{name: " NestJS "}],
            },
        });

        expect(tagsService.findOrCreateByNames).toHaveBeenCalledWith([
            "nestjs",
        ]);
        expect(repository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                author,
                isDraft: true,
                tags,
                title: "Article",
            }),
        );
        expect(result.isDraft).toBe(true);
        expect(result.tags).toEqual([{id: "tag-1", name: "nestjs"}]);
    });

    it("forbids regular users from creating article drafts", async () => {
        await expect(
            service.create({
                actor: owner,
                data: {
                    title: "Article",
                    content: "Content",
                },
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);

        expect(usersService.findById).not.toHaveBeenCalled();
        expect(repository.create).not.toHaveBeenCalled();
    });

    it("forbids a regular user from updating another user's article", async () => {
        repository.findOne.mockResolvedValue(article);

        await expect(
            service.update({
                id: article.id,
                actor: stranger,
                data: {title: "Updated"},
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(repository.save).not.toHaveBeenCalled();
    });

    it("allows an administrator to update another user's article", async () => {
        repository.findOne.mockResolvedValue(article);
        repository.save.mockResolvedValue({...article, title: "Updated"});

        await service.update({
            id: article.id,
            actor: admin,
            data: {title: "Updated"},
        });

        expect(repository.save).toHaveBeenCalledWith(
            expect.objectContaining({title: "Updated"}),
        );
    });

    it("publishes an existing draft article", async () => {
        repository.findOne.mockResolvedValue({...article, isDraft: true});
        repository.save.mockResolvedValue({...article, isDraft: false});

        const result = await service.publish({id: article.id, actor: owner});

        expect(repository.save).toHaveBeenCalledWith(
            expect.objectContaining({isDraft: false}),
        );
        expect(result.isDraft).toBe(false);
    });

    it("rejects publishing an already published article", async () => {
        repository.findOne.mockResolvedValue({...article, isDraft: false});

        await expect(
            service.publish({id: article.id, actor: owner}),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it("returns only published articles with shared pagination shape", async () => {
        await service.findAll({
            page: 2,
            limit: 10,
            sortBy: SortBy.CREATED_AT,
            order: Order.DESC,
        });

        expect(queryBuilder.andWhere).toHaveBeenCalledWith(
            "article.isDraft = :isDraft",
            {isDraft: false},
        );
        expect(queryBuilder.skip).toHaveBeenCalledWith(10);
        expect(queryBuilder.take).toHaveBeenCalledWith(10);
    });

    it("allows anonymous users to read published article details without liked state", async () => {
        repository.findOne.mockResolvedValue({...article, isDraft: false});

        const result = await service.findOne({id: article.id});

        expect(result.hasLiked).toBe(false);
        expect(repository.findOne).toHaveBeenCalledWith({
            where: {id: article.id},
            relations: ["author", "tags"],
        });
    });

    it("forbids anonymous users from reading draft article details", async () => {
        repository.findOne.mockResolvedValue({...article, isDraft: true});

        await expect(service.findOne({id: article.id})).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it("forbids reading another user's drafts", async () => {
        await expect(
            service.findAllByAuthorId({
                authorId: owner.id,
                actor: stranger,
                drafts: true,
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(repository.find).not.toHaveBeenCalled();
    });

    it("allows an administrator to read another user's drafts", async () => {
        repository.find.mockResolvedValue([article]);

        await service.findAllByAuthorId({
            authorId: owner.id,
            actor: admin,
            drafts: true,
        });

        expect(repository.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {author: {id: owner.id}, isDraft: true},
            }),
        );
    });

    it("fails delete before touching the repository when article is missing", async () => {
        repository.findOne.mockResolvedValue(null);

        await expect(
            service.delete({id: article.id, actor: owner}),
        ).rejects.toBeInstanceOf(NotFoundException);
        expect(repository.delete).not.toHaveBeenCalled();
    });

    it("delegates physical article aggregate deletion after mutation access check", async () => {
        repository.findOne.mockResolvedValue(article);
        aggregateDeletionService.deleteArticleAggregate.mockResolvedValue();

        await service.delete({id: article.id, actor: owner});

        expect(aggregateDeletionService.deleteArticleAggregate).toHaveBeenCalledWith(
            article.id,
        );
    });
});

function createArticleQueryBuilderMock() {
    const queryBuilder = {
        andWhere: jest.fn(),
        from: jest.fn(),
        getManyAndCount: jest.fn(),
        getQuery: jest.fn(),
        innerJoin: jest.fn(),
        leftJoinAndSelect: jest.fn(),
        orderBy: jest.fn(),
        select: jest.fn(),
        setParameter: jest.fn(),
        skip: jest.fn(),
        subQuery: jest.fn(),
        take: jest.fn(),
        where: jest.fn(),
    };

    Object.values(queryBuilder).forEach((value) => {
        value.mockReturnValue(queryBuilder);
    });
    queryBuilder.getQuery.mockReturnValue("tag-subquery");

    return queryBuilder;
}
