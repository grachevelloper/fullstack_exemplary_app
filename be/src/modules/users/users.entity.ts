import {Column, Entity} from "typeorm";

import {BaseEntity} from "../../shared/utils/entity";
import {Role} from "../../types";

@Entity("users")
export class User extends BaseEntity {
    @Column()
    username!: string;

    @Column({unique: true})
    email!: string;

    @Column({type: "varchar", select: false, nullable: true})
    password!: string | null;

    @Column({name: "yandex_id", type: "varchar", unique: true, nullable: true})
    yandexId!: string | null;

    @Column({
        type: "enum",
        enumName: "user_role",
        enum: Role,
        default: "User",
    })
    role!: Role;

    @Column({type: "varchar", nullable: true})
    avatar?: string | null;

    @Column({type: "varchar", nullable: true})
    nowReading?: string | null;

    @Column({type: "varchar", nullable: true})
    nowWatch?: string | null;

    @Column({type: "varchar", nullable: true})
    nowBeingIn?: string | null;

    @Column({type: "varchar", nullable: true})
    nowListening?: string | null;
}
