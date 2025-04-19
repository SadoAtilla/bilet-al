// Kullanıcı kimlik doğrulama işlemleri
const auth = {
    // Örnek kullanıcı veritabanı (gerçek uygulamada bu veriler sunucuda saklanır)
    users: [
        {
            email: 'sadikatilla99@gmail.com',
            password: 'biletal123',
            name: 'Sadık Atilla',
            tickets: []
        }
    ],
    
    // Kullanıcı girişi
    login: function(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Kullanıcı bilgilerini session storage'a kaydet
            sessionStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                name: user.name
            }));
            
            return true;
        }
        
        return false;
    },
    
    // Kullanıcı çıkışı
    logout: function() {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    },
    
    // Kullanıcı kaydı
    register: function(email, password, name) {
        // E-posta kontrolü
        if (this.users.some(u => u.email === email)) {
            return false; // E-posta zaten kullanımda
        }
        
        // Yeni kullanıcı oluştur
        const newUser = {
            email: email,
            password: password,
            name: name,
            tickets: []
        };
        
        this.users.push(newUser);
        
        // Otomatik giriş yap
        return this.login(email, password);
    },
    
    // Kullanıcı kontrolü
    isLoggedIn: function() {
        return sessionStorage.getItem('currentUser') !== null;
    },
    
    // Mevcut kullanıcı bilgilerini al
    getCurrentUser: function() {
        const userJson = sessionStorage.getItem('currentUser');
        return userJson ? JSON.parse(userJson) : null;
    },
    
    // Kullanıcı biletlerini al
    getUserTickets: function() {
        const user = this.getCurrentUser();
        if (!user) return [];
        
        const userData = this.users.find(u => u.email === user.email);
        return userData ? userData.tickets : [];
    },
    
    // Kullanıcıya bilet ekle
    addTicket: function(ticket) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        const userIndex = this.users.findIndex(u => u.email === user.email);
        if (userIndex === -1) return false;
        
        this.users[userIndex].tickets.push(ticket);
        return true;
    }
};

// Sayfa yüklendiğinde oturum kontrolü yap
document.addEventListener('DOMContentLoaded', function() {
    // Giriş sayfasında değilsek ve kullanıcı giriş yapmamışsa, giriş sayfasına yönlendir
    if (!window.location.pathname.includes('login.html') && 
        !window.location.pathname.includes('register.html') && 
        !auth.isLoggedIn()) {
        window.location.href = 'login.html';
    }
    
    // Kullanıcı giriş yapmışsa, navbar'ı güncelle
    if (auth.isLoggedIn()) {
        const user = auth.getCurrentUser();
        const userNavItem = document.querySelector('.nav-item .nav-link[href="profile.html"]');
        
        if (userNavItem) {
            userNavItem.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
        }
    }
}); 