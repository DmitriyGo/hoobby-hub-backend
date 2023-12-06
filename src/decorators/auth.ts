import { UseGuards } from '@nestjs/common';

import { UserRole } from '@/models/user-role';

import { AuthGuard } from '../guards/auth.guard';
import { UserRoles } from '../guards/roles.decorator';

export function AdminAuth() {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    UserRoles(UserRole.ADMIN)(target, key, descriptor);
    UseGuards(AuthGuard)(target, key, descriptor);
  };
}

export function UseAuth() {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    UseGuards(AuthGuard)(target, key, descriptor);
  };
}
