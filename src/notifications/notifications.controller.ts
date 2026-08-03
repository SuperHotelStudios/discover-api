import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('test-webhook')
  async testWebhook() {
    await this.notificationsService.sendCategoryRequestWebhook(
      'Photography',
      '📸',
      'High Rock',
    );

    return {
      message: 'Webhook sent successfully!',
    };
  }
}