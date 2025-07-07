const express = require('express');
const Flight = require('../models/Flight');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Destinations
 *   description: Şehir ve destinasyon işlemleri
 */

// @route   GET /api/destinations
// @desc    Tüm destinasyonları getir
// @access  Public
router.get('/', async (req, res) => {
  try {
    const destinations = [
      {
        city: 'İstanbul',
        country: 'Türkiye',
        code: 'IST',
        image: 'istanbul.jpeg',
        description: 'Doğu ile batının buluştuğu şehir',
        popularRoutes: ['New York', 'Paris', 'Londra', 'Dubai']
      },
      {
        city: 'New York',
        country: 'ABD',
        code: 'JFK',
        image: 'newyork.jpeg',
        description: 'Dünyanın finans merkezi',
        popularRoutes: ['İstanbul', 'Londra', 'Paris', 'Tokyo']
      },
      {
        city: 'Paris',
        country: 'Fransa',
        code: 'CDG',
        image: 'paris.jpeg',
        description: 'Aşkın ve sanatın şehri',
        popularRoutes: ['İstanbul', 'Londra', 'New York', 'Roma']
      },
      {
        city: 'Londra',
        country: 'İngiltere',
        code: 'LHR',
        image: 'london.jpeg',
        description: 'Tarih ve modernliğin buluştuğu şehir',
        popularRoutes: ['İstanbul', 'Paris', 'New York', 'Dubai']
      },
      {
        city: 'Tokyo',
        country: 'Japonya',
        code: 'NRT',
        image: 'tokyo.jpeg',
        description: 'Teknoloji ve geleneğin şehri',
        popularRoutes: ['İstanbul', 'New York', 'Seul', 'Bangkok']
      },
      {
        city: 'Dubai',
        country: 'BAE',
        code: 'DXB',
        image: 'dubai.jpeg',
        description: 'Lüks ve ihtişamın şehri',
        popularRoutes: ['İstanbul', 'Londra', 'Paris', 'Mumbai']
      }
    ];

    res.json({
      success: true,
      data: {
        destinations
      }
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/destinations/:city
// @desc    Belirli bir şehrin detaylarını getir
// @access  Public
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    // Şehirden uçuşları bul
    const flights = await Flight.find({
      $or: [
        { 'departure.city': { $regex: city, $options: 'i' } },
        { 'arrival.city': { $regex: city, $options: 'i' } }
      ]
    }).populate('airline');

    const destinationInfo = {
      city: city,
      flights: flights,
      totalFlights: flights.length,
      averagePrice: flights.length > 0 ? 
        flights.reduce((sum, flight) => sum + flight.price.economy, 0) / flights.length : 0
    };

    res.json({
      success: true,
      data: {
        destination: destinationInfo
      }
    });
  } catch (error) {
    console.error('Get destination details error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/destinations/search/suggestions
// @desc    Şehir arama önerilerini getir
// @access  Public
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    const cities = [
      'İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa',
      'New York', 'Los Angeles', 'Chicago', 'Miami', 'Boston',
      'Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux',
      'Londra', 'Manchester', 'Birmingham', 'Liverpool', 'Edinburgh',
      'Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya',
      'Dubai', 'Abu Dhabi', 'Sharjah', 'Riyadh', 'Jeddah'
    ];

    const suggestions = cities
      .filter(city => city.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 10)
      .map(city => ({
        city: city,
        type: 'city'
      }));

    res.json({
      success: true,
      data: {
        suggestions
      }
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/destinations/popular
// @desc    Popüler destinasyonları getir
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const popularDestinations = [
      {
        city: 'New York',
        country: 'ABD',
        image: 'newyork.jpeg',
        flights: 12,
        averagePrice: 2500
      },
      {
        city: 'Paris',
        country: 'Fransa',
        image: 'paris.jpeg',
        flights: 8,
        averagePrice: 1800
      },
      {
        city: 'Londra',
        country: 'İngiltere',
        image: 'london.jpeg',
        flights: 10,
        averagePrice: 1600
      },
      {
        city: 'Tokyo',
        country: 'Japonya',
        image: 'tokyo.jpeg',
        flights: 6,
        averagePrice: 3200
      },
      {
        city: 'Dubai',
        country: 'BAE',
        image: 'dubai.jpeg',
        flights: 15,
        averagePrice: 2200
      },
      {
        city: 'Amsterdam',
        country: 'Hollanda',
        image: 'amsterdam.jpeg',
        flights: 7,
        averagePrice: 1400
      }
    ];

    res.json({
      success: true,
      data: {
        popularDestinations
      }
    });
  } catch (error) {
    console.error('Get popular destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 