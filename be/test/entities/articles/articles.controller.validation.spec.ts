import {afterEach, beforeEach, describe, expect, it, jest} from "@jest/globals";
import {INestApplication} from "@nestjs/common";
import {Test} from "@nestjs/testing";
import {NextFunction, Request, Response} from "express";
import {configureApplication} from "src/app/application-setup";
import {ArticlesController} from "src/modules/articles/articles.controller";
import {ArticlesService} from "src/modules/articles/articles.service";
import {AuthenticatedUser, Role} from "src/types";
import request from "supertest";

describe("ArticlesController validation", () => {
    let app: INestApplication;

    const actor = {
        id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        role: Role.USER,
    } as AuthenticatedUser;
    const articlesService = {
        create: jest.fn(),
        update: jest.fn(),
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ArticlesController],
            providers: [{provide: ArticlesService, useValue: articlesService}],
        }).compile();

        app = moduleRef.createNestApplication();
        app.use((req: Request, _res: Response, next: NextFunction) => {
            req.user = actor;
            next();
        });
        configureApplication(app);
        await app.init();
        jest.clearAllMocks();
    });

    afterEach(async () => {
        await app.close();
    });

    it("accepts an empty create body for a new draft article", async () => {
        articlesService.create.mockResolvedValue({id: "article-1"} as never);

        await request(app.getHttpServer())
            .post("/api/articles")
            .send({})
            .expect(201);

        expect(articlesService.create).toHaveBeenCalledWith({
            actor,
            data: {},
        });
    });

    it("rejects an article description longer than 300 characters", async () => {
        await request(app.getHttpServer())
            .patch("/api/articles/f43e19d0-8c1a-41d4-81b2-983d19648916")
            .send({description: "a".repeat(301)})
            .expect(400);

        expect(articlesService.update).not.toHaveBeenCalled();
    });
});
