import {
  Controller,
  Injectable,
  Module,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard.js';
import type { AuthenticatedRequest } from '../auth/types.js';
import { DocumentsModule } from '../documents/documents.module.js';
import { DocumentsService } from '../documents/documents.service.js';
import { parseUpload } from './import-parser.js';
@Injectable()
class ImportsService {
  constructor(private readonly documents: DocumentsService) {}
  import(userId: string, file?: Express.Multer.File) {
    const parsed = parseUpload(file);
    return this.documents.create(userId, parsed.title, parsed.content);
  }
}
@Controller('documents')
@UseGuards(AuthGuard)
class ImportsController {
  constructor(private readonly imports: ImportsService) {}
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0, parts: 1 },
    }),
  )
  import(
    @Req() req: AuthenticatedRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.imports.import(req.user.id, file);
  }
}
@Module({
  imports: [DocumentsModule],
  controllers: [ImportsController],
  providers: [ImportsService],
})
export class ImportsModule {}
