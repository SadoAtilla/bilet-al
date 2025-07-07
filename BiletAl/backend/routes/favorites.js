const express = require('express');
const Favorite = require('../models/Favorite');
const Flight = require('../models/Flight');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Favori uçuş işlemleri
 */

// @route   POST /api/favorites
// @desc    Uçuşu favorilere ekle
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { flightId } = req.body;

    if (!flightId) {
      return res.status(400).json({
        success: false,
        message: 'Uçuş ID zorunludur'
      });
    }

    // Uçuşun var olup olmadığını kontrol et
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Uçuş bulunamadı'
      });
    }

    // Zaten favorilerde mi kontrol et
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      flight: flightId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Bu uçuş zaten favorilerinizde'
      });
    }

    // Favorilere ekle
    const favorite = new Favorite({
      user: req.user._id,
      flight: flightId
    });

    await favorite.save();

    // Populate ile detayları getir
    await favorite.populate('flight', 'flightNumber airline departure arrival price');

    res.status(201).json({
      success: true,
      message: 'Uçuş favorilere eklendi',
      data: { favorite }
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/favorites
// @desc    Kullanıcının favori uçuşlarını getir
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const favorites = await Favorite.find({ user: req.user._id })
      .populate('flight', 'flightNumber airline departure arrival price availableSeats')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Favorite.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalFavorites: total
        }
      }
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   DELETE /api/favorites/:id
// @desc    Uçuşu favorilerden çıkar
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favori uçuş bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Uçuş favorilerden çıkarıldı'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   DELETE /api/favorites/flight/:flightId
// @desc    Uçuş ID'sine göre favorilerden çıkar
// @access  Private
router.delete('/flight/:flightId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      flight: req.params.flightId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favori uçuş bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Uçuş favorilerden çıkarıldı'
    });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/favorites/check/:flightId
// @desc    Uçuşun favorilerde olup olmadığını kontrol et
// @access  Private
router.get('/check/:flightId', auth, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      flight: req.params.flightId
    });

    res.json({
      success: true,
      data: {
        isFavorite: !!favorite,
        favoriteId: favorite ? favorite._id : null
      }
    });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 