import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    Length,
    Matches,
    MaxLength,
    MinLength,
} from "class-validator";

import {Role} from "../../types";

export class SigninUserDto {
    @IsEmail()
    @MaxLength(255)
    email!: string;

    @ApiProperty({
        example: "StrongPassword123!",
        description: "Пароль пользователя",
    })
    @IsString()
    @MinLength(1)
    @MaxLength(72)
    password!: string;
}
export class SignupUserDto {
    @IsEmail()
    @MaxLength(255)
    email!: string;

    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
        message: "Пароль должен содержать заглавные, строчные буквы и цифры",
    })
    password!: string;

    @IsString()
    @Length(1, 50)
    username!: string;
}

export class CreateUserDto extends SignupUserDto {
    @IsEnum(Role)
    role!: Role;
}

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: "kolya-master",
        description: "Имя пользователя",
    })
    @IsString()
    @Length(1, 50)
    @IsOptional()
    username?: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsString()
    @IsOptional()
    avatar?: string | null;

    @IsString()
    @IsOptional()
    nowReading?: string | null;

    @IsString()
    @IsOptional()
    nowWatch?: string | null;

    @IsString()
    @IsOptional()
    nowListening?: string | null;

    @IsString()
    @IsOptional()
    nowBeingIn?: string | null;
}

export class ChangePasswordDto {
    @ApiProperty({example: "StrongPassword123!"})
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    currentPassword!: string;

    @ApiProperty({example: "NewStrongPassword123!"})
    @IsString()
    @MinLength(8)
    @MaxLength(72)
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
        message: "Пароль должен содержать заглавные, строчные буквы и цифры",
    })
    newPassword!: string;
}
