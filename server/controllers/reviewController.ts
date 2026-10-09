import { Request, Response } from 'express';
import { reviewRepository } from '../repositories/reviewRepository';
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

export class ReviewController {
  /**
   * GET /api/v1/products/:id/reviews
   */
  async getReviews(req: Request, res: Response) {
    try {
      const productId = Number(req.params.id);
      const reviews = await reviewRepository.findByProductId(productId);
      return sendSuccess(res, { reviews, total: reviews.length });
    } catch (err: any) {
      return sendError(res, 500, 'REVIEWS_ERROR', 'Failed to retrieve reviews.');
    }
  }

  /**
   * POST /api/v1/products/:id/reviews
   */
  async createReview(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user) {
        return sendError(res, 401, 'UNAUTHENTICATED', 'Sign in required to post a review.');
      }

      const productId = Number(req.params.id);
      const { rating, comment } = req.body || {};

      if (!rating || !comment || !comment.trim()) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Rating and comment are required.');
      }

      const review = await reviewRepository.create({
        productId,
        userId: user.id,
        userName: user.name,
        rating: Number(rating),
        comment: comment.trim(),
      });

      return sendSuccess(res, { review }, 201);
    } catch (err: any) {
      return sendError(res, 500, 'CREATE_REVIEW_ERROR', 'Failed to submit review.');
    }
  }
}

export const reviewController = new ReviewController();
