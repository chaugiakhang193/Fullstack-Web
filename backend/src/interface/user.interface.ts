import { UserRole, AccountStatus } from '@/modules/enums';

export interface IUser {
  sub: string;
  username: string;
  role: UserRole;
  status: AccountStatus;
  iat?: number;
  exp?: number;
}
