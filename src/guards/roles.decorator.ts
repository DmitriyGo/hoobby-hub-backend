import { Reflector } from '@nestjs/core';

import { UserRole } from '../models/user-role';

export const UserRoles = Reflector.createDecorator<UserRole>();
