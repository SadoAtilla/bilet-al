const express = require('express');
const Flight = require('../models/Flight');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Ana sayfa ve öne çıkanlar
 */

// @route   GET /api/home/popular-routes
// @desc    Popüler rotaları getir
// @access  Public
router.get('/popular-routes', async (req, res) => {
  try {
    const popularRoutes = [
      {
        from: 'İstanbul',
        to: 'New York',
        price: 2500,
        airline: 'Türk Hava Yolları',
        logo: 'thy.png'
      },
      {
        from: 'İstanbul',
        to: 'Paris',
        price: 1800,
        airline: 'Türk Hava Yolları',
        logo: 'thy.png'
      },
      {
        from: 'İstanbul',
        to: 'Londra',
        price: 1600,
        airline: 'Pegasus',
        logo: 'pegasus.png'
      },
      {
        from: 'Ankara',
        to: 'Amsterdam',
        price: 1400,
        airline: 'Pegasus',
        logo: 'pegasus.png'
      }
    ];

    res.json({
      success: true,
      data: {
        popularRoutes
      }
    });
  } catch (error) {
    console.error('Popular routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/home/featured-flights
// @desc    Öne çıkan uçuşları getir
// @access  Public
router.get('/featured-flights', async (req, res) => {
  try {
    const featuredFlights = await Flight.find({ status: 'scheduled' })
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: {
        featuredFlights
      }
    });
  } catch (error) {
    console.error('Featured flights error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/home/stats
// @desc    Ana sayfa istatistiklerini getir
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalFlights: await Flight.countDocuments(),
      totalDestinations: await Flight.distinct('arrival.city').countDocuments(),
      totalAirlines: await Flight.distinct('airline').countDocuments(),
      averagePrice: 1850
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/home/destinations
// @desc    Popüler destinasyonları getir
// @access  Public
router.get('/destinations', async (req, res) => {
  try {
    const destinations = [
      {
        city: 'New York',
        country: 'ABD',
        image: 'newyork.jpeg',
        flights: 12
      },
      {
        city: 'Paris',
        country: 'Fransa',
        image: 'paris.jpeg',
        flights: 8
      },
      {
        city: 'Tokyo',
        country: 'Japonya',
        image: 'tokyo.jpeg',
        flights: 6
      },
      {
        city: 'Londra',
        country: 'İngiltere',
        image: 'london.jpeg',
        flights: 10
      }
    ];

    res.json({
      success: true,
      data: {
        destinations
      }
    });
  } catch (error) {
    console.error('Destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 