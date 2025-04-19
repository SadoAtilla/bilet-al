// Dil değiştirme işlevselliği
document.addEventListener('DOMContentLoaded', function() {
    // Dil seçeneklerini tanımla
    const languages = {
        tr: {
            // Ana Sayfa
            'home': 'Ana Sayfa',
            'search_flights': 'Uçuş Ara',
            'popular_routes': 'Popüler Rotalar',
            'recommended_destinations': 'Önerilen Destinasyonlar',
            'features': 'Özellikler',
            
            // Navbar
            'favorites': 'Favorilerim',
            'tickets': 'Biletlerim',
            'past_flights': 'Geçmiş Uçuşlar',
            'profile': 'Profilim',
            'login': 'Giriş Yap',
            'register': 'Kayıt Ol',
            
            // Form Etiketleri
            'from': 'Nereden',
            'to': 'Nereye',
            'departure_date': 'Gidiş Tarihi',
            'return_date': 'Dönüş Tarihi',
            'passengers': 'Yolcu',
            'class': 'Sınıf',
            'search': 'Ara',
            
            // Bilet Kartı
            'flight_number': 'Uçuş No',
            'departure_time': 'Kalkış',
            'arrival_time': 'Varış',
            'duration': 'Süre',
            'price': 'Fiyat',
            'book_now': 'Hemen Al',
            'add_to_favorites': 'Favorilere Ekle',
            
            // Profil
            'personal_info': 'Kişisel Bilgiler',
            'security': 'Güvenlik',
            'notifications': 'Bildirimler',
            'save': 'Kaydet',
            
            // Footer
            'all_rights_reserved': 'Tüm hakları saklıdır.'
        },
        en: {
            // Home Page
            'home': 'Home',
            'search_flights': 'Search Flights',
            'popular_routes': 'Popular Routes',
            'recommended_destinations': 'Recommended Destinations',
            'features': 'Features',
            
            // Navbar
            'favorites': 'My Favorites',
            'tickets': 'My Tickets',
            'past_flights': 'Past Flights',
            'profile': 'My Profile',
            'login': 'Login',
            'register': 'Register',
            
            // Form Labels
            'from': 'From',
            'to': 'To',
            'departure_date': 'Departure Date',
            'return_date': 'Return Date',
            'passengers': 'Passengers',
            'class': 'Class',
            'search': 'Search',
            
            // Ticket Card
            'flight_number': 'Flight No',
            'departure_time': 'Departure',
            'arrival_time': 'Arrival',
            'duration': 'Duration',
            'price': 'Price',
            'book_now': 'Book Now',
            'add_to_favorites': 'Add to Favorites',
            
            // Profile
            'personal_info': 'Personal Information',
            'security': 'Security',
            'notifications': 'Notifications',
            'save': 'Save',
            
            // Footer
            'all_rights_reserved': 'All rights reserved.'
        }
    };

    // Varsayılan dili ayarla
    let currentLang = localStorage.getItem('language') || 'tr';

    // Dil değiştirme fonksiyonu
    function changeLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('language', lang);
        
        // Dil seçici butonunu güncelle
        const langButton = document.querySelector('#languageDropdown');
        if (langButton) {
            langButton.innerHTML = `<i class="fas fa-globe"></i> ${lang.toUpperCase()}`;
        }
        
        // Aktif dil seçeneğini güncelle
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-lang') === lang) {
                item.classList.add('active');
            }
        });
        
        // Sayfa içeriğini güncelle
        updatePageContent();
    }

    // Sayfa içeriğini güncelleme fonksiyonu
    function updatePageContent() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (languages[currentLang][key]) {
                element.textContent = languages[currentLang][key];
            }
        });
    }

    // Dil değiştirme olaylarını dinle
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            changeLanguage(lang);
        });
    });

    // Sayfa yüklendiğinde mevcut dili uygula
    changeLanguage(currentLang);
}); 