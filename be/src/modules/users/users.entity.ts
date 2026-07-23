import {Column, Entity} from "typeorm";

import {BaseEntity} from "../../shared/utils/entity";
import {Role} from "../../types";

@Entity("users")
export class User extends BaseEntity {
    @Column()
    username!: string;

    @Column({unique: true})
    email!: string;

    @Column({select: false})
    password!: string;

    @Column({
        type: "enum",
        enumName: "user_role",
        enum: Role,
        default: "User",
    })
    role!: Role;

    @Column({nullable: true})
    avatar?: string | null;

    @Column({nullable: true})
    nowReading?: string | null;

    @Column({nullable: true})
    nowWatch?: string | null;

    @Column({nullable: true})
    nowBeingIn?: string | null;

    @Column({nullable: true})
    nowListening?: string | null;
}
