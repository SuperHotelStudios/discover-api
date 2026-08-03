import { Injectable, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class DiscordService {
  constructor(
    private readonly httpService: HttpService,
  ) {}

  async getInviteInfo(inviteLink: string) {
    const match = inviteLink.match(
      /(?:discord\.gg\/|discord\.com\/invite\/)([A-Za-z0-9-]+)/,
    );

    if (!match) {
      throw new BadRequestException(
        'Invalid Discord invite link.',
      );
    }

    const inviteCode = match[1];

    let data: any;

    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`,
        ),
      );

      data = response.data;
    } catch (error) {
      if (
        error instanceof AxiosError &&
        error.response?.status === 404
      ) {
        throw new BadRequestException(
          'Invalid or expired Discord invite.',
        );
      }

      throw new BadRequestException(
        'Unable to verify Discord invite at the moment. Please try again later.',
      );
    }

    // ============================
    // Must be a Discord Server
    // ============================

    if (!data.guild) {
      throw new BadRequestException(
        'Only Discord server invites are allowed.',
      );
    }

    // ============================
    // Invite must never expire
    // ============================

    if (data.expires_at !== null) {
      throw new BadRequestException(
        'Invite link must never expire.',
      );
    }

    // ============================
    // Guild Icon
    // ============================

    const iconUrl = data.guild.icon
      ? `https://cdn.discordapp.com/icons/${data.guild.id}/${data.guild.icon}.${data.guild.icon.startsWith('a_') ? 'gif' : 'png'}`
      : '';

    // ============================
    // Success
    // ============================

    return {
      discordGuildId: data.guild.id,
      name: data.guild.name,
      logo: iconUrl,
      memberCount: data.approximate_member_count,
      data,

      // Store normalized invite
      inviteLink: `https://discord.gg/${inviteCode}`,
    };
  }
}