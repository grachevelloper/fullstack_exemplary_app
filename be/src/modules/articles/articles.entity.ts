import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
} from "typeorm";

import {BaseEntity} from "../../shared/utils/entity";
import {User} from "../users/users.entity";
import {Tag} from "./tags/tags.entity";

@Entity("articles")
export class Article extends BaseEntity {
    @Column()
    title!: string;

    @Column({length: 300})
    description!: string;

    @Column()
    image!: string;

    @Column({type: "uuid", nullable: true})
    coverAttachmentId?: string | null;

    @Column("text")
    content!: string;

    @ManyToMany(() => Tag, {eager: true})
    @JoinTable({
        name: "article_tags",
        joinColumn: {name: "articleId", referencedColumnName: "id"},
        inverseJoinColumn: {name: "tagId", referencedColumnName: "id"},
    })
    tags?: Tag[];

    @Column({nullable: true})
    readTime?: number;

    @Column({default: 0})
    likesCount!: number;

    @ManyToOne(() => User)
    @JoinColumn({name: "authorId"})
    author!: User;

    @Column({default: true})
    isDraft!: boolean;
}
