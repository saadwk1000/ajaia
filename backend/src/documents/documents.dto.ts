import { Transform } from 'class-transformer';
import { IsInt, IsObject, IsString, Length, Min } from 'class-validator';
export class TitleDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 150)
  title!: string;
}
export class ContentDto {
  @IsObject() content!: Record<string, unknown>;
  @IsInt() @Min(1) expectedVersion!: number;
}
