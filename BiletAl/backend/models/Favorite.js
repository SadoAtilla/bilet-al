const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Aynı kullanıcı aynı uçuşu birden fazla kez favorilere ekleyemez
favoriteSchema.index({ user: 1, flight: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema); 