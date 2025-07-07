require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Flight = require('./models/Flight');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Favorite = require('./models/Favorite');

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/biletal')
  .then(() => {
    console.log('MongoDB bağlantısı başarılı');
    seedDatabase();
  })
  .catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1);
  });

// Kullanıcılar
const users = [
  {
    name: 'Demo Kullanıcı 1',
    email: 'demo1@biletal.com',
    password: 'demo123',
    phone: '+90 555 123 4567',
    birthDate: new Date('1990-05-15'),
    gender: 'Erkek',
    address: {
      street: 'Atatürk Cad. No:123', city: 'İstanbul', country: 'Türkiye', zipCode: '34000'
    },
    preferences: { language: 'tr', notifications: { email: true, sms: false, push: true } },
    passengers: [
      { name: 'Ali', surname: 'Yılmaz', birthDate: new Date('1995-01-01'), passportNumber: 'A1234567', isDefault: true },
      { name: 'Ayşe', surname: 'Yılmaz', birthDate: new Date('1997-02-02'), passportNumber: 'B7654321', isDefault: false }
    ]
  },
  {
    name: 'Demo Kullanıcı 2',
    email: 'demo2@biletal.com',
    password: 'demo123',
    phone: '+90 555 987 6543',
    birthDate: new Date('1985-03-10'),
    gender: 'Kadın',
    address: {
      street: 'Cumhuriyet Cad. No:1', city: 'Ankara', country: 'Türkiye', zipCode: '06000'
    },
    preferences: { language: 'en', notifications: { email: true, sms: true, push: true } },
    passengers: [
      { name: 'Mehmet', surname: 'Kaya', birthDate: new Date('1980-05-05'), passportNumber: 'C9876543', isDefault: true }
    ]
  }
];

// Uçuşlar (geçmiş, gelecek, farklı şehir ve havayolları)
const now = new Date();
const flights = [
  // Gelecek uçuşlar
  {
    flightNumber: 'TK100', airline: 'Türk Hava Yolları', airlineLogo: 'thy.png',
    departure: { airport: 'IST', city: 'İstanbul', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 10, 0) },
    arrival: { airport: 'JFK', city: 'New York', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 18, 0) },
    duration: 480, stops: 0,
    price: { economy: 5000, business: 12000, first: 20000 },
    availableSeats: { economy: 100, business: 10, first: 2 },
    status: 'scheduled', aircraft: 'Boeing 777'
  },
  {
    flightNumber: 'PC200', airline: 'Pegasus', airlineLogo: 'pegasus.png',
    departure: { airport: 'SAW', city: 'İstanbul', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 8, 0) },
    arrival: { airport: 'AMS', city: 'Amsterdam', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 12, 0) },
    duration: 240, stops: 0,
    price: { economy: 2500, business: 7000, first: 12000 },
    availableSeats: { economy: 80, business: 8, first: 1 },
    status: 'scheduled', aircraft: 'Airbus A320'
  },
  // Geçmiş uçuşlar
  {
    flightNumber: 'TK300', airline: 'Türk Hava Yolları', airlineLogo: 'thy.png',
    departure: { airport: 'IST', city: 'İstanbul', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 9, 0) },
    arrival: { airport: 'CDG', city: 'Paris', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 12, 0) },
    duration: 180, stops: 0,
    price: { economy: 3000, business: 9000, first: 15000 },
    availableSeats: { economy: 0, business: 0, first: 0 },
    status: 'completed', aircraft: 'Boeing 737'
  },
  {
    flightNumber: 'PC400', airline: 'Pegasus', airlineLogo: 'pegasus.png',
    departure: { airport: 'ADB', city: 'İzmir', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 7, 0) },
    arrival: { airport: 'ESB', city: 'Ankara', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 8, 30) },
    duration: 90, stops: 0,
    price: { economy: 800, business: 2500, first: 4000 },
    availableSeats: { economy: 0, business: 0, first: 0 },
    status: 'completed', aircraft: 'Airbus A321'
  },
  // Farklı havayolu ve şehirler
  {
    flightNumber: 'SN500', airline: 'SunExpress', airlineLogo: 'sunexpress.png',
    departure: { airport: 'AYT', city: 'Antalya', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0) },
    arrival: { airport: 'FRA', city: 'Frankfurt', time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 18, 0) },
    duration: 180, stops: 0,
    price: { economy: 1800, business: 5000, first: 9000 },
    availableSeats: { economy: 50, business: 5, first: 1 },
    status: 'scheduled', aircraft: 'Boeing 737'
  }
];

// Favori ve rezervasyon senaryoları için uçuşlar ve kullanıcılar eklendikten sonra referanslar alınacak

async function seedDatabase() {
  try {
    console.log('Veritabanı temizleniyor...');
    await Booking.deleteMany({});
    await Favorite.deleteMany({});
    await Flight.deleteMany({});
    await User.deleteMany({});

    console.log('Uçuşlar ekleniyor...');
    const createdFlights = await Flight.insertMany(flights);

    console.log('Kullanıcılar ekleniyor...');
    const createdUsers = [];
    for (const user of users) {
      const u = new User(user);
      await u.save();
      createdUsers.push(u);
    }

    // Favoriler: Demo Kullanıcı 1 iki uçuşu favori, Demo Kullanıcı 2 bir uçuş favori
    const demoUser1 = createdUsers[0];
    const demoUser2 = createdUsers[1];
    const flight1 = createdFlights[0]; // TK100
    const flight2 = createdFlights[1]; // PC200
    const flight3 = createdFlights[2]; // TK300 (geçmiş)

    await Favorite.create([
      { user: demoUser1._id, flight: flight1._id },
      { user: demoUser1._id, flight: flight2._id },
      { user: demoUser2._id, flight: flight1._id }
    ]);

    // Rezervasyonlar: Demo Kullanıcı 1 gelecek uçuşa, Demo Kullanıcı 2 geçmiş uçuşa, Test Kullanıcı iptal edilmiş
    await Booking.create([
      {
        user: demoUser1._id,
        flight: flight1._id,
        passengers: [
          { name: 'Ali', surname: 'Yılmaz', birthDate: new Date('1995-01-01'), passportNumber: 'A1234567' }
        ],
        class: 'economy',
        totalPrice: 5000,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'credit_card',
        bookingNumber: 'BK10001'
      },
      {
        user: demoUser2._id,
        flight: flight3._id,
        passengers: [
          { name: 'Mehmet', surname: 'Kaya', birthDate: new Date('1980-05-05'), passportNumber: 'C9876543' }
        ],
        class: 'business',
        totalPrice: 9000,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'bank_transfer',
        bookingNumber: 'BK20001'
      }
    ]);

    console.log('Favoriler ve rezervasyonlar eklendi!');
    console.log('Seed işlemi tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('Seed hatası:', error);
    process.exit(1);
  }
}

// seedDatabase(); // <-- Artık otomatik çağrılmıyor, bağlantıdan sonra çağrılıyor 