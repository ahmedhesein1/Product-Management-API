import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/rbac';

describe('Middleware Unit Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('Authentication Middleware', () => {
    it('should call next() with valid admin role', () => {
      mockRequest.headers = { 'x-user-role': 'admin' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.userRole).toBe('admin');
    });

    it('should call next() with valid user role', () => {
      mockRequest.headers = { 'x-user-role': 'user' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.userRole).toBe('user');
    });

    it('should return 401 when role header is missing', () => {
      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'UNAUTHORIZED',
          }),
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid role', () => {
      mockRequest.headers = { 'x-user-role': 'invalid' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should normalize role to lowercase', () => {
      mockRequest.headers = { 'x-user-role': 'ADMIN' };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.userRole).toBe('admin');
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('RBAC Middleware', () => {
    it('should call next() when user is admin', () => {
      mockRequest.userRole = 'admin';

      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 403 when user is not admin', () => {
      mockRequest.userRole = 'user';

      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'FORBIDDEN',
          }),
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 when userRole is undefined', () => {
      requireAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
