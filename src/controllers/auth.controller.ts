import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { HttpCode } from '../utils/errors';

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.signup(req.body);
      res.status(HttpCode.CREATED).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      res.status(HttpCode.OK).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
