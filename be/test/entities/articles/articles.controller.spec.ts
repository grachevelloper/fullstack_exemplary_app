import {describe, expect, it, jest} from "@jest/globals";
import {HttpStatus, ParseUUIDPipe} from "@nestjs/common";
import {HTTP_CODE_METADATA, ROUTE_ARGS_METADATA} from "@nestjs/common/constants";
import {ArticlesController} from "src/modules/articles/articles.controller";
import {ArticlesService} from "src/modules/articles/articles.service";
import {IS_PUBLIC_KEY} from "src/shared/decorators/auth.decorator";
import {AuthenticatedUser, Role} from "src/types";

describe("ArticlesController", () => {
    const actor = {
        id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        role: Role.USER,
    } as AuthenticatedUser;

    it("passes create body and actor to the service", async () => {
        const service = {
            create: jest.fn<ArticlesService["create"]>().mockResolvedValue(
                {} as never,
            ),
        } as unknown as ArticlesService;
        const controller = new ArticlesController(service);
        const body = {title: "Article", content: "Content"};

        await controller.create(actor, body);

        expect(service.create).toHaveBeenCalledWith({actor, data: body});
    });

    it("passes update body and actor to the service", async () => {
        const service = {
            update: jest.fn<ArticlesService["update"]>().mockResolvedValue(
                {} as never,
            ),
        } as unknown as ArticlesService;
        const controller = new ArticlesController(service);
        const body = {title: "Updated"};

        await controller.update(
            actor,
            "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
            body,
        );

        expect(service.update).toHaveBeenCalledWith({
            actor,
            id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
            data: body,
        });
    });

    it("passes publish actor to the service", async () => {
        const service = {
            publish: jest.fn<ArticlesService["publish"]>().mockResolvedValue(
                {} as never,
            ),
        } as unknown as ArticlesService;
        const controller = new ArticlesController(service);

        await controller.publishArticle(
            actor,
            "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        );

        expect(service.publish).toHaveBeenCalledWith({
            actor,
            id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        });
    });

    it("exposes published list endpoint publicly", async () => {
        const service = {
            findAll: jest.fn<ArticlesService["findAll"]>().mockResolvedValue({
                items: [],
                page: 1,
                limit: 10,
                total: 0,
                hasNext: false,
            }),
        } as unknown as ArticlesService;
        const controller = new ArticlesController(service);

        await controller.findAll({});

        expect(
            Reflect.getMetadata(IS_PUBLIC_KEY, ArticlesController.prototype.findAll),
        ).toBe(true);
        expect(service.findAll).toHaveBeenCalledWith({});
    });

    it("exposes published detail endpoint publicly", async () => {
        const service = {
            findOne: jest.fn<ArticlesService["findOne"]>().mockResolvedValue(
                {} as never,
            ),
        } as unknown as ArticlesService;
        const controller = new ArticlesController(service);

        await controller.findOne(
            undefined,
            "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        );

        expect(
            Reflect.getMetadata(IS_PUBLIC_KEY, ArticlesController.prototype.findOne),
        ).toBe(true);
        expect(service.findOne).toHaveBeenCalledWith({
            id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
            actor: undefined,
        });
    });

    it("declares no-content status for deletion", () => {
        expect(
            Reflect.getMetadata(HTTP_CODE_METADATA, ArticlesController.prototype.delete),
        ).toBe(HttpStatus.NO_CONTENT);
    });

    it("passes deletion actor and article id to the service", async () => {
        const service = {
            delete: jest.fn<ArticlesService["delete"]>().mockResolvedValue(),
        } as unknown as ArticlesService;
        const controller = new ArticlesController(service);
        const id = "82c130b1-1c47-4a0c-8a1c-e79cc39282ad";

        await controller.delete(actor, id);

        expect(service.delete).toHaveBeenCalledWith({actor, id});
    });

    it("uses UUID parsing for article id route parameters", () => {
        const routeArgs = Reflect.getMetadata(
            ROUTE_ARGS_METADATA,
            ArticlesController,
            "update",
        ) as Record<string, {pipes?: unknown[]}>;
        const idParam = Object.values(routeArgs).find((metadata) =>
            metadata.pipes?.some((pipe) => pipe === ParseUUIDPipe),
        );

        expect(idParam).toBeDefined();
    });
});
