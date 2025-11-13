import {ApiProperty} from "@nestjs/swagger";
import {
    IsEmail,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from "class-validator";

export class UpdateUserDto {
    @ApiProperty({example: "StrongPassword123!"})
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {
        message: "Пароль должен содержать заглавные, строчные буквы и цифры",
    })
    password: string;

    @ApiProperty({example: "kolya-master"})
    @IsString()
    @MinLength(3)
    @MaxLength(32)
    username: string;
}

export class CreateUserDto extends UpdateUserDto {
    @ApiProperty({example: "user@example.com"})
    @IsEmail()
    @MaxLength(255)
    email: string;
}
