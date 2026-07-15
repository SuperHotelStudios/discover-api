import {
  Controller,
  Post,
  Get,
  Param,
  Req,
} from '@nestjs/common';

import { ViewsService } from './views.service';

@Controller('communities')
export class ViewsController {
  constructor(
    private readonly viewsService: ViewsService,
  ) {}

  @Post(':id/view')
  recordView(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.viewsService.recordView(
      +id,
      req.user,
    );
  }

  @Get(':id/views')
  getViews(
    @Param('id') id: string,
  ) {
    return this.viewsService.getTotalViews(
      +id,
    );
  }
}
