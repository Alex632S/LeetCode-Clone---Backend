FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем папку для uploads
RUN mkdir -p uploads

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]