const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Kullanıcı ve yolcu işlemleri
 */

// @route   GET /api/users/profile
// @desc    Kullanıcı profilini getir
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Kullanıcı profilini güncelle
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().notEmpty().withMessage('İsim boş olamaz'),
  body('phone').optional().isMobilePhone('tr-TR').withMessage('Geçerli bir telefon numarası giriniz'),
  body('birthDate').optional().isISO8601().withMessage('Geçerli bir doğum tarihi giriniz'),
  body('gender').optional().isIn(['Erkek', 'Kadın', 'Diğer']).withMessage('Geçerli bir cinsiyet seçiniz')
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
      name,
      phone,
      birthDate,
      gender,
      address
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (birthDate) updateData.birthDate = birthDate;
    if (gender) updateData.gender = gender;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/users/password
// @desc    Şifre değiştir
// @access  Private
router.put('/password', [
  auth,
  body('currentPassword').notEmpty().withMessage('Mevcut şifre zorunludur'),
  body('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır')
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

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    
    // Mevcut şifreyi kontrol et
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mevcut şifre hatalı'
      });
    }

    // Yeni şifreyi güncelle
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Kullanıcı tercihlerini güncelle
// @access  Private
router.put('/preferences', [
  auth,
  body('language').optional().isIn(['tr', 'en']).withMessage('Geçerli bir dil seçiniz'),
  body('notifications.email').optional().isBoolean().withMessage('E-posta bildirimi boolean olmalıdır'),
  body('notifications.sms').optional().isBoolean().withMessage('SMS bildirimi boolean olmalıdır'),
  body('notifications.push').optional().isBoolean().withMessage('Push bildirimi boolean olmalıdır')
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

    const { language, notifications } = req.body;

    const updateData = {};
    if (language) updateData['preferences.language'] = language;
    if (notifications) {
      if (notifications.email !== undefined) updateData['preferences.notifications.email'] = notifications.email;
      if (notifications.sms !== undefined) updateData['preferences.notifications.sms'] = notifications.sms;
      if (notifications.push !== undefined) updateData['preferences.notifications.push'] = notifications.push;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Tercihler başarıyla güncellendi',
      data: { user }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   DELETE /api/users/profile
// @desc    Kullanıcı hesabını sil
// @access  Private
router.delete('/profile', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: 'Hesabınız başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   POST /api/users/passengers
// @desc    Yeni yolcu ekle
// @access  Private
router.post('/passengers', [
  auth,
  body('name').notEmpty().withMessage('Yolcu adı zorunludur'),
  body('surname').notEmpty().withMessage('Yolcu soyadı zorunludur'),
  body('birthDate').isISO8601().withMessage('Geçerli bir doğum tarihi giriniz'),
  body('passportNumber').notEmpty().withMessage('Pasaport numarası zorunludur')
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

    const { name, surname, birthDate, passportNumber, isDefault } = req.body;

    const user = await User.findById(req.user._id);
    
    // Eğer bu yolcu varsayılan olarak işaretleniyorsa, diğerlerini varsayılan olmaktan çıkar
    if (isDefault) {
      user.passengers.forEach(passenger => {
        passenger.isDefault = false;
      });
    }

    // Yeni yolcuyu ekle
    user.passengers.push({
      name,
      surname,
      birthDate,
      passportNumber,
      isDefault: isDefault || false
    });

    await user.save();

    res.json({
      success: true,
      message: 'Yolcu başarıyla eklendi',
      data: { passengers: user.passengers }
    });

  } catch (error) {
    console.error('Add passenger error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   GET /api/users/passengers
// @desc    Kullanıcının yolcularını getir
// @access  Private
router.get('/passengers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('passengers');
    
    res.json({
      success: true,
      data: { passengers: user.passengers }
    });

  } catch (error) {
    console.error('Get passengers error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   PUT /api/users/passengers/:passengerId
// @desc    Yolcu bilgilerini güncelle
// @access  Private
router.put('/passengers/:passengerId', [
  auth,
  body('name').optional().notEmpty().withMessage('Yolcu adı boş olamaz'),
  body('surname').optional().notEmpty().withMessage('Yolcu soyadı boş olamaz'),
  body('birthDate').optional().isISO8601().withMessage('Geçerli bir doğum tarihi giriniz'),
  body('passportNumber').optional().notEmpty().withMessage('Pasaport numarası boş olamaz')
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

    const { name, surname, birthDate, passportNumber, isDefault } = req.body;
    const passengerId = req.params.passengerId;

    const user = await User.findById(req.user._id);
    const passenger = user.passengers.id(passengerId);

    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Yolcu bulunamadı'
      });
    }

    // Yolcu bilgilerini güncelle
    if (name) passenger.name = name;
    if (surname) passenger.surname = surname;
    if (birthDate) passenger.birthDate = birthDate;
    if (passportNumber) passenger.passportNumber = passportNumber;

    // Eğer bu yolcu varsayılan olarak işaretleniyorsa, diğerlerini varsayılan olmaktan çıkar
    if (isDefault) {
      user.passengers.forEach(p => {
        p.isDefault = false;
      });
      passenger.isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Yolcu bilgileri güncellendi',
      data: { passengers: user.passengers }
    });

  } catch (error) {
    console.error('Update passenger error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @route   DELETE /api/users/passengers/:passengerId
// @desc    Yolcuyu sil
// @access  Private
router.delete('/passengers/:passengerId', auth, async (req, res) => {
  try {
    const passengerId = req.params.passengerId;
    const user = await User.findById(req.user._id);

    const passenger = user.passengers.id(passengerId);
    if (!passenger) {
      return res.status(404).json({
        success: false,
        message: 'Yolcu bulunamadı'
      });
    }

    // Yolcuyu sil
    user.passengers.pull(passengerId);
    await user.save();

    res.json({
      success: true,
      message: 'Yolcu başarıyla silindi',
      data: { passengers: user.passengers }
    });

  } catch (error) {
    console.error('Delete passenger error:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router; 