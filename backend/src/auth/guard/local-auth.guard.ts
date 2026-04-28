import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from '@/auth/dto/create-auth.dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const loginDto = plainToInstance(LoginDto, body);

    const errors = await validate(loginDto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return super.canActivate(context) as boolean;
  }
}
