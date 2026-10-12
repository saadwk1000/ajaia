import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types.js';
import { DocumentsService } from './documents.service.js';
import { ContentDto, TitleDto } from './documents.dto.js';
@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}
  @Post() create(@Req() req: AuthenticatedRequest) {
    return this.documents.create(req.user.id);
  }
  @Get() list(
    @Req() req: AuthenticatedRequest,
    @Query('scope') scope = 'owned',
  ) {
    if (scope !== 'owned' && scope !== 'shared')
      throw new BadRequestException('scope must be owned or shared');
    return this.documents.list(req.user.id, scope);
  }
  @Get(':id') get(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documents.access(id, req.user.id);
  }
  @Patch(':id/title') rename(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: TitleDto,
  ) {
    return this.documents.rename(id, req.user.id, dto.title);
  }
  @Patch(':id/content') save(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: ContentDto,
  ) {
    return this.documents.save(
      id,
      req.user.id,
      dto.content,
      dto.expectedVersion,
    );
  }
  @Delete(':id') remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documents.remove(id, req.user.id);
  }
}
