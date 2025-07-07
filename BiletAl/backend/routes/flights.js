const express = require('express');
const Flight = require('../models/Flight');
const auth = require('../middleware/auth');
const redisClient = require('../redisClient');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Flights
 *   description: Uçuş arama ve listeleme işlemleri
 */

/**
 * @swagger
 * /api/flights:
 *   get:
 *     summary: Uçuşları listele (filtreleme ile)
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Kalkış şehri
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Varış şehri
 *       - in: query
 *         name: departureDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Kalkış tarihi (YYYY-MM-DD)
 *       - in: query
 *         name: returnDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Dönüş tarihi (YYYY-MM-DD)
 *       - in: query
 *         name: passengers
 *         schema:
 *           type: integer
 *         description: Yolcu sayısı
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *         description: Uçuş sınıfı (economy/business)
 *       - in: query
 *         name: airline
 *         schema:
 *           type: string
 *         description: Havayolu
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: integer
 *         description: Minimum fiyat
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: integer
 *         description: Maksimum fiyat
 *       - in: query
 *         name: stops
 *         schema:
 *           type: integer
 *         description: Aktarma sayısı
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sıralama alanı
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sıralama yönü
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Sayfa numarası
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Sayfa başı kayıt
 *     responses:
 *       200:
 *         description: Uçuşlar listelendi
 *       500:
 *         description: Sunucu hatası
 */

// @route   GET /api/flights
// @desc    Tüm uçuşları getir (filtreleme ile)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      from,
      to,
      departureDate,
      returnDate,
      passengers,
      class: flightClass,
      airline,
      priceMin,
      priceMax,
      stops,
      sortBy,
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;

    // Filtreleme kriterleri
    const filter = {};

    if (from) {
      filter['departure.city'] = { $regex: from, $options: 'i' };
    }

    if (to) {
      filter['arrival.city'] = { $regex: to, $options: 'i' };
    }

    if (departureDate) {
      const startDate = new Date(departureDate);
      const endDate = new Date(departureDate);
      endDate.setDate(endDate.getDate() + 1);
      
      filter['departure.time'] = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (airline) {
      filter.airline = { $regex: airline, $options: 'i' };
    }

    if (stops !== undefined) {
      filter.stops = parseInt(stops);
    }

    if (priceMin || priceMax) {
      filter['price.economy'] = {};
      if (priceMin) filter['price.economy'].$gte = parseInt(priceMin);
      if (priceMax) filter['price.economy'].$lte = parseInt(priceMax);
    }

    // Sıralama
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort['departure.time'] = 1; // Varsayılan olarak kalkış zamanına göre sırala
    }

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const flights = await Flight.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Flight.countDocuments(filter);

    res.json({
      success: true,
      data: {
        flights,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalFlights: total,
          hasNext: skip + flights.length < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get flights error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

/**
 * @swagger
 * /api/flights/{id}:
 *   get:
 *     summary: Tekil uçuş bilgisi getir
 *     tags: [Flights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Uçuş ID
 *     responses:
 *       200:
 *         description: Uçuş bulundu
 *       404:
 *         description: Uçuş bulunamadı
 *       500:
 *         description: Sunucu hatası
 */

// @route   GET /api/flights/:id
// @desc    Tek bir uçuşu getir
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const flightId = req.params.id;
    // Önce Redis cache kontrolü
    const cacheKey = `flight:${flightId}`;
    redisClient.get(cacheKey, async (err, cachedFlight) => {
      if (err) {
        console.error('Redis get error:', err);
      }
      if (cachedFlight) {
        // Cache hit
        return res.json({
          success: true,
          data: { flight: JSON.parse(cachedFlight) },
          cache: true
        });
      } else {
        // Cache miss, DB'den çek
        const flight = await Flight.findById(flightId);
        if (!flight) {
          return res.status(404).json({
            success: false,
            message: 'Uçuş bulunamadı'
          });
        }
        // Redis'e yaz (10dk süreyle)
        redisClient.setex(cacheKey, 600, JSON.stringify(flight));
        return res.json({
          success: true,
          data: { flight },
          cache: false
        });
      }
    });
  } catch (error) {
    console.error('Get flight error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

/**
 * @swagger
 * /api/flights/popular/routes:
 *   get:
 *     summary: Popüler uçuş rotalarını getir
 *     tags: [Flights]
 *     responses:
 *       200:
 *         description: Popüler rotalar listelendi
 *       500:
 *         description: Sunucu hatası
 */

// @route   GET /api/flights/popular/routes
// @desc    Popüler rotaları getir
// @access  Public
router.get('/popular/routes', async (req, res) => {
  try {
    const popularRoutes = await Flight.aggregate([
      {
        $group: {
          _id: {
            from: '$departure.city',
            to: '$arrival.city'
          },
          count: { $sum: 1 },
          avgPrice: { $avg: '$price.economy' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      data: { popularRoutes }
    });

  } catch (error) {
    console.error('Get popular routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

/**
 * @swagger
 * /api/flights/search/suggestions:
 *   get:
 *     summary: Şehir arama önerileri getir
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Aranacak şehir ismi
 *     responses:
 *       200:
 *         description: Şehir önerileri listelendi
 *       500:
 *         description: Sunucu hatası
 */

// @route   GET /api/flights/search/suggestions
// @desc    Şehir önerilerini getir
// @access  Public
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] }
      });
    }

    const suggestions = await Flight.aggregate([
      {
        $facet: {
          departureCities: [
            {
              $match: {
                'departure.city': { $regex: q, $options: 'i' }
              }
            },
            {
              $group: {
                _id: '$departure.city',
                type: { $first: 'departure' }
              }
            }
          ],
          arrivalCities: [
            {
              $match: {
                'arrival.city': { $regex: q, $options: 'i' }
              }
            },
            {
              $group: {
                _id: '$arrival.city',
                type: { $first: 'arrival' }
              }
            }
          ]
        }
      }
    ]);

    const allSuggestions = [
      ...suggestions[0].departureCities,
      ...suggestions[0].arrivalCities
    ].slice(0, 10);

    res.json({
      success: true,
      data: { suggestions: allSuggestions }
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 