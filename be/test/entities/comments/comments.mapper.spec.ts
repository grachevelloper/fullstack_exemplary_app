import {describe, expect, it} from "@jest/globals";
import {Comment} from "src/modules/comments/comments.entity";
import {CommentsMapper} from "src/modules/comments/comments.mapper";
import {Role} from "src/types";

describe("CommentsMapper", () => {
    it("maps a comment to a safe response DTO", () => {
        const comment = Object.assign(new Comment(), {
            id: "766c13c0-6fa5-49fd-81f3-74e7a91a1645",
            content: "Comment",
            entityType: "todo" as const,
            entityId: "5ad1f01b-c3a7-401d-b040-8ef4c3d69f2f",
            parentId: null,
            depth: 0,
            likesCount: 2,
            createdAt: "2026-01-03T00:00:00.000Z",
            updatedAt: "2026-01-04T00:00:00.000Z",
            author: {
                id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
                username: "writer",
                email: "writer@example.com",
                password: "secret",
                role: Role.USER,
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-02T00:00:00.000Z",
            },
        });

        const response = CommentsMapper.toResponse(comment);

        expect(response).toEqual({
            id: comment.id,
            content: "Comment",
            entityType: "todo",
            entityId: comment.entityId,
            parentId: null,
            depth: 0,
            likesCount: 2,
            hasLiked: false,
            author: expect.objectContaining({
                id: comment.author.id,
                email: "writer@example.com",
            }),
            createdAt: "2026-01-03T00:00:00.000Z",
            updatedAt: "2026-01-04T00:00:00.000Z",
        });
        expect(response.author).not.toHaveProperty("password");
    });

    it("maps the current user's liked state", () => {
        const comment = Object.assign(new Comment(), {
            id: "766c13c0-6fa5-49fd-81f3-74e7a91a1645",
            content: "Comment",
            entityType: "todo" as const,
            entityId: "5ad1f01b-c3a7-401d-b040-8ef4c3d69f2f",
            parentId: null,
            depth: 0,
            likesCount: 2,
            createdAt: "2026-01-03T00:00:00.000Z",
            updatedAt: "2026-01-04T00:00:00.000Z",
            author: {
                id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
                username: "writer",
                email: "writer@example.com",
                role: Role.USER,
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-02T00:00:00.000Z",
            },
        });

        expect(CommentsMapper.toResponse(comment, true)).toEqual(
            expect.objectContaining({hasLiked: true}),
        );
    });
});
