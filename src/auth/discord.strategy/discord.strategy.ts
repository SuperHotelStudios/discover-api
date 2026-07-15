import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('DISCORD_CLIENT_ID')!,
      clientSecret: config.get<string>('DISCORD_CLIENT_SECRET')!,
      callbackURL: config.get<string>('DISCORD_CALLBACK')!,
      scope: ['identify', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    return profile;
  }
}