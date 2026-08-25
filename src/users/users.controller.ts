import {
  Controller,
  Get,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req: any) {
    return this.usersService.getProfile(
      req.user,
    );
  }

  /**
   * Public endpoint for bot to check if Discord user is registered
   * Used by the Discord bot's /verify command
   */
  @Get('verify/:discordId')
  async verifyDiscordUser(@Param('discordId') discordId: string) {
    return this.usersService.findByDiscordId(discordId);
  }
}
