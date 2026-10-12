import { IsEnum, IsUUID } from 'class-validator';
import { Permission } from '../generated/prisma/enums.js';
export class PermissionDto {
  @IsEnum(Permission) permission!: Permission;
}
export class ShareDto extends PermissionDto {
  @IsUUID() userId!: string;
}
