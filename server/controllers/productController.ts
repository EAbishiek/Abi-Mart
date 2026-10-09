import { Request, Response } from 'express';
import { productRepository } from '../repositories/productRepository';
import { authService } from '../services/authService';

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

export class ProductController {
  /**
   * GET /api/v1/products
   */
  async getProducts(req: Request, res: Response) {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const brand = req.query.brand as string | undefined;
      const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
      const inStockOnly = req.query.inStockOnly === 'true';
      const sortBy = req.query.sortBy as string | undefined;

      const products = await productRepository.findAll({
        category,
        search,
        brand,
        minPrice,
        maxPrice,
        inStockOnly,
        sortBy,
      });

      const categories = await productRepository.getCategories();
      const brands = await productRepository.getBrands();

      return sendSuccess(res, {
        products,
        total: products.length,
        categories,
        brands,
      });
    } catch (err: any) {
      console.error('Failed to get products:', err);
      return sendError(res, 500, 'PRODUCT_QUERY_ERROR', 'Failed to retrieve products from database.');
    }
  }

  /**
   * GET /api/v1/products/:id
   */
  async getProduct(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return sendError(res, 400, 'INVALID_ID', 'Product ID must be a numeric value.');
      }

      const product = await productRepository.findById(id);
      if (!product) {
        return sendError(res, 404, 'NOT_FOUND', 'Gaming product not found.');
      }

      return sendSuccess(res, { product });
    } catch (err: any) {
      return sendError(res, 500, 'PRODUCT_QUERY_ERROR', 'Failed to retrieve product.');
    }
  }

  /**
   * POST /api/v1/products (Seller or Admin)
   */
  async createProduct(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
        return sendError(res, 403, 'FORBIDDEN', 'Only verified Sellers or Admins can list new products.');
      }

      const { name, brand, category, price_cents, stock_qty, badge, image_url, description, specs_json } = req.body || {};

      if (!name || !price_cents || !category) {
        return sendError(res, 400, 'VALIDATION_ERROR', 'Name, price, and category are required.');
      }

      const product = await productRepository.create({
        seller_id: user.id,
        name,
        brand: brand || 'AbiMart Pro',
        category,
        price_cents: Number(price_cents),
        stock_qty: Number(stock_qty) || 10,
        badge: badge || 'NEW',
        image_url: image_url || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80',
        description: description || 'High performance gaming equipment.',
        specs_json: typeof specs_json === 'string' ? specs_json : JSON.stringify(specs_json || {}),
      });

      return sendSuccess(res, { product }, 201);
    } catch (err: any) {
      console.error('Create product error:', err);
      return sendError(res, 500, 'CREATE_ERROR', 'Failed to create product in database.');
    }
  }

  /**
   * PUT /api/v1/products/:id (Seller or Admin)
   */
  async updateProduct(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
        return sendError(res, 403, 'FORBIDDEN', 'Only verified Sellers or Admins can modify products.');
      }

      const id = Number(req.params.id);
      const updated = await productRepository.update(id, req.body);
      if (!updated) {
        return sendError(res, 404, 'NOT_FOUND', 'Product not found.');
      }

      return sendSuccess(res, { product: updated });
    } catch (err: any) {
      return sendError(res, 500, 'UPDATE_ERROR', 'Failed to update product details.');
    }
  }

  /**
   * DELETE /api/v1/products/:id (Seller or Admin)
   */
  async deleteProduct(req: Request, res: Response) {
    try {
      const user = getUserFromToken(req);
      if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
        return sendError(res, 403, 'FORBIDDEN', 'Only verified Sellers or Admins can remove products.');
      }

      const id = Number(req.params.id);
      await productRepository.delete(id);
      return sendSuccess(res, { message: 'Product successfully removed from catalog.' });
    } catch (err: any) {
      return sendError(res, 500, 'DELETE_ERROR', 'Failed to delete product.');
    }
  }
}

export const productController = new ProductController();
