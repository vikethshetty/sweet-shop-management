import request from 'supertest';
import app from '../src/app';
import db from '../src/config/database';

describe('Sweets API', () => {
  let authToken: string;
  let adminToken: string;

  beforeEach(async () => {
    await db.query('DELETE FROM sweets');
    await db.query('DELETE FROM users');

    // Register and login a regular user
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@example.com', password: 'password123' });

    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password123' });

    authToken = userResponse.body.token;

    // Create admin user directly in database
    await db.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3)',
      ['admin@example.com', '$2a$12$hashedpassword', 'admin']
    );

    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    adminToken = adminResponse.body.token;

    // Add test sweets
    await db.query(
      'INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)',
      ['Chocolate Bar', 'Chocolate', 2.00, 25]
    );
  });

  describe('GET /api/sweets', () => {
    it('should return all sweets', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Chocolate Bar');
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/api/sweets')
        .expect(401);
    });
  });

  describe('POST /api/sweets', () => {
    it('should create a new sweet as admin', async () => {
      const sweetData = {
        name: 'Gummy Bears',
        category: 'Gummies',
        price: 1.50,
        quantity: 100
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(sweetData)
        .expect(201);

      expect(response.body.name).toBe(sweetData.name);
      expect(response.body.category).toBe(sweetData.category);
    });

    it('should not allow non-admin to create sweets', async () => {
      const sweetData = {
        name: 'Gummy Bears',
        category: 'Gummies',
        price: 1.50,
        quantity: 100
      };

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sweetData)
        .expect(403);
    });
  });
});