import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsUUID } from 'class-validator';
import type { Response } from 'express';
import type { AuthenticatedRequest } from './types.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';
import { DEMO_USERS } from './demo-users.js';
class LoginDto {
  @IsUUID() userId!: string;
}
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}
  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.config.getOrThrow<boolean>('SESSION_COOKIE_SECURE'),
      sameSite: 'lax' as const,
      path: '/',
    };
  }
  @Get('demo-users') accounts() {
    return DEMO_USERS;
  }
  @Post('demo-login') async login(
    @Body() body: LoginDto,
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.login(
      body.userId,
      req.cookies?.ajaia_session as string | undefined,
    );
    res.cookie('ajaia_session', result.token, {
      ...this.cookieOptions(),
      maxAge: 86400000,
    });
    return result.user;
  }
  @UseGuards(AuthGuard) @Get('me') me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
  @Post('logout') async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(req.cookies?.ajaia_session as string | undefined);
    res.clearCookie('ajaia_session', this.cookieOptions());
    return { success: true };
  }
}
