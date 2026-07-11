import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('creates a new user and returns 201 without password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'alice@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('email', 'alice@test.com');
    expect(res.body).toHaveProperty('role', 'USER');
    expect(res.body).not.toHaveProperty('password');
  });

  it('rejects duplicate email with 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@test.com', password: 'password123' });

    expect(res.status).toBe(409);
    expect(res.body.error.message).toMatch(/already in use/i);
  });

  it('rejects invalid email format with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/invalid email/i);
  });

  it('rejects short password with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'short@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/password/i);
  });

  it('rejects missing email with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'login@test.com', password: 'password123' });
  });

  it('returns a JWT token and user info on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'login@test.com');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toMatch(/invalid credentials/i);
  });

  it('returns 401 on non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'password123' });

    expect(res.status).toBe(401);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@test.com' });

    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────
// Auth middleware tests via a protected route
// ─────────────────────────────────────────────
describe('Auth middleware', () => {
  it('returns 401 when no token is provided to a protected route', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('returns 401 when an invalid/malformed token is provided', async () => {
    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', 'Bearer this.is.not.valid');

    expect(res.status).toBe(401);
  });

  it('returns 403 when a non-admin user hits an admin-only route', async () => {
    // Register regular user and get their token
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'regular@test.com', password: 'password123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'regular@test.com', password: 'password123' });

    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 5, year: 2023 });

    expect(res.status).toBe(403);
  });
});
