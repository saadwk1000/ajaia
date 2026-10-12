import {
  Body,
  Controller,
  Delete,
  Get,
  Module,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { SharingService } from './sharing.service.js';
import { PermissionDto, ShareDto } from './sharing.dto.js';
@Controller('documents/:id/shares')
@UseGuards(AuthGuard)
class SharingController {
  constructor(private readonly sharing: SharingService) {}
  @Get() list(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.sharing.list(id, req.user.id);
  }
  @Post() create(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ShareDto,
  ) {
    return this.sharing.create(id, req.user.id, dto);
  }
  @Patch(':shareId') update(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: PermissionDto,
  ) {
    return this.sharing.update(id, shareId, req.user.id, dto);
  }
  @Delete(':shareId') remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('shareId', ParseUUIDPipe) shareId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.sharing.update(id, shareId, req.user.id);
  }
}
@Module({
  imports: [DocumentsModule],
  controllers: [SharingController],
  providers: [SharingService],
})
export class SharingModule {}
