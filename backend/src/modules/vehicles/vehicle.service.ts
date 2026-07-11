import prisma from '../../config/db';
import { createError } from '../../middleware/errorHandler';

export interface VehicleCreateInput {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year: number;
  color?: string;
  mileage?: number;
}

export async function createVehicle(data: VehicleCreateInput) {
  if (!data.make || !data.model || !data.category) {
    throw createError('make, model, and category are required', 400);
  }
  if (data.price == null || data.price < 0) {
    throw createError('price must be a non-negative number', 400);
  }
  if (data.quantity == null || data.quantity < 0) {
    throw createError('quantity must be a non-negative integer', 400);
  }
  if (!data.year || data.year < 1886 || data.year > new Date().getFullYear() + 2) {
    throw createError('year is invalid', 400);
  }

  return prisma.vehicle.create({ data });
}

export async function getAllVehicles() {
  return prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function searchVehicles(filters: {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const { make, model, category, minPrice, maxPrice } = filters;

  return prisma.vehicle.findMany({
    where: {
      ...(make && { make: { contains: make, mode: 'insensitive' } }),
      ...(model && { model: { contains: model, mode: 'insensitive' } }),
      ...(category && { category: { contains: category, mode: 'insensitive' } }),
      price: {
        ...(minPrice != null && { gte: minPrice }),
        ...(maxPrice != null && { lte: maxPrice }),
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVehicleById(id: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw createError('Vehicle not found', 404);
  return vehicle;
}

export async function updateVehicle(id: string, data: Partial<VehicleCreateInput>) {
  await getVehicleById(id); // throws 404 if not found
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: string) {
  await getVehicleById(id); // throws 404 if not found
  return prisma.vehicle.delete({ where: { id } });
}

export async function purchaseVehicle(id: string, quantity: number = 1) {
  const vehicle = await getVehicleById(id);

  if (vehicle.quantity < quantity) {
    throw createError('Insufficient stock', 400);
  }

  return prisma.vehicle.update({
    where: { id },
    data: { quantity: vehicle.quantity - quantity },
  });
}

export async function restockVehicle(id: string, quantity: number) {
  if (!quantity || quantity <= 0) {
    throw createError('Restock quantity must be a positive integer', 400);
  }
  await getVehicleById(id); // throws 404 if not found

  return prisma.vehicle.update({
    where: { id },
    data: { quantity: { increment: quantity } },
  });
}
