const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BiletAl API',
      version: '1.0.0',
      description: 'BiletAl Uçak Bileti Rezervasyon Sistemi API Dokümantasyonu',
      contact: {
        name: 'BiletAl Team',
        email: 'info@biletal.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js'] // API route dosyalarının yolu
};

const specs = swaggerJsdoc(options);

module.exports = specs; 