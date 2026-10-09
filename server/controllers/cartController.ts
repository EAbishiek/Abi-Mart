import { Request, Response } from 'express';
import { cartRepository } from '../repositories/cartRepository';
import { authService } from '../services/authService';

function sendSuccess(res: Response, data: any, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
  });
}

function sendError(res: Response, statusCode: number, code: string, message: string) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      fieldErrors: null,
    },
  });
}

function getUserFromToken(req: Request) {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies?.auth_token) {
    token = req.cookies.auth_token;
  }
  if (!token) return null;
  return authService.verifyToken(token);
}

export class CartController {
  /**
   * GET /api/v1/cart
   */
  async getCart(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in to access synchronized database cart.');
      }

      const items = await cartRepository.findByUserId(user.id);
      return sendSuccess(res, { items });
    } catch (err: any) {
      console.error('Failed to get cart:', err);
      return sendError(res, 500, 'CART_ERROR', 'Failed to retrieve cart items.');
    }
  }

  /**
   * POST /api/v1/cart/items
   */
  async addItem(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in required to persist item to cart.');
      }

      const { productId, quantity } = req.body || {};
      if (!productId) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Product ID is required.');
      }

      const items = await cartRepository.addItem(user.id, Number(productId), Number(quantity) || 1);
      return sendSuccess(res, { items }, 201);
    } catch (err: any) {
      return sendError(res, 500, 'CART_ERROR', 'Failed to add item to cart.');
    }
  }

  /**
   * PUT /api/v1/cart/items/:productId
   */
  async updateQuantity(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in required.');
      }

      const productId = Number(req.params.productId);
      const { quantity } = req.body || {};
      const items = await cartRepository.updateQuantity(user.id, productId, Number(quantity) || 0);
      return sendSuccess(res, { items });
    } catch (err: any) {
      return sendError(res, 500, 'CART_ERROR', 'Failed to update item quantity.');
    }
  }

  /**
   * DELETE /api/v1/cart/items/:productId
   */
  async removeItem(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in required.');
      }

      const productId = Number(req.params.productId);
      const items = await cartRepository.removeItem(user.id, productId);
      return sendSuccess(res, { items });
    } catch (err: any) {
      return sendError(res, 500, 'CART_ERROR', 'Failed to remove item from cart.');
    }
  }

  /**
   * POST /api/v1/cart/clear
   */
  async clearCart(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in required.');
      }

      await cartRepository.clear(user.id);
      return sendSuccess(res, { items: [] });
    } catch (err: any) {
      return sendError(res, 500, 'CART_ERROR', 'Failed to clear cart.');
    }
  }

  /**
   * POST /api/v1/cart/sync
   */
  async syncCart(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in required.');
      }

      const { guestItems } = req.body || {};
      if (Array.isArray(guestItems)) {
        const items = await cartRepository.syncGuestCart(user.id, guestItems);
        return sendSuccess(res, { items });
      }

      const items = await cartRepository.findByUserId(user.id);
      return sendSuccess(res, { items });
    } catch (err: any) {
      return sendError(res, 500, 'CART_ERROR', 'Failed to sync cart items.');
    }
  }
}

export const cartController = new CartController();
