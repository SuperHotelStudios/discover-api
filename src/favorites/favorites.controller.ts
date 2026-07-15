import {
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('communities')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/favorite')
  toggleFavorite(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.favoritesService.toggleFavorite(
      +id,
      req.user,
    );
  }
  
  @UseGuards(JwtAuthGuard)
  @Get(':id/favorites')
  getFavorites(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.favoritesService.getFavorites(
      +id,
      req.user,
    );
  }
}