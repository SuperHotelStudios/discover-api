import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommunitiesModule } from './communities/communities.module';
import { AdvertisementsModule } from './advertisements/advertisements.module';
import { DiscordModule } from './discord/discord.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ViewsModule } from './views/views.module';
import { ClicksModule } from './clicks/clicks.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CategoriesModule } from './categories/categories.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { CategoryRequestsModule } from './category-requests/category-requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { SeedService } from './database/seeds/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),

    CommunitiesModule,

    UsersModule,

    AuthModule,

    AdvertisementsModule,

    DiscordModule,

    ReviewsModule,

    ViewsModule,

    ClicksModule,

    FavoritesModule,

    CategoriesModule,

    DashboardModule,

    AdminModule,

    CategoryRequestsModule,

    NotificationsModule,

    ReportsModule,

  ],
  controllers: [AppController],
  providers: [AppService,
      SeedService,
  ]
  
})
export class AppModule {}