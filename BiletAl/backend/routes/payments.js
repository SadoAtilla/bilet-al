const express = require('express');
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Ödeme işlemleri
 */

// @route   POST /api/payments/process
// @desc    Ödeme işlemini gerçekleştir
// @access  Private
router.post('/process', auth, async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;

    // Booking'i bul
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervasyon bulunamadı'
      });
    }

    // Kullanıcı kontrolü
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu rezervasyon için yetkiniz yok'
      });
    }

    // Ödeme simülasyonu
    const paymentResult = {
      success: true,
      transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount: booking.totalPrice,
      currency: 'TRY',
      paymentMethod: paymentMethod,
      status: 'completed',
      timestamp: new Date()
    };

    // Booking'i güncelle
    booking.paymentStatus = 'paid';
    booking.paymentDetails = paymentResult;
    booking.status = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı',
      data: {
        payment: paymentResult,
        booking: booking
      }
    });

  } catch (error) {
    console.error('Payment process error:', error);
    res.status(500).json({
      success: false,
      message: 'Ödeme işlemi başarısız'
    });
  }
});

// @route   GET /api/payments/methods
// @desc    Kullanılabilir ödeme yöntemlerini getir
// @access  Public
router.get('/methods', async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'credit_card',
        name: 'Kredi Kartı',
        icon: 'fas fa-credit-card',
        description: 'Visa, MasterCard, American Express'
      },
      {
        id: 'bank_transfer',
        name: 'Banka Transferi',
        icon: 'fas fa-university',
        description: 'EFT/Havale ile ödeme'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        icon: 'fab fa-paypal',
        description: 'PayPal hesabınızla ödeyin'
      },
      {
        id: 'crypto',
        name: 'Kripto Para',
        icon: 'fas fa-bitcoin',
        description: 'Bitcoin, Ethereum ile ödeyin'
      }
    ];

    res.json({
      success: true,
      data: {
        paymentMethods
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   POST /api/payments/refund
// @desc    İade işlemi başlat
// @access  Private
router.post('/refund', auth, async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Rezervasyon bulunamadı'
      });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu rezervasyon için yetkiniz yok'
      });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Bu rezervasyon için ödeme yapılmamış'
      });
    }

    // İade simülasyonu
    const refundResult = {
      success: true,
      refundId: 'REF_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      amount: booking.totalPrice,
      reason: reason,
      status: 'processing',
      estimatedTime: '3-5 iş günü',
      timestamp: new Date()
    };

    // Booking'i güncelle
    booking.refundDetails = refundResult;
    booking.status = 'refund_requested';
    await booking.save();

    res.json({
      success: true,
      message: 'İade talebi başarıyla oluşturuldu',
      data: {
        refund: refundResult
      }
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'İade işlemi başarısız'
    });
  }
});

// @route   GET /api/payments/history
// @desc    Kullanıcının ödeme geçmişini getir
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      user: req.user.id,
      paymentStatus: 'paid'
    }).populate('flight').sort({ createdAt: -1 });

    const paymentHistory = bookings.map(booking => ({
      id: booking._id,
      transactionId: booking.paymentDetails?.transactionId,
      amount: booking.totalPrice,
      date: booking.paymentDetails?.timestamp,
      status: booking.paymentStatus,
      flight: booking.flight,
      refundStatus: booking.refundDetails?.status
    }));

    res.json({
      success: true,
      data: {
        paymentHistory
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 