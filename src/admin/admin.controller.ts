import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { DeleteCommunityDto } from './dto/delete-community.dto';
import {
  Body,
  Delete,
} from '@nestjs/common';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
  ) {}

  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  @Get('dashboard')
  dashboard() {
    return this.adminService.getDashboard();
  }
  @Get('communities')
  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  getCommunities() {
    return this.adminService.getCommunities();
  }

  @Patch('communities/:id/verify')
  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  verifyCommunity(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.adminService.verifyCommunity(id);
  }

  @Patch('communities/:id/feature')
  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  featureCommunity(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.adminService.featureCommunity(id);
  }
  
  @Patch('communities/:id/hide')
  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  toggleHidden(
    @Param('id', ParseIntPipe)
    id: number,
  ) {
    return this.adminService.toggleHidden(id);
  }

  @Delete('communities/:id')
  @UseGuards(
    JwtAuthGuard,
    AdminGuard,
  )
  deleteCommunity(
    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: DeleteCommunityDto,
  ) {
    return this.adminService.deleteCommunity(
      id,
      dto.reason,
    );
  }
}