const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Test veritabanına bağlan
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/biletal_test');
  });

  afterAll(async () => {
    // Test veritabanını temizle ve bağlantıyı kapat
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Her test öncesi kullanıcıları temizle
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.password).toBeUndefined(); // Şifre döndürülmemeli
    });

    it('should not register user with existing email', async () => {
      // Önce bir kullanıcı oluştur
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password: 'password123'
      });

      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      // Önce bir kullanıcı oluştur
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should not login with wrong password', async () => {
      // Önce bir kullanıcı oluştur
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
}); 