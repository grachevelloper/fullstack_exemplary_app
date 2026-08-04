import {describe, expect, it} from "@jest/globals";
import {Article} from "src/modules/articles/articles.entity";
import {ArticlesMapper} from "src/modules/articles/articles.mapper";
import {Tag} from "src/modules/articles/tags/tags.entity";
import {User} from "src/modules/users/users.entity";
import {Role} from "src/types";

describe("ArticlesMapper", () => {
    it("maps an article response without exposing internal author fields", () => {
        const author = Object.assign(new User(), {
            id: "82c130b1-1c47-4a0c-8a1c-e79cc39282ad",
            username: "writer",
            email: "writer@example.com",
            password: "secret-hash",
            role: Role.WRITER,
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-02T00:00:00.000Z",
        });
        const tags = [
            Object.assign(new Tag(), {
                id: "dc86f84f-f3e6-4d9c-96ca-83f2a8c48fd7",
                name: "nestjs",
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-02T00:00:00.000Z",
            }),
        ];
        const article = Object.assign(new Article(), {
            id: "f43e19d0-8c1a-41d4-81b2-983d19648916",
            title: "Draft",
            description: "A concise article description",
            image: "https://cdn.example.com/image.png",
            content: "Content",
            readTime: 3,
            likesCount: 2,
            isDraft: true,
            author,
            tags,
            createdAt: "2026-01-03T00:00:00.000Z",
            updatedAt: "2026-01-04T00:00:00.000Z",
        });

        const result = ArticlesMapper.toResponse(article, true);

        expect(result).toEqual({
            id: article.id,
            title: "Draft",
            description: "A concise article description",
            image: "https://cdn.example.com/image.png",
            content: "Content",
            readTime: 3,
            likesCount: 2,
            isDraft: true,
            hasLiked: true,
            tags: [{id: tags[0].id, name: "nestjs"}],
            author: expect.objectContaining({
                id: author.id,
                username: "writer",
                email: "writer@example.com",
            }),
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
        });
        expect(result.author).not.toHaveProperty("password");
    });
});
