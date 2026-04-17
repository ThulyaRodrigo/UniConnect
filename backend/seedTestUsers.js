const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("./models/User");
const Society = require("./models/Society");
const Event = require("./models/Event");

const seedTestUsers = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/event_management_db",
    );
    console.log("MongoDB Connected for E2E Test Seeding...");

    // Clean previous test data if rerun
    await User.deleteMany({
      email: {
        $in: [
          "it34567890@my.sliit.lk",
          "it12345678@my.sliit.lk",
          "it45678900@my.sliit.lk",
          "it23456789@my.sliit.lk",
        ],
      },
    });
    await Society.deleteMany({ name: "FOSS Community" });
    await Event.deleteMany({ title: "React Native Appathon" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // 1. Create a dummy test society
    const society = await Society.create({
      name: "FOSS Community",
      category: "Technology",
      description: "Free and Open Source Software",
    });

    // 2. Create Thulya (Society Admin - Secretary)
    const thulya = await User.create({
      name: "Thulya Rodrigo",
      email: "it12345678@my.sliit.lk",
      password: hashedPassword,
      role: "SocietyAdmin",
      phone: "0712345678",
      adminSocieties: [society._id],
    });

    // Update society board
    society.board.push({
      user: thulya._id,
      position: "Secretary",
    });
    await society.save();

    // 3. Create Navidi (Super Admin)
    const navidi = await User.create({
      name: "Navidi",
      email: "it23456789@my.sliit.lk",
      password: hashedPassword,
      role: "SuperAdmin",
      phone: "0712345678",
    });

    // 4. Create Malindu (Student)
    const malindu = await User.create({
      name: "Malindu",
      email: "it34567890@my.sliit.lk",
      password: hashedPassword,
      role: "Student",
      phone: "0712345678",
    });

    // 5. Create Kalana (Student)
    const kalana = await User.create({
      name: "Kalana",
      email: "it45678900@my.sliit.lk",
      password: hashedPassword,
      role: "Student",
      phone: "0712345678",
    });

    // Create Dummy Buyer for seeded bookings
    const dummyBuyer = await User.create({
      name: "Dummy Buyer",
      email: "dummy@my.sliit.lk",
      password: hashedPassword,
      role: "Student",
      phone: "0779999999"
    });

    // 6. Create Event required by tests
    const testEvent = await Event.create({
      title: "React Native Appathon",
      date: "2026-12-15", // Ensure date is far in future
      time: "09:00 AM",
      category: "Technology",
      location: "Main Auditorium",
      price: 1500,
      capacity: 200,
      description: "A 12-hour hackathon to build the next big React Native app.",
      society: society._id,
      createdBy: thulya._id,
      image: "https://res.cloudinary.com/dv7m7hbx2/image/upload/v1740924905/events/z3dytb2e7vxy95goxx9v.jpg"
    });

    // 7. Seed Explicit Bookings to Ensure Isolated Parallel E2E Testing
    const Booking = require('./models/Booking');

    // Booking 1: Pending (For Thulya to Reject in Test 2)
    const booking1 = await Booking.create({
      event: testEvent._id,
      primaryBuyer: dummyBuyer._id,
      ticketCount: 1,
      totalAmount: 1500,
      paymentSlipUrl: "https://fake.url.com/slip.jpg",
      status: "Pending Verification",
      attendees: [
        {
          studentId: dummyBuyer.email,
          name: dummyBuyer.name,
          transportRoute: null
        }
      ]
    });

    // Booking 2: Confirmed Group Booking (For Kalana to View/Download in Test 3)
    const booking2 = await Booking.create({
      event: testEvent._id,
      primaryBuyer: dummyBuyer._id,
      ticketCount: 2,
      totalAmount: 3000,
      paymentSlipUrl: "https://fake.url.com/slip2.jpg",
      status: "Confirmed",
      attendees: [
        {
          studentId: dummyBuyer.email,
          name: dummyBuyer.name,
          transportRoute: null
        },
        {
          studentId: kalana.email,
          name: kalana.name,
          transportRoute: null
        }
      ]
    });

    console.log("Seeded Malindu, Thulya, Kalana, Navidi, Society, Event, and Bookings successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding test data:", error);
    process.exit(1);
  }
};

seedTestUsers();
