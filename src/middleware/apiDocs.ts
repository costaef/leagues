import { Router } from 'express';
import swaggerUI from 'swagger-ui-express';
import openApiDoc from '../config/openApiDocument.json';

export const handleApiDocs = (router: Router) =>
  router.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openApiDoc));
