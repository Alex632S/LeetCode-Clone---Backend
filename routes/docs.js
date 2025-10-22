import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const router = express.Router();

// Загружаем Swagger спецификацию
const swaggerDocument = YAML.load(path.join(process.cwd(), 'docs/swagger.yaml'));

// Настройки Swagger UI
const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "LeetCode Clone API Documentation",
  customfavIcon: "/assets/favicon.ico"
};

// Эндпоинт для Swagger UI
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, options));

// Эндпоинт для raw Swagger JSON
router.get('/json', (req, res) => {
  res.json(swaggerDocument);
});

export default router;