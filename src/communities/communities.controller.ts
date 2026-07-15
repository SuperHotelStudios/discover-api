import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createCommunityDto: CreateCommunityDto,
    @Req() req: any,
  ) {
    return this.communitiesService.create(
      createCommunityDto,
      req.user,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyCommunities(@Req() req: any) {
    return this.communitiesService.findMyCommunities(
      req.user,
    );
  }
  @Get()
  getLeaderboard() {
    return this.communitiesService.getLeaderboard();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommunityDto: UpdateCommunityDto,
    @Req() req: any,
  ) {
    return this.communitiesService.update(
      +id,
      updateCommunityDto,
      req.user,
    );
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteMyCommunity(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.communitiesService.deleteMyCommunity(
      +id,
      req.user,
    );
  }
}
