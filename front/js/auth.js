// Kullanıcı veritabanı
const users = [
    {
        email: 'demo@biletal.com',
        password: 'demo123',
        name: 'Demo Kullanıcı'
    }
];

// Giriş işlemi
function login(email, password) {
    console.log('Giriş denemesi:', email);
    
    if (!email || !password) {
        console.log('E-posta veya şifre boş olamaz');
        return false;
    }

    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        console.log('Giriş başarılı:', user.name);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        updateNavbar();
        return true;
    } else {
        console.log('Giriş başarısız: E-posta veya şifre hatalı');
        return false;
    }
}

// Çıkış işlemi
function logout() {
    console.log('Çıkış yapılıyor');
    sessionStorage.removeItem('currentUser');
    updateNavbar();
    window.location.href = 'index.html';
}

// Kayıt işlemi
function register(name, email, password) {
    console.log('Kayıt denemesi:', email);
    
    if (!name || !email || !password) {
        console.log('Tüm alanlar doldurulmalıdır');
        return false;
    }

    if (users.some(u => u.email === email)) {
        console.log('Bu e-posta adresi zaten kullanımda');
        return false;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    console.log('Kayıt başarılı:', name);
    return true;
}

// Navbar güncelleme
function updateNavbar() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const loginLink = document.querySelector('a[href="login.html"]');
    const registerLink = document.querySelector('a[href="register.html"]');
    const profileLink = document.querySelector('a[href="profile.html"]');
    
    if (currentUser) {
        if (loginLink) loginLink.style.display = 'none';
        if (registerLink) registerLink.style.display = 'none';
        if (profileLink) {
            profileLink.style.display = 'block';
            profileLink.textContent = currentUser.name;
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (registerLink) registerLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
    }
}

// Sayfa yüklendiğinde navbar'ı güncelle
document.addEventListener('DOMContentLoaded', updateNavbar); 