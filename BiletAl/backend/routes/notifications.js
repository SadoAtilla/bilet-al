const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Bildirim işlemleri
 */

// @route   GET /api/notifications
// @desc    Kullanıcının bildirimlerini getir
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const notifications = [
      {
        id: 1,
        type: 'booking',
        title: 'Rezervasyon Onaylandı',
        message: 'TK001 uçuşunuz için rezervasyonunuz onaylandı.',
        date: new Date(),
        read: false
      },
      {
        id: 2,
        type: 'price_alert',
        title: 'Fiyat Düştü',
        message: 'İstanbul - Paris rotasında fiyat düştü!',
        date: new Date(Date.now() - 86400000),
        read: true
      },
      {
        id: 3,
        type: 'reminder',
        title: 'Uçuş Hatırlatması',
        message: 'Yarın TK002 uçuşunuz var.',
        date: new Date(Date.now() - 172800000),
        read: false
      }
    ];

    res.json({
      success: true,
      data: {
        notifications
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Bildirimi okundu olarak işaretle
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Gerçek uygulamada bildirim veritabanından güncellenir
    res.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Tüm bildirimleri okundu olarak işaretle
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    // Gerçek uygulamada tüm bildirimler veritabanından güncellenir
    res.json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Bildirimi sil
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Gerçek uygulamada bildirim veritabanından silinir
    res.json({
      success: true,
      message: 'Bildirim silindi'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   POST /api/notifications/settings
// @desc    Bildirim ayarlarını güncelle
// @access  Private
router.post('/settings', auth, async (req, res) => {
  try {
    const { email, sms, push, priceAlerts } = req.body;
    
    const user = await User.findById(req.user.id);
    user.preferences.notifications = {
      email: email || false,
      sms: sms || false,
      push: push || false
    };
    user.preferences.priceAlerts = priceAlerts || false;
    
    await user.save();

    res.json({
      success: true,
      message: 'Bildirim ayarları güncellendi',
      data: {
        notifications: user.preferences.notifications,
        priceAlerts: user.preferences.priceAlerts
      }
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 