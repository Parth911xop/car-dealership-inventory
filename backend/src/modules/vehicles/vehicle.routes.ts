import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import {
  listVehicles,
  search,
  getOne,
  create,
  update,
  remove,
  purchase,
  restock,
} from './vehicle.controller';

const router = Router();

// Public routes
router.get('/', authenticate, listVehicles);
router.get('/search', authenticate, search);
router.get('/:id', authenticate, getOne);

// Authenticated user routes
router.post('/:id/purchase', authenticate, purchase);

// Admin-only routes
router.post('/', authenticate, requireAdmin, create);
router.put('/:id', authenticate, requireAdmin, update);
router.delete('/:id', authenticate, requireAdmin, remove);
router.post('/:id/restock', authenticate, requireAdmin, restock);

export default router;
