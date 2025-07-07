const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const auth = require('../middleware/auth');
const amqp = require('amqplib');
const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Rezervasyon ve bilet işlemleri
 */

// @route   POST /api/bookings
// @desc    Yeni rezervasyon oluştur
// @access  Private
router.post('/', [
  auth,
  body('flightId').notEmpty().withMessage('Uçuş ID zorunludur'),
  body('passengers').isArray({ min: 1 }).withMessage('En az bir yolcu olmalıdır'),
  body('passengers.*.name').notEmpty().withMessage('Yolcu adı zorunludur'),
  body('passengers.*.surname').notEmpty().withMessage('Yolcu soyadı zorunludur'),
  body('passengers.*.birthDate').notEmpty().withMessage('Doğum tarihi zorunludur'),
  body('passengers.*.passportNumber').notEmpty().withMessage('Pasaport numarası zorunludur'),
  body('class').isIn(['economy', 'business', 'first']).withMessage('Geçerli bir sınıf seçiniz'),
  body('paymentMethod').isIn(['credit_card', 'bank_transfer', 'paypal']).withMessage('Geçerli bir ödeme yöntemi seçiniz')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasyon hatası',
        errors: errors.array()
      });
    }

    const {
      flightId,
      passengers,
      class: flightClass,
      paymentMethod,
      specialRequests
    } = req.body;

    // Uçuşu kontrol et
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: 'Uçuş bulunamadı'
      });
    }

    // Koltuk müsaitliğini kontrol et
    const availableSeats = flight.availableSeats[flightClass];
    if (availableSeats < passengers.length) {
      return res.status(400).json({
        success: false,
        message: 'Yeterli koltuk bulunmamaktadır'
      });
    }

    // Fiyat hesapla
    const pricePerPassenger = flight.price[flightClass];
    const totalPrice = pricePerPassenger * passengers.length;

    // Rezervasyon oluştur
    const booking = new Booking({
      user: req.user._id,
      flight: flightId,
      passengers,
      class: flightClass,
      totalPrice,
      paymentMethod,
      specialRequests
    });

    await booking.save();

    // Koltuk sayısını güncelle
    flight.availableSeats[flightClass] -= passengers.length;
    await flight.save();

    // RabbitMQ'ya mesaj gönder
    try {
      const conn = await amqp.connect(amqpUrl);
      const channel = await conn.createChannel();
      const queue = 'ticket_purchased';
      await channel.assertQueue(queue, { durable: false });
      const message = {
        user: req.user.email,
        bookingId: booking._id,
        flightId: booking.flight,
        passengers: booking.passengers,
        totalPrice: booking.totalPrice,
        createdAt: booking.createdAt
      };
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      setTimeout(() => { conn.close(); }, 500);
    } catch (mqErr) {
      console.error('RabbitMQ mesaj gönderme hatası:', mqErr);
    }

    // Populate ile detayları getir
    await booking.populate([
      { path: 'flight', select: 'flightNumber airline departure arrival' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Rezervasyon başarıyla oluşturuldu',
      data: { booking }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/bookings
// @desc    Kullanıcının rezervasyonlarını getir
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('flight', 'flightNumber airline departure arrival price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBookings: total
        }
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Tek bir rezervasyonu getir
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate([
      { path: 'flight', select: 'flightNumber airline departure arrival aircraft' },
      { path: 'user', select: 'name email phone' }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervasyon bulunamadı'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Rezervasyonu iptal et
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('flight');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervasyon bulunamadı'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Bu rezervasyon zaten iptal edilmiş'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Tamamlanmış rezervasyon iptal edilemez'
      });
    }

    // Rezervasyonu iptal et
    booking.status = 'cancelled';
    await booking.save();

    // Koltuk sayısını geri ekle
    const flight = booking.flight;
    flight.availableSeats[booking.class] += booking.passengers.length;
    await flight.save();

    res.json({
      success: true,
      message: 'Rezervasyon başarıyla iptal edildi',
      data: { booking }
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/bookings/:id/payment
// @desc    Ödeme durumunu güncelle
// @access  Private
router.put('/:id/payment', auth, async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervasyon bulunamadı'
      });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.json({
      success: true,
      message: 'Ödeme durumu güncellendi',
      data: { booking }
    });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/bookings/:id/download
// @desc    Bilet indirme (PDF benzeri)
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate([
      { path: 'flight', select: 'flightNumber airline departure arrival aircraft' },
      { path: 'user', select: 'name email' }
    ]);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervasyon bulunamadı'
      });
    }

    // Bilet verilerini hazırla (gerçek uygulamada PDF oluşturulur)
    const ticketData = {
      bookingNumber: booking.bookingNumber,
      passenger: booking.passengers[0], // İlk yolcu
      flight: booking.flight,
      class: booking.class,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt
    };

    res.json({
      success: true,
      message: 'Bilet indirme başarılı',
      data: { ticketData }
    });

  } catch (error) {
    console.error('Download ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/bookings/:id/list-for-sale
// @desc    Bileti satışa çıkar
// @access  Private
router.put('/:id/list-for-sale', auth, async (req, res) => {
  try {
    const { salePrice } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervasyon bulunamadı'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Sadece onaylanmış biletler satışa çıkarılabilir'
      });
    }

    // Bileti satışa çıkar
    booking.status = 'listed_for_sale';
    booking.salePrice = salePrice;
    booking.listedAt = new Date();
    await booking.save();

    res.json({
      success: true,
      message: 'Bilet başarıyla satışa çıkarıldı',
      data: { booking }
    });

  } catch (error) {
    console.error('List for sale error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/bookings/listed-for-sale
// @desc    Satışa çıkarılmış biletleri getir
// @access  Public
router.get('/listed-for-sale', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find({ status: 'listed_for_sale' })
      .populate([
        { path: 'flight', select: 'flightNumber airline departure arrival' },
        { path: 'user', select: 'name' }
      ])
      .sort({ listedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({ status: 'listed_for_sale' });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBookings: total
        }
      }
    });

  } catch (error) {
    console.error('Get listed bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/bookings/past-flights
// @desc    Geçmiş uçuşları getir
// @access  Private
router.get('/past-flights', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Geçmiş uçuşlar (tamamlanmış veya iptal edilmiş)
    const bookings = await Booking.find({
      user: req.user._id,
      status: { $in: ['completed', 'cancelled'] }
    })
      .populate('flight', 'flightNumber airline departure arrival price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments({
      user: req.user._id,
      status: { $in: ['completed', 'cancelled'] }
    });

    res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalBookings: total
        }
      }
    });

  } catch (error) {
    console.error('Get past flights error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 