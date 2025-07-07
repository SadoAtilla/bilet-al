// Test setup dosyası
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/biletal_test';
 
// Test timeout'u artır
jest.setTimeout(30000); 