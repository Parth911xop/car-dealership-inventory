import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth';
import {
  createVehicle,
  getAllVehicles,
  searchVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
} from './vehicle.service';

export async function listVehicles(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicles = await getAllVehicles();
    res.json(vehicles);
  } catch (err) { next(err); }
}

export async function search(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query as Record<string, string>;
    const vehicles = await searchVehicles({
      make,
      model,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    });
    res.json(vehicles);
  } catch (err) { next(err); }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicle = await getVehicleById(req.params.id);
    res.json(vehicle);
  } catch (err) { next(err); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicle = await createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (err) { next(err); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicle = await updateVehicle(req.params.id, req.body);
    res.json(vehicle);
  } catch (err) { next(err); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteVehicle(req.params.id);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function purchase(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const quantity = req.body.quantity ?? 1;
    const vehicle = await purchaseVehicle(req.params.id, quantity);
    res.json(vehicle);
  } catch (err) { next(err); }
}

export async function restock(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicle = await restockVehicle(req.params.id, req.body.quantity);
    res.json(vehicle);
  } catch (err) { next(err); }
}
