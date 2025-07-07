// Backend ile entegre edilmiş auth fonksiyonları

// Giriş işlemi (Backend API kullanır)
async function login(email, password) {
    console.log('Giriş denemesi:', email);
    
    if (!email || !password) {
        console.log('E-posta veya şifre boş olamaz');
        return false;
    }

    try {
        // Önce eski kullanıcı bilgilerini temizle
        localStorage.removeItem('currentUser');
        api.clearToken();
        
        const response = await api.login(email, password);
    
        if (response.success) {
            console.log('Giriş başarılı:', response.data.user.name);
            // Yeni kullanıcı bilgilerini kaydet
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        updateNavbar();
        return true;
    } else {
            console.log('Giriş başarısız:', response.message);
            return false;
        }
    } catch (error) {
        console.log('Giriş hatası:', error.message);
        return false;
    }
}

// Çıkış işlemi (Backend API kullanır)
async function logout() {
    console.log('Çıkış yapılıyor');
    
    try {
        await api.logout();
    } catch (error) {
        console.log('Çıkış hatası:', error.message);
    } finally {
        // Tüm kullanıcı verilerini temizle
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        api.clearToken();
    updateNavbar();
    window.location.href = 'index.html';
}
}

// Global olarak erişilebilir hale getir
window.logout = logout;

// Kullanıcı verilerini temizleme fonksiyonu
function clearUserData() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    api.clearToken();
    updateNavbar();
}

// Global olarak erişilebilir hale getir
window.clearUserData = clearUserData;

// Kayıt işlemi (Backend API kullanır)
async function register(name, email, password) {
    console.log('Kayıt denemesi:', email);
    
    if (!name || !email || !password) {
        console.log('Tüm alanlar doldurulmalıdır');
        return false;
    }

    try {
        // Önce eski kullanıcı bilgilerini temizle
        localStorage.removeItem('currentUser');
        api.clearToken();
        
        const response = await api.register(name, email, password);
        
        if (response.success) {
            console.log('Kayıt başarılı:', name);
            // Yeni kullanıcı bilgilerini kaydet
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            updateNavbar();
            return true;
        } else {
            console.log('Kayıt başarısız:', response.message);
            return false;
        }
    } catch (error) {
        console.log('Kayıt hatası:', error.message);
        return false;
    }
}

// Navbar güncelleme
function updateNavbar() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navbarNav = document.querySelector('.navbar-nav');
    const dFlex = document.querySelector('.d-flex');
    
    if (!navbarNav || !dFlex) {
        console.log('Navbar elementleri bulunamadı');
        return;
    }
    
    // Profil, Biletlerim, Favorilerim, Geçmiş Uçuşlar linklerini kontrol et
    const profileLink = navbarNav.querySelector('a[href="profile.html"]');
    const ticketsLink = navbarNav.querySelector('a[href="tickets.html"]');
    const favoritesLink = navbarNav.querySelector('a[href="favorites.html"]');
    const pastFlightsLink = navbarNav.querySelector('a[href="past-flights.html"]');
    
    if (currentUser && currentUser.id) {
        // Giriş/Kayıt butonlarını gizle
        const loginLink = dFlex.querySelector('a[href="login.html"]');
        const registerLink = dFlex.querySelector('a[href="register.html"]');
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        
        // Kullanıcıya özel linkleri göster
        if (profileLink) profileLink.style.display = 'block';
        if (ticketsLink) ticketsLink.style.display = 'block';
        if (favoritesLink) favoritesLink.style.display = 'block';
        if (pastFlightsLink) pastFlightsLink.style.display = 'block';
        
        // Eski kullanıcı menüsünü kaldır
        const oldUserMenu = dFlex.querySelector('.user-menu');
        if (oldUserMenu) oldUserMenu.remove();
        
        // Yeni kullanıcı menüsünü ekle
        const userMenuHtml = `
            <div class="dropdown user-menu">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user"></i> ${currentUser.name}
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user-cog"></i> Profilim</a></li>
                    <li><a class="dropdown-item" href="tickets.html"><i class="fas fa-ticket-alt"></i> Biletlerim</a></li>
                    <li><a class="dropdown-item" href="favorites.html"><i class="fas fa-heart"></i> Favorilerim</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</a></li>
                </ul>
            </div>
        `;
        dFlex.insertAdjacentHTML('beforeend', userMenuHtml);
    } else {
        // Kullanıcı menüsünü kaldır
        const userMenu = dFlex.querySelector('.user-menu');
        if (userMenu) userMenu.remove();
        
        // Giriş/Kayıt butonlarını göster
        const loginLink = dFlex.querySelector('a[href="login.html"]');
        const registerLink = dFlex.querySelector('a[href="register.html"]');
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        
        // Kullanıcıya özel linkleri gizle
        if (profileLink) profileLink.style.display = 'none';
        if (ticketsLink) ticketsLink.style.display = 'none';
        if (favoritesLink) favoritesLink.style.display = 'none';
        if (pastFlightsLink) pastFlightsLink.style.display = 'none';
    }
}

// Sayfa yüklendiğinde navbar'ı güncelle
document.addEventListener('DOMContentLoaded', updateNavbar); 