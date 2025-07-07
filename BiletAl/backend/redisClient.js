const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = redis.createClient({
  url: redisUrl
});

client.on('error', (err) => {
  console.error('Redis bağlantı hatası:', err);
});

client.connect().catch(console.error);

// Eski callback API ile uyumlu olması için aşağıdaki wrapper'ı ekliyoruz
client.get = client.get.bind(client);
client.setex = client.setEx ? (...args) => client.setEx(...args) : client.setex.bind(client);

module.exports = client; 