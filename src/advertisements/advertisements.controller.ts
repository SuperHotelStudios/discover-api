import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Headers,
  ForbiddenException,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import { AdvertisementsService } from './advertisements.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('advertisements')
export class AdvertisementsController {
  constructor(
    private readonly advertisementsService: AdvertisementsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createAdvertisementDto: CreateAdvertisementDto,
    @Req() req: any,
  ) {
    return this.advertisementsService.create(
      createAdvertisementDto,
      req.user,
    );
  }

  @Get('active')
  async getActiveAdvertisements(
    @Headers('x-bot-api-key') botApiKey?: string,
  ) {
    const expectedKey = process.env.BOT_API_KEY;

    if (expectedKey && botApiKey !== expectedKey) {
      throw new ForbiddenException('Invalid bot API key.');
    }

    return this.advertisementsService.findActiveAdvertisements();
  }

  @Post('cleanup-left-server')
  async cleanupLeftServer(
    @Body() body: { discordId: string },
    @Headers('x-bot-api-key') botApiKey?: string,
  ) {
    const expectedKey = process.env.BOT_API_KEY;

    if (expectedKey && botApiKey !== expectedKey) {
      throw new ForbiddenException('Invalid bot API key.');
    }

    return this.advertisementsService.removeForLeftServer(body.discordId);
  }

  @Post('cleanup-expired-removed')
  async cleanupExpiredRemoved(
    @Headers('x-bot-api-key') botApiKey?: string,
  ) {
    const expectedKey = process.env.BOT_API_KEY;

    if (expectedKey && botApiKey !== expectedKey) {
      throw new ForbiddenException('Invalid bot API key.');
    }

    return this.advertisementsService.purgeExpiredRemovedAdvertisements();
  }

  @Post('events/:eventId/deliveries')
  async recordEventDelivery(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Body() body: {
      adminDiscordId: string;
      adminUsername: string;
      status: 'SENT' | 'FAILED';
      errorMessage?: string | null;
    },
    @Headers('x-bot-api-key') botApiKey?: string,
  ) {
    const expectedKey = process.env.BOT_API_KEY;

    if (expectedKey && botApiKey !== expectedKey) {
      throw new ForbiddenException('Invalid bot API key.');
    }

    return this.advertisementsService.recordEventDelivery(eventId, body);
  }
}