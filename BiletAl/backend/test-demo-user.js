const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/biletal')
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

async function testDemoUser() {
  try {
    console.log('Demo kullanıcı test ediliyor...');
    
    // Demo kullanıcıyı bul
    const user = await User.findOne({ email: 'demo@biletal.com' });
    
    if (!user) {
      console.log('❌ Demo kullanıcı bulunamadı!');
      return;
    }
    
    console.log('✅ Demo kullanıcı bulundu:');
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Password (hash):', user.password);
    
    // Şifre testi
    const testPassword = 'demo123';
    const isMatch = await user.comparePassword(testPassword);
    
    console.log('🔐 Şifre testi:');
    console.log('   Test şifresi:', testPassword);
    console.log('   Şifre doğru mu?', isMatch ? '✅ EVET' : '❌ HAYIR');
    
    if (!isMatch) {
      console.log('⚠️  Şifre yanlış! Yeni demo kullanıcı oluşturuluyor...');
      
      // Eski kullanıcıyı sil
      await User.deleteOne({ email: 'demo@biletal.com' });
      
      // Yeni demo kullanıcı oluştur
      const newUser = new User({
        name: 'Demo Kullanıcı',
        email: 'demo@biletal.com',
        password: 'demo123',
        phone: '+90 555 123 4567',
        birthDate: new Date('1990-05-15'),
        gender: 'Erkek',
        address: {
          street: 'Atatürk Caddesi No:123',
          city: 'İstanbul',
          country: 'Türkiye',
          zipCode: '34000'
        },
        preferences: {
          language: 'tr',
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          priceAlerts: true
        }
      });
      
      await newUser.save();
      console.log('✅ Yeni demo kullanıcı oluşturuldu!');
      
      // Yeni şifre testi
      const newIsMatch = await newUser.comparePassword('demo123');
      console.log('   Yeni şifre testi:', newIsMatch ? '✅ BAŞARILI' : '❌ BAŞARISIZ');
    }
    
    await mongoose.connection.close();
    console.log('Test tamamlandı!');
    
  } catch (error) {
    console.error('Test hatası:', error);
    await mongoose.connection.close();
  }
}

testDemoUser(); 