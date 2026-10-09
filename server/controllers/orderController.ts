import { Request, Response } from 'express';
import { orderRepository } from '../repositories/orderRepository';
import { cartRepository } from '../repositories/cartRepository';
import { productRepository } from '../repositories/productRepository';
import { authService } from '../services/authService';
import { OrderStatus } from '../../src/types';

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

export class OrderController {
  /**
   * POST /api/v1/orders/checkout
   */
  async checkout(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'You must be logged in to place an order.');
      }

      const { shippingAddress, paymentMethod, directItems, discountCents = 0 } = req.body || {};

      if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Complete shipping address is required.');
      }

      // Collect items to purchase
      let itemsToOrder: { productId: number; quantity: number; unitPriceCents: number }[] = [];

      if (Array.isArray(directItems) && directItems.length > 0) {
        for (const item of directItems) {
          const prod = await productRepository.findById(item.productId);
          if (prod) {
            itemsToOrder.push({
              productId: prod.id,
              quantity: item.quantity || 1,
              unitPriceCents: prod.price_cents,
            });
          }
        }
      } else {
        const cartItems = await cartRepository.findByUserId(user.id);
        if (cartItems.length === 0) {
          return sendError(res, 400, 'EMPTY_CART', 'Your cart is empty.');
        }

        for (const c of cartItems) {
          if (c.product) {
            itemsToOrder.push({
              productId: c.product.id,
              quantity: c.quantity,
              unitPriceCents: c.product.price_cents,
            });
          }
        }
      }

      if (itemsToOrder.length === 0) {
        return sendError(res, 400, 'NO_ITEMS', 'No valid items found for checkout.');
      }

      // Calculate total amount
      const subtotalCents = itemsToOrder.reduce((sum, it) => sum + (it.unitPriceCents * it.quantity), 0);
      const finalAmountCents = Math.max(0, subtotalCents - Number(discountCents));

      const order = await orderRepository.createOrder({
        buyerId: user.id,
        items: itemsToOrder,
        totalAmountCents: finalAmountCents,
        shippingAddress,
        paymentMethod: paymentMethod || 'CARD',
      });

      return sendSuccess(res, { order }, 201);
    } catch (err: any) {
      console.error('Checkout error:', err);
      return sendError(res, 500, 'CHECKOUT_FAILED', err.message || 'Failed to complete order transaction.');
    }
  }

  /**
   * GET /api/v1/orders
   */
  async getOrders(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in to access orders.');
      }

      let orders;
      if (user.role === 'ADMIN' || user.role === 'SELLER') {
        // Sellers and Admins view system-wide orders
        orders = await orderRepository.findAll();
      } else {
        // Buyers view their personal orders
        orders = await orderRepository.findByBuyerId(user.id);
      }

      return sendSuccess(res, { orders, total: orders.length });
    } catch (err: any) {
      return sendError(res, 500, 'ORDERS_QUERY_ERROR', 'Failed to retrieve orders.');
    }
  }

  /**
   * GET /api/v1/orders/:id
   */
  async getOrder(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in to view order details.');
      }

      const id = Number(req.params.id);
      const order = await orderRepository.findById(id);
      if (!order) {
        return sendError(res, 404, 'NOT_FOUND', 'Order not found.');
      }

      if (user.role === 'BUYER' && order.buyer_id !== user.id) {
        return sendError(res, 403, 'FORBIDDEN', 'Access denied.');
      }

      return sendSuccess(res, { order });
    } catch (err: any) {
      return sendError(res, 500, 'ORDER_QUERY_ERROR', 'Failed to retrieve order.');
    }
  }

  /**
   * PATCH /api/v1/orders/:id/status (Seller or Admin)
   */
  async updateStatus(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
        return sendError(res, 403, 'FORBIDDEN', 'Only Sellers or Admins can update fulfillment status.');
      }

      const id = Number(req.params.id);
      const { status } = req.body || {};
      const validStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return sendError(res, 400, 'INVALID_STATUS', 'Invalid order status value.');
      }

      const order = await orderRepository.updateStatus(id, status);
      if (!order) {
        return sendError(res, 404, 'NOT_FOUND', 'Order not found.');
      }

      return sendSuccess(res, { order });
    } catch (err: any) {
      return sendError(res, 500, 'UPDATE_STATUS_ERROR', 'Failed to update order status.');
    }
  }
}

export const orderController = new OrderController();
