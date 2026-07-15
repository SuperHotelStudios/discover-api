import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';

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
}