import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL');

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fullstack Web API')
    .setDescription('Tài liệu API cho dự án Fullstack Web')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập Access Token (không cần thêm "Bearer " phía trước)',
      },
      'access-token', // tên security scheme — dùng trong @ApiBearerAuth('access-token')
    )
    .addTag('Auth', 'Đăng ký, đăng nhập, xác thực tài khoản')
    .addTag('Users', 'Quản lý người dùng')
    .addTag('Products', 'Quản lý sản phẩm')
    .addTag('Orders', 'Quản lý đơn hàng')
    .addTag('Carts', 'Giỏ hàng')
    .addTag('Shops', 'Quản lý cửa hàng')
    .addTag('Payments', 'Thanh toán')
    .addTag('Promotions', 'Khuyến mãi')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // giữ token sau khi reload trang
    },
  });

  // dùng khi Deploy mà có Cloudfare
  //app.set('trust proxy', 1);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
