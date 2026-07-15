import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(profile: any) {
    let user = await this.usersService.findByDiscordId(profile.id);

    if (!user) {
      user = await this.usersService.createDiscordUser(profile);
    } else {
      user = await this.usersService.updateDiscordUser(user, profile);
    }

    const token = this.jwtService.sign({
      id: user.id,
      discordId: user.discordId,
      role: user.role,
    });

    return {
      token,
      user,
    };
  }
}