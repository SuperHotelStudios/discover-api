import {
  Controller,
  Post,
  Get,
  Param,
  Req,
} from '@nestjs/common';

import { ClicksService } from './clicks.service';

@Controller('communities')
export class ClicksController {
  constructor(
    private readonly clicksService: ClicksService,
  ) {}

  @Post(':id/click')
  recordClick(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.clicksService.recordClick(
      +id,
      req.user,
    );
  }

  @Get(':id/clicks')
  getClicks(
    @Param('id') id: string,
  ) {
    return this.clicksService.getTotalClicks(
      +id,
    );
  }
}
