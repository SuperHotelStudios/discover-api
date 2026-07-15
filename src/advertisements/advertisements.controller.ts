import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
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
}