import { Controller, Get, Query } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('discord')
export class DiscordController {
  constructor(
    private readonly discordService: DiscordService,
  ) {}

  @Get('invite')
  async getInvite(
    @Query('url') url: string,
  ) {
    return this.discordService.getInviteInfo(url);
  }
}