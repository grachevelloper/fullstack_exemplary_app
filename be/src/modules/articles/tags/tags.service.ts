import {ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {In, Repository} from "typeorm";

import {CreateTagDto} from "./tags.dto";
import {Tag} from "./tags.entity";

@Injectable()
export class TagsService {
    constructor(
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
    ) {}

    async create(data: CreateTagDto): Promise<Tag> {
        const name = this.normalize(data.name);
        await this.assertNameAvailable(name);

        const tag = this.tagRepository.create({name});
        return await this.tagRepository.save(tag);
    }

    async findAll(): Promise<Tag[]> {
        return await this.tagRepository.find({
            order: {createdAt: "DESC"},
        });
    }

    async findOne(id: string): Promise<Tag> {
        const tag = await this.tagRepository.findOne({where: {id}});

        if (!tag) {
            throw new NotFoundException(`Тег с ID ${id} не найден`);
        }

        return tag;
    }

    async update(id: string, newName: string): Promise<Tag> {
        const tag = await this.findOne(id);
        const name = this.normalize(newName);
        await this.assertNameAvailable(name, id);

        Object.assign(tag, {name});
        return await this.tagRepository.save(tag);
    }

    async delete(id: string): Promise<void> {
        const tag = await this.findOne(id);
        await this.tagRepository.manager.transaction(async (manager) => {
            await manager
                .createQueryBuilder()
                .delete()
                .from("article_tags")
                .where('"tagId" = :id', {id})
                .execute();
            await manager.remove(Tag, tag);
        });
    }

    async findByName(name: string): Promise<Tag | null> {
        return await this.tagRepository.findOne({
            where: {name: this.normalize(name)},
        });
    }

    async findOrCreateByNames(names: string[]): Promise<Tag[]> {
        const normalizedNames = [...new Set(names.map((name) => this.normalize(name)))]
            .filter((name) => name.length > 0);
        if (normalizedNames.length === 0) {
            return [];
        }

        const existingTags = await this.tagRepository.find({
            where: {name: In(normalizedNames)},
        });
        const existingNames = new Set(existingTags.map((tag) => tag.name));
        const newTags = normalizedNames
            .filter((name) => !existingNames.has(name))
            .map((name) => this.tagRepository.create({name}));
        const savedTags =
            newTags.length > 0 ? await this.tagRepository.save(newTags) : [];

        return normalizedNames
            .map((name) =>
                [...existingTags, ...savedTags].find((tag) => tag.name === name),
            )
            .filter((tag): tag is Tag => Boolean(tag));
    }

    private normalize(name: string): string {
        return name.trim().toLowerCase();
    }

    private async assertNameAvailable(
        name: string,
        currentId?: string,
    ): Promise<void> {
        const existingTag = await this.findByName(name);
        if (existingTag && existingTag.id !== currentId) {
            throw new ConflictException("Tag name already exists");
        }
    }
}
