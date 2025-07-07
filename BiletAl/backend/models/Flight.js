const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: [true, 'Uçuş numarası zorunludur'],
    unique: true
  },
  airline: {
    type: String,
    required: [true, 'Havayolu şirketi zorunludur']
  },
  airlineLogo: {
    type: String,
    default: 'default-airline.png'
  },
  departure: {
    airport: {
      type: String,
      required: [true, 'Kalkış havaalanı zorunludur']
    },
    city: {
      type: String,
      required: [true, 'Kalkış şehri zorunludur']
    },
    time: {
      type: Date,
      required: [true, 'Kalkış zamanı zorunludur']
    }
  },
  arrival: {
    airport: {
      type: String,
      required: [true, 'Varış havaalanı zorunludur']
    },
    city: {
      type: String,
      required: [true, 'Varış şehri zorunludur']
    },
    time: {
      type: Date,
      required: [true, 'Varış zamanı zorunludur']
    }
  },
  duration: {
    type: Number, // dakika cinsinden
    required: [true, 'Uçuş süresi zorunludur']
  },
  stops: {
    type: Number,
    default: 0
  },
  price: {
    economy: {
      type: Number,
      required: [true, 'Ekonomi sınıf fiyatı zorunludur']
    },
    business: {
      type: Number,
      required: [true, 'Business sınıf fiyatı zorunludur']
    },
    first: {
      type: Number,
      required: [true, 'First class fiyatı zorunludur']
    }
  },
  availableSeats: {
    economy: {
      type: Number,
      default: 180
    },
    business: {
      type: Number,
      default: 20
    },
    first: {
      type: Number,
      default: 8
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
    default: 'scheduled'
  },
  aircraft: {
    type: String,
    default: 'Boeing 737'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Uçuş süresini otomatik hesaplama
flightSchema.pre('save', function(next) {
  if (this.departure.time && this.arrival.time) {
    const duration = Math.round((this.arrival.time - this.departure.time) / (1000 * 60));
    this.duration = duration;
  }
  next();
});

module.exports = mongoose.model('Flight', flightSchema); 