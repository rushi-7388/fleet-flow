import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Require at least one of the given roles.
 * Use after authMiddleware.
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userId || !req.userRole) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.userRole)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        required: allowedRoles,
      });
      return;
    }

    next();
  };
}

// Convenience middleware: admin only
export const adminOnly = requireRoles('ADMIN');

// Dispatcher and above (dispatcher, manager, admin)
export const dispatcherOrAbove = requireRoles('ADMIN', 'MANAGER', 'DISPATCHER');

// Manager and admin
export const managerOrAbove = requireRoles('ADMIN', 'MANAGER');
