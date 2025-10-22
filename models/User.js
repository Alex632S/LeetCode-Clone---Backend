import bcrypt from 'bcryptjs';
import initAdmin from '../scripts/initAdmin.js';

// Временное хранилище пользователей
let users = [];

// Инициализируем админа
initAdmin().then(admin => {
  if (admin) {
    users.push(admin);
    console.log('Admin user initialized');
  }
});

let nextUserId = 2;

// Хэширование пароля
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Проверка пароля
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Поиск пользователя по email
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Поиск пользователя по ID
const findUserById = (id) => {
  return users.find(user => user.id === id);
};

// Создание нового пользователя
const createUser = async (userData) => {
  const { username, email, password, role = 'user' } = userData;
  
  // Проверяем, существует ли пользователь
  if (findUserByEmail(email)) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await hashPassword(password);
  
  const newUser = {
    id: nextUserId++,
    username,
    email,
    passwordHash: hashedPassword,
    role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(newUser);
  return newUser;
};

// Получение пользователя без чувствительных данных
const getUserWithoutPassword = (user) => {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export default {
  users,
  findUserByEmail,
  findUserById,
  createUser,
  comparePassword,
  getUserWithoutPassword
};