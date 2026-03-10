// backend/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Check if a Super Admin already exists to prevent duplicates
        const adminExists = await User.findOne({ role: 'SuperAdmin' });
        if (adminExists) {
            console.log('Super Admin already exists in the database.');
            process.exit();
        }

        // Create the master credentials
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        const superAdmin = await User.create({
            name: 'System Administrator',
            email: 'admin@sliit.lk', // SLIIT admin email
            password: hashedPassword,
            role: 'SuperAdmin'
        });

        console.log('Success! Super Admin created:');
        console.log(`Email: ${superAdmin.email}`);
        console.log(`Password: Admin@123`);
        
        process.exit();
    } catch (error) {
        console.error('Error seeding Super Admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();