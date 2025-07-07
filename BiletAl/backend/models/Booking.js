const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı zorunludur']
  },
  flight: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight',
    required: [true, 'Uçuş zorunludur']
  },
  passengers: [{
    name: {
      type: String,
      required: [true, 'Yolcu adı zorunludur']
    },
    surname: {
      type: String,
      required: [true, 'Yolcu soyadı zorunludur']
    },
    birthDate: {
      type: Date,
      required: [true, 'Doğum tarihi zorunludur']
    },
    passportNumber: {
      type: String,
      required: [true, 'Pasaport numarası zorunludur']
    },
    seatNumber: String
  }],
  class: {
    type: String,
    enum: ['economy', 'business', 'first'],
    required: [true, 'Sınıf seçimi zorunludur']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Toplam fiyat zorunludur']
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending', 'cancelled', 'completed', 'listed_for_sale'],
    default: 'confirmed'
  },
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal'],
    default: 'credit_card'
  },
  paymentDetails: {
    transactionId: String,
    amount: Number,
    currency: String,
    paymentMethod: String,
    status: String,
    timestamp: Date
  },
  refundDetails: {
    refundId: String,
    amount: Number,
    reason: String,
    status: String,
    estimatedTime: String,
    timestamp: Date
  },
  specialRequests: {
    type: String,
    trim: true
  },
  salePrice: {
    type: Number
  },
  listedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Booking number otomatik oluşturma
bookingSchema.pre('save', function(next) {
  if (!this.bookingNumber) {
    this.bookingNumber = 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', bookingSchema); 