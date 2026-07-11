import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let userToken: string;
let adminToken: string;
let vehicleId: string;

// ─────────────────────────────────────────────
// Helper: create and promote a user to ADMIN
// ─────────────────────────────────────────────
async function createAdmin(email: string, password: string) {
  await request(app).post('/api/auth/register').send({ email, password });
  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  return res.body.token as string;
}

beforeAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create a regular user
  await request(app)
    .post('/api/auth/register')
    .send({ email: 'user@vehicles.com', password: 'password123' });
  const userRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user@vehicles.com', password: 'password123' });
  userToken = userRes.body.token;

  // Create an admin
  adminToken = await createAdmin('admin@vehicles.com', 'adminpass123');
});

afterAll(async () => {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// ─────────────────────────────────────────────
// POST /api/vehicles (Admin)
// ─────────────────────────────────────────────
describe('POST /api/vehicles', () => {
  it('creates a vehicle when called by an admin (201)', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        make: 'Toyota',
        model: 'Camry',
        category: 'Sedan',
        price: 25000,
        quantity: 10,
        year: 2023,
        color: 'Silver',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.make).toBe('Toyota');
    vehicleId = res.body.id;
  });

  it('returns 403 when a regular user tries to create a vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 20000, quantity: 5, year: 2022 });

    expect(res.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda' }); // missing model, category, price, quantity, year

    expect(res.status).toBe(400);
  });

  it('returns 400 when price is negative', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Ford', model: 'F-150', category: 'Truck', price: -100, quantity: 3, year: 2023 });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// GET /api/vehicles
// ─────────────────────────────────────────────
describe('GET /api/vehicles', () => {
  it('returns a list of vehicles for authenticated users', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });
});

// ─────────────────────────────────────────────
// GET /api/vehicles/search
// ─────────────────────────────────────────────
describe('GET /api/vehicles/search', () => {
  beforeAll(async () => {
    // Seed additional vehicles for search tests
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 20000, quantity: 5, year: 2022 });

    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Ford', model: 'Mustang', category: 'Sports', price: 45000, quantity: 2, year: 2023 });
  });

  it('filters by make (case-insensitive)', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=toyota')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.every((v: any) => v.make.toLowerCase() === 'toyota')).toBe(true);
  });

  it('filters by category', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?category=Sports')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.every((v: any) => v.category === 'Sports')).toBe(true);
  });

  it('filters by price range', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?minPrice=15000&maxPrice=30000')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.every((v: any) => v.price >= 15000 && v.price <= 30000)).toBe(true);
  });

  it('returns empty array for no matches', async () => {
    const res = await request(app)
      .get('/api/vehicles/search?make=Lamborghini')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// PUT /api/vehicles/:id (Admin)
// ─────────────────────────────────────────────
describe('PUT /api/vehicles/:id', () => {
  it('updates a vehicle when called by an admin', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 27000 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(27000);
  });

  it('returns 403 when a regular user tries to update', async () => {
    const res = await request(app)
      .put(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 10000 });

    expect(res.status).toBe(403);
  });

  it('returns 404 for non-existent vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 10000 });

    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────
// POST /api/vehicles/:id/purchase
// ─────────────────────────────────────────────
describe('POST /api/vehicles/:id/purchase', () => {
  it('decrements stock on successful purchase', async () => {
    // Get current quantity
    const before = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);
    const prevQty = before.body.quantity;

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(prevQty - 1);
  });

  it('returns 400 when purchasing more than available stock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 9999 });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/insufficient stock/i);
  });

  it('returns 400 when vehicle quantity is 0', async () => {
    // Set quantity to 0
    await prisma.vehicle.update({ where: { id: vehicleId }, data: { quantity: 0 } });

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/insufficient stock/i);
  });
});

// ─────────────────────────────────────────────
// POST /api/vehicles/:id/restock (Admin)
// ─────────────────────────────────────────────
describe('POST /api/vehicles/:id/restock', () => {
  it('increments stock by the given quantity (Admin)', async () => {
    const before = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const prevQty = before.body.quantity;

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(prevQty + 5);
  });

  it('returns 403 when a regular user tries to restock', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });

    expect(res.status).toBe(403);
  });

  it('returns 400 when restock quantity is 0 or negative', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// DELETE /api/vehicles/:id (Admin)
// ─────────────────────────────────────────────
describe('DELETE /api/vehicles/:id', () => {
  it('returns 403 when a regular user tries to delete a vehicle', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('deletes a vehicle when called by an admin (204)', async () => {
    const res = await request(app)
      .delete(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 after deletion', async () => {
    const res = await request(app)
      .get(`/api/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
