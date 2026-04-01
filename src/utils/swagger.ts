import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: 'Production-quality backend for a Finance Dashboard system',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Ensure we look in dist in production and src in development
  apis: [
    process.env.NODE_ENV === 'production' ? './dist/routes/*.js' : './src/routes/*.ts',
    process.env.NODE_ENV === 'production' ? './dist/models/*.js' : './src/models/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
