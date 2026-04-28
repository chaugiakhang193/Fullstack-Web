import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransformInterceptor } from '@/interceptor/transform.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

//modules
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { ShopsModule } from '@/modules/shops/shops.module';
import { ProductsModule } from '@/modules/products/products.module';
import { CartsModule } from '@/modules/carts/carts.module';
import { OrdersModule } from '@/modules/orders/orders.module';
import { PromotionsModule } from '@/modules/promotions/promotions.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { EngagementsModule } from '@/modules/engagements/engagements.module';
import { MailModule } from '@/modules/mail/mail.module';

//entities
import { User } from '@/modules/users/entities/user.entity';
import { Address } from './modules/users/entities/address.entity';
import { Session } from '@/auth/entities/session.entity';
import { VerificationToken } from './auth/entities/verification-token.entity';
import { Shop } from './modules/shops/entities/shop.entity';
import { Payout } from './modules/shops/entities/payout.entity';
import { Product } from './modules/products/entities/product.entity';
import { ProductVariant } from './modules/products/entities/product-variant.entity';
import { Category } from './modules/products/entities/category.entity';
import { CartItem } from './modules/carts/entities/cart-item.entity';
import { Order } from './modules/orders/entities/order.entity';
import { SubOrder } from './modules/orders/entities/sub-order.entity';
import { OrderItem } from './modules/orders/entities/order-item.entity';
import { Coupon } from './modules/promotions/entities/coupon.entity';
import { UserCoupon } from './modules/promotions/entities/user-coupon.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Review } from './modules/engagements/entities/review.entity';
import { Notification } from './modules/engagements/entities/notification.entity';

//Global Guard
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './auth/guard/jwt-access-auth.guard';

//Mailer
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ShopsModule,
    ProductsModule,
    CartsModule,
    OrdersModule,
    PromotionsModule,
    PaymentsModule,
    EngagementsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User,
          Address,
          Session,
          VerificationToken,
          Shop,
          Payout,
          Product,
          ProductVariant,
          Category,
          CartItem,
          Order,
          SubOrder,
          OrderItem,
          Coupon,
          UserCoupon,
          Payment,
          Review,
          Notification,
        ],
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
