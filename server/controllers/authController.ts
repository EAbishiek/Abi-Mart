import { Request, Response } from 'express';
import { authService, ServiceError } from '../services/authService';

/**
 * Formats response according to Section 11 JSON Envelope standard.
 */
function sendSuccess(res: Response, data: any, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
}

function sendError(res: Response, statusCode: number, code: string, message: string, fieldErrors?: Record<string, string>) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      fieldErrors: fieldErrors || null,
    },
  });
}

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, confirmPassword, role } = req.body || {};
      const result = await authService.register({ name, email, password, confirmPassword, role });

      // Set auth cookie
      res.cookie('auth_token', result.token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return sendSuccess(res, result, 201);
    } catch (err: any) {
      if (err instanceof ServiceError) {
        return sendError(res, err.status, err.code, err.message, err.fieldErrors);
      }
      console.error('Unhandled Registration Error:', err);
      return sendError(res, 500, 'SERVER_ERROR', 'An unexpected server error occurred.');
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body || {};
      const result = await authService.login({ email, password });

      // Discard pre-auth session and set fresh token cookie (Section 2 engineering rule #3)
      res.cookie('auth_token', result.token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax',
      });

      return sendSuccess(res, result, 200);
    } catch (err: any) {
      if (err instanceof ServiceError) {
        return sendError(res, err.status, err.code, err.message, err.fieldErrors);
      }
      console.error('Unhandled Login Error:', err);
      return sendError(res, 500, 'SERVER_ERROR', 'An unexpected server error occurred.');
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      let token = '';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else if (req.cookies?.auth_token) {
        token = req.cookies.auth_token;
      }

      if (!token) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'No active session token provided.');
      }

      const user = authService.verifyToken(token);
      if (!user) {
        return sendError(res, 401, 'INVALID_TOKEN', 'Session token is invalid or expired.');
      }

      return sendSuccess(res, { user, token });
    } catch (err: any) {
      return sendError(res, 500, 'SERVER_ERROR', 'Failed to retrieve active user profile.');
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response) {
    res.clearCookie('auth_token');
    return sendSuccess(res, { message: 'Successfully logged out and session destroyed.' }, 200);
  }

  /**
   * GET /api/v1/users
   */
  async getUsers(req: Request, res: Response) {
    try {
      const users = await authService.getAllUsers();
      return sendSuccess(res, { users, total: users.length }, 200);
    } catch (err: any) {
      return sendError(res, 500, 'SERVER_ERROR', 'Failed to query database user table.');
    }
  }
}

export const authController = new AuthController();
