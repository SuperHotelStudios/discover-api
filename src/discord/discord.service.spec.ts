import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { DiscordService } from './discord.service';

describe('DiscordService', () => {
  let service: DiscordService;
  let httpService: { get: jest.Mock };

  const originalEnvironment = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnvironment };
    httpService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordService,
        { provide: HttpService, useValue: httpService },
      ],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
  });

  afterAll(() => {
    process.env = originalEnvironment;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects verification when Discord configuration is missing', async () => {
    delete process.env.GUILD_ID;
    delete process.env.MAIN_DISCORD_GUILD_ID;
    delete process.env.DISCORD_TOKEN;
    delete process.env.DISCORD_BOT_TOKEN;

    await expect(service.isUserInGuild('discord-user-id')).resolves.toBe(false);
    expect(httpService.get).not.toHaveBeenCalled();
  });

  it('returns true when Discord confirms guild membership', async () => {
    process.env.GUILD_ID = 'guild-id';
    process.env.DISCORD_TOKEN = 'bot-token';
    httpService.get.mockReturnValue(of({ data: {} }));

    await expect(service.isUserInGuild('discord-user-id')).resolves.toBe(true);
    expect(httpService.get).toHaveBeenCalledWith(
      'https://discord.com/api/v10/guilds/guild-id/members/discord-user-id',
      { headers: { Authorization: 'Bot bot-token' } },
    );
  });

  it('returns false when Discord reports the user is not a guild member', async () => {
    process.env.GUILD_ID = 'guild-id';
    process.env.DISCORD_TOKEN = 'bot-token';
    const error = new AxiosError('Not found');
    error.response = {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {} as never,
      data: {},
    };
    httpService.get.mockReturnValue(throwError(() => error));

    await expect(service.isUserInGuild('discord-user-id')).resolves.toBe(false);
  });

  it('throws when Discord membership verification fails unexpectedly', async () => {
    process.env.GUILD_ID = 'guild-id';
    process.env.DISCORD_TOKEN = 'bot-token';
    httpService.get.mockReturnValue(throwError(() => new Error('network failure')));

    await expect(service.isUserInGuild('discord-user-id')).rejects.toThrow(
      'Unable to verify whether you are in the Discover Discord server right now.',
    );
  });
});
