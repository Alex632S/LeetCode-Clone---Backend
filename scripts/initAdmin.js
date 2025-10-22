import bcrypt from 'bcryptjs';

const initAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      id: 1,
      username: 'admin',
      email: 'admin@leetcode.com', 
      passwordHash: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@leetcode.com');
    console.log('Password: admin123');
    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  }
};

// Запускаем если файл вызван напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  initAdmin();
}

export default initAdmin;