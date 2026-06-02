// lib/swagger.js
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api', // This tells Swagger to scan all your routes in image_4ee1c8.png
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'DK CRM API',
        version: '1.0.0',
        description: 'API Documentation for Boards, Cards, Clients, and Projects',
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [],
    },
  });
  return spec;
};