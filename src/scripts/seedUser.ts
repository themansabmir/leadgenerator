/**
 * Seed User Script
 * Creates an initial admin user for testing the authentication system
 */

import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';

/**
 * Default admin user credentials
 */
const ADMIN_USER = {
  email: 'admin@leadharvester.com',
  password: 'admin123456' // Change this in production
};

/**
 * Seeds the database with an initial admin user
 */
async function seedUser() {
  try {
    console.log('🌱 Seeding initial admin user...');

    // Connect to database
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: ADMIN_USER.email });
    if (existingUser) {
      console.log('ℹ️  Admin user already exists');
      console.log(`📧 Email: ${ADMIN_USER.email}`);
      console.log(`🔑 Password: ${ADMIN_USER.password}`);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, saltRounds);

    // Create admin user
    const adminUser = new User({
      email: ADMIN_USER.email,
      password: hashedPassword
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${ADMIN_USER.email}`);
    console.log(`🔑 Password: ${ADMIN_USER.password}`);
    console.log('');
    console.log('🚀 You can now login at http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error seeding user:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedUser();
