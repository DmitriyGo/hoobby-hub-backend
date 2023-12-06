import { Request } from 'express';

import { JWTUserDTO } from './dtos/user.dto';
import { User } from '../../models/user.model';

export interface AuthRequest extends Request {
  user: JWTUserDTO & { data?: User };
}
