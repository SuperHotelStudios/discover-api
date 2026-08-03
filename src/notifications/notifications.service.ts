import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly webhook =
    process.env.ADMIN_WEBHOOK_URL!;

  async sendCategoryRequestWebhook(
    category: string,
    icon: string,
    requestedBy: string,
  ) {
  await axios.post(this.webhook, {
    username: "Discover Moderation",

    embeds: [
      {
        color: 0x5865f2,
        author: {
          name: "Discover Moderation",
        },
        title: "🏷 New Category Request",
        description: "A user has requested a new community category.",
        fields: [
          {
            name: "📂 Category",
            value: "📸 Photography",
            inline: true,
          },
          {
            name: "👤 Requested By",
            value: "High Rock",
            inline: true,
          },
          {
            name: "📅 Status",
            value: "🟡 Pending Review",
            inline: false,
          },
        ],
        footer: {
          text: "Discover • Moderation System",
        },
        timestamp: new Date().toISOString(),
      },
    ],

    // ✅ This belongs OUTSIDE the embed
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "🌐 Open Admin Dashboard",
            url: "http://localhost:5173/admin",
          },
        ],
      },
    ],
  });
  }
}