import {describe, expect, it, jest} from "@jest/globals";
import {HttpStatus, ParseEnumPipe, ParseUUIDPipe} from "@nestjs/common";
import {
    HTTP_CODE_METADATA,
    ROUTE_ARGS_METADATA,
} from "@nestjs/common/constants";
import {CommentsController} from "src/modules/comments/comments.controller";
import {Comment} from "src/modules/comments/comments.entity";
import {CommentsService} from "src/modules/comments/comments.service";
import {AuthenticatedUser, Role} from "src/types";

describe("CommentsController", () => {
    const actor = {
        id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
        role: Role.USER,
    } as AuthenticatedUser;
    const comment = Object.assign(new Comment(), {
        id: "766c13c0-6fa5-49fd-81f3-74e7a91a1645",
        content: "Comment",
        entityType: "todo" as const,
        entityId: "5ad1f01b-c3a7-401d-b040-8ef4c3d69f2f",
        parentId: null,
        depth: 0,
        likesCount: 0,
        createdAt: "2026-01-03T00:00:00.000Z",
        updatedAt: "2026-01-04T00:00:00.000Z",
        author: {
            id: actor.id,
            username: "writer",
            email: "writer@example.com",
            role: Role.USER,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
        },
    });

    it("passes create body and actor to the service", async () => {
        const service = {
            create: jest
                .fn<CommentsService["create"]>()
                .mockResolvedValue(comment),
        } as unknown as CommentsService;
        const controller = new CommentsController(service);
        const body = {
            content: "Comment",
            entityType: "todo" as const,
            entityId: "5ad1f01b-c3a7-401d-b040-8ef4c3d69f2f",
        };

        await controller.create(actor, body);

        expect(service.create).toHaveBeenCalledWith(actor, body);
    });

    it("passes update id, body and actor to the service", async () => {
        const service = {
            update: jest
                .fn<CommentsService["update"]>()
                .mockResolvedValue(comment),
        } as unknown as CommentsService;
        const controller = new CommentsController(service);
        const body = {content: "Updated"};

        await controller.update(
            actor,
            "766c13c0-6fa5-49fd-81f3-74e7a91a1645",
            body,
        );

        expect(service.update).toHaveBeenCalledWith({
            actor,
            id: "766c13c0-6fa5-49fd-81f3-74e7a91a1645",
            data: body,
        });
    });

    it("returns entity comments in the shared paginated shape", async () => {
        const likedComment = Object.assign(comment, {hasLiked: true});
        const service = {
            findByEntity: jest
                .fn<CommentsService["findByEntity"]>()
                .mockResolvedValue({
                    items: [likedComment],
                    page: 1,
                    limit: 10,
                    total: 1,
                    hasNext: false,
                }),
        } as unknown as CommentsService;
        const controller = new CommentsController(service);

        const result = await controller.getByEntityId(
            "todo",
            comment.entityId,
            actor,
            {page: 1, limit: 10},
        );

        expect(service.findByEntity).toHaveBeenCalledWith({
            actor,
            entityType: "todo",
            entityId: comment.entityId,
            page: 1,
            limit: 10,
            order: undefined,
        });
        expect(result).toEqual({
            items: [expect.objectContaining({id: comment.id, hasLiked: true})],
            page: 1,
            limit: 10,
            total: 1,
            hasNext: false,
        });
    });

    it("passes get-by-id actor to the service and maps liked state", async () => {
        const service = {
            findOneForActor: jest
                .fn<CommentsService["findOneForActor"]>()
                .mockResolvedValue({...comment, hasLiked: true}),
        } as unknown as CommentsService;
        const controller = new CommentsController(service);

        const result = await controller.getByid(actor, comment.id);

        expect(service.findOneForActor).toHaveBeenCalledWith(
            comment.id,
            actor,
        );
        expect(result).toEqual(
            expect.objectContaining({id: comment.id, hasLiked: true}),
        );
    });


    it("declares no-content status for deletion", () => {
        expect(
            Reflect.getMetadata(
                HTTP_CODE_METADATA,
                CommentsController.prototype.delete,
            ),
        ).toBe(HttpStatus.NO_CONTENT);
    });

    it("uses UUID parsing for comment id route parameters", () => {
        const routeArgs = Reflect.getMetadata(
            ROUTE_ARGS_METADATA,
            CommentsController,
            "update",
        ) as Record<string, {pipes?: unknown[]}>;
        const idParam = Object.values(routeArgs).find((metadata) =>
            metadata.pipes?.some((pipe) => pipe === ParseUUIDPipe),
        );

        expect(idParam).toBeDefined();
    });

    it("uses enum parsing for entity comment target types", () => {
        const routeArgs = Reflect.getMetadata(
            ROUTE_ARGS_METADATA,
            CommentsController,
            "getByEntityId",
        ) as Record<string, {pipes?: unknown[]}>;
        const entityTypeParam = Object.values(routeArgs).find((metadata) =>
            metadata.pipes?.some((pipe) => pipe instanceof ParseEnumPipe),
        );

        expect(entityTypeParam).toBeDefined();
    });
});
