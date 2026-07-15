import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createReviewDto: CreateReviewDto,
    @Req() req: any,
  ) {
    return this.reviewsService.create(
      createReviewDto,
      req.user,
    );
  }

  @Get('community/:id')
  findByCommunity(
    @Param('id') id: string,
  ) {
    return this.reviewsService.findByCommunity(
      +id,
    );
  }
}