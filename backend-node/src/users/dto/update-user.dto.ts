import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    locale?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    age?: number;
}
