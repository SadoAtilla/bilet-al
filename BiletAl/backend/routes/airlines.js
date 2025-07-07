const express = require('express');
const Flight = require('../models/Flight');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Airlines
 *   description: Havayolu işlemleri
 */

// @route   GET /api/airlines
// @desc    Tüm havayolu şirketlerini getir
// @access  Public
router.get('/', async (req, res) => {
  try {
    const airlines = [
      {
        name: 'Türk Hava Yolları',
        code: 'TK',
        logo: 'thy.png',
        country: 'Türkiye',
        description: 'Türkiye\'nin bayrak taşıyıcısı',
        fleet: 350,
        destinations: 300,
        rating: 4.5,
        founded: 1933
      },
      {
        name: 'Pegasus',
        code: 'PC',
        logo: 'pegasus.png',
        country: 'Türkiye',
        description: 'Düşük maliyetli havayolu',
        fleet: 95,
        destinations: 120,
        rating: 4.2,
        founded: 1990
      },
      {
        name: 'SunExpress',
        code: 'XQ',
        logo: 'sunexpress.png',
        country: 'Türkiye',
        description: 'Türk-Alman ortak havayolu',
        fleet: 45,
        destinations: 80,
        rating: 4.0,
        founded: 1989
      },
      {
        name: 'Lufthansa',
        code: 'LH',
        logo: 'lufthansa.png',
        country: 'Almanya',
        description: 'Almanya\'nın bayrak taşıyıcısı',
        fleet: 280,
        destinations: 220,
        rating: 4.3,
        founded: 1953
      },
      {
        name: 'Air France',
        code: 'AF',
        logo: 'airfrance.png',
        country: 'Fransa',
        description: 'Fransa\'nın bayrak taşıyıcısı',
        fleet: 220,
        destinations: 200,
        rating: 4.1,
        founded: 1933
      },
      {
        name: 'British Airways',
        code: 'BA',
        logo: 'britishairways.png',
        country: 'İngiltere',
        description: 'İngiltere\'nin bayrak taşıyıcısı',
        fleet: 250,
        destinations: 180,
        rating: 4.4,
        founded: 1974
      }
    ];

    res.json({
      success: true,
      data: {
        airlines
      }
    });
  } catch (error) {
    console.error('Get airlines error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/airlines/:code
// @desc    Belirli bir havayolu şirketinin detaylarını getir
// @access  Public
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Havayolu şirketinin uçuşlarını bul
    const flights = await Flight.find({
      'flightNumber': { $regex: `^${code}`, $options: 'i' }
    });

    const airlineInfo = {
      code: code,
      flights: flights,
      totalFlights: flights.length,
      averagePrice: flights.length > 0 ? 
        flights.reduce((sum, flight) => sum + flight.price.economy, 0) / flights.length : 0,
      routes: [...new Set(flights.map(f => `${f.departure.city} - ${f.arrival.city}`))]
    };

    res.json({
      success: true,
      data: {
        airline: airlineInfo
      }
    });
  } catch (error) {
    console.error('Get airline details error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/airlines/:code/flights
// @desc    Belirli bir havayolu şirketinin uçuşlarını getir
// @access  Public
router.get('/:code/flights', async (req, res) => {
  try {
    const { code } = req.params;
    const { from, to, date } = req.query;
    
    let query = {
      'flightNumber': { $regex: `^${code}`, $options: 'i' }
    };

    if (from) {
      query['departure.city'] = { $regex: from, $options: 'i' };
    }

    if (to) {
      query['arrival.city'] = { $regex: to, $options: 'i' };
    }

    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query['departure.time'] = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const flights = await Flight.find(query).sort({ 'departure.time': 1 });

    res.json({
      success: true,
      data: {
        flights
      }
    });
  } catch (error) {
    console.error('Get airline flights error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/airlines/popular
// @desc    Popüler havayolu şirketlerini getir
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const popularAirlines = [
      {
        name: 'Türk Hava Yolları',
        code: 'TK',
        logo: 'thy.png',
        flights: 45,
        averageRating: 4.5
      },
      {
        name: 'Pegasus',
        code: 'PC',
        logo: 'pegasus.png',
        flights: 32,
        averageRating: 4.2
      },
      {
        name: 'Lufthansa',
        code: 'LH',
        logo: 'lufthansa.png',
        flights: 28,
        averageRating: 4.3
      },
      {
        name: 'Air France',
        code: 'AF',
        logo: 'airfrance.png',
        flights: 25,
        averageRating: 4.1
      }
    ];

    res.json({
      success: true,
      data: {
        popularAirlines
      }
    });
  } catch (error) {
    console.error('Get popular airlines error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/airlines/search
// @desc    Havayolu şirketi arama
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          airlines: []
        }
      });
    }

    const allAirlines = [
      'Türk Hava Yolları', 'Pegasus', 'SunExpress', 'Lufthansa',
      'Air France', 'British Airways', 'Emirates', 'Qatar Airways',
      'KLM', 'Swiss', 'Austrian Airlines', 'SAS'
    ];

    const filteredAirlines = allAirlines
      .filter(airline => airline.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        airlines: filteredAirlines
      }
    });
  } catch (error) {
    console.error('Search airlines error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 