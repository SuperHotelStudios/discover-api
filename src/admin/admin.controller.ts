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
  Post,
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

  @Post('transcripts')
  createTranscript(@Body() body: any) {
    return this.adminService.createTranscript({
      ticketType: body.ticketType,
      ticketName: body.ticketName,
      ownerDiscordId: body.ownerDiscordId,
      ownerUsername: body.ownerUsername,
      closedBy: body.closedBy,
      guildId: body.guildId,
      channelId: body.channelId,
      transcriptText: body.transcriptText,
    });
  }

  @Get('transcripts')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getTranscripts(@Query() query: { type?: string; user?: string; staff?: string; from?: string; to?: string; page?: string; limit?: string }) {
    return this.adminService.getTranscripts({
      ...query,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    });
  }

  @Post('audit-logs')
  createAuditLog(@Body() body: any) {
    return this.adminService.createAuditLog(body);
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAuditLogs(@Query() query: { action?: string; executor?: string; target?: string; from?: string; to?: string; page?: string; limit?: string }) {
    return this.adminService.getAuditLogs({
      ...query,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    });
  }

  @Post('ratings')
  async createRating(@Body() body: { channelId: string; userDiscordId: string; score: number }) {
    const existing = await this.adminService.getRating(body.channelId, body.userDiscordId);
    return this.adminService.saveRating(existing || body);
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
