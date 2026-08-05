import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { OwnerGuard } from './guards/owner.guard';
import { AdminService } from './admin.service';
import { DeleteCommunityDto } from './dto/delete-community.dto';
import {
  Body,
  Delete,
} from '@nestjs/common';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { UnbanUserDto } from './dto/unban-user.dto';

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

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getUsers(@Query('search') search?: string) {
    return this.adminService.getUsers(search);
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserRoleDto,
    @Req() req: any,
  ) {
    return this.adminService.updateUserRole(id, dto.role, req.user);
  }

  @Patch('users/:id/ban')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  banUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BanUserDto,
    @Req() req: any,
  ) {
    return this.adminService.banUser(id, dto.reason, req.user);
  }

  @Patch('users/:id/unban')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  unbanUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UnbanUserDto,
    @Req() req: any,
  ) {
    return this.adminService.unbanUser(id, dto.reason, req.user);
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
