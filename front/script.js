// DOM içeriği yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Animasyonlu scroll efekti
    initSmoothScroll();
    
    // Uçuş bacaklarını yönetme
    initFlightLegs();
    
    // Tarih seçicileri için minimum tarih ayarlama
    setMinDates();
    
    // Favorilere ekleme sistemi
    initFavorites();
    
    // Biletleri görüntüleme ve yönetme
    initTicketManagement();
});

// Smooth scroll fonksiyonu
function initSmoothScroll() {
    const allLinks = document.querySelectorAll('a[href^="#"]');
    
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Uçuş bacaklarını dinamik olarak ekleme ve yönetme
function initFlightLegs() {
    const addLegBtn = document.getElementById('addLegBtn');
    if (!addLegBtn) return;
    
    let legCount = 2; // Mevcut 2 bacak var
    const maxLegs = 5;
    
    addLegBtn.addEventListener('click', function() {
        if (legCount >= maxLegs) {
            showAlert('En fazla ' + maxLegs + ' uçuş ekleyebilirsiniz', 'warning');
            return;
        }
        
        const flightLegsContainer = document.querySelector('.multi-city-form');
        const lastLeg = document.querySelector('.flight-leg:last-of-type');
        const newLeg = lastLeg.cloneNode(true);
        
        // Input alanlarını temizle
        newLeg.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        
        // Yeni uçuş bacağını ekle
        flightLegsContainer.insertBefore(newLeg, addLegBtn.parentElement);
        legCount++;
        
        // Kaldırma butonu ekleme
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-sm btn-outline-danger position-absolute';
        removeBtn.style.right = '10px';
        removeBtn.style.top = '10px';
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.addEventListener('click', function() {
            newLeg.remove();
            legCount--;
        });
        
        newLeg.style.position = 'relative';
        newLeg.appendChild(removeBtn);
        
        // Animasyon efekti ile yeni uçuş bacağı eklendiğini göster
        newLeg.style.opacity = '0';
        newLeg.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            newLeg.style.transition = 'all 0.3s ease';
            newLeg.style.opacity = '1';
            newLeg.style.transform = 'translateY(0)';
        }, 10);
    });
}

// Tarih seçicilerine bugünden başlayan minimum tarih ataması yapma
function setMinDates() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    dateInputs.forEach(input => {
        input.min = today;
        
        // Eğer dönüş tarihi inputu ise ve bir gidiş tarihi varsa
        if (input.id && input.id.includes('return')) {
            const departureInput = document.querySelector('input[type="date"]:not([id*="return"])');
            if (departureInput) {
                departureInput.addEventListener('change', function() {
                    input.min = this.value;
                    if (input.value && input.value < this.value) {
                        input.value = this.value;
                    }
                });
            }
        }
    });
}

// Favori ekleme sistemi
function initFavorites() {
    const favButtons = document.querySelectorAll('.btn-favorite');
    
    favButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Kullanıcı giriş durumunu kontrol et
            if (!isUserLoggedIn()) {
                // Kullanıcı giriş yapmamışsa login modalını göster
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
                showAlert('Favorilere eklemek için lütfen giriş yapın', 'info');
                return;
            }
            
            // Favori ikonu değiştirme ve animasyon
            const icon = this.querySelector('i');
            
            if (icon.classList.contains('far')) {
                // Favorilere ekle
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.classList.add('text-danger');
                
                // Kalp animasyonu
                icon.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    icon.style.transform = 'scale(1)';
                }, 300);
                
                showAlert('Favorilere eklendi', 'success');
                
                // API'ye favori ekleme isteği gönder
                // saveFavorite(routeId);
            } else {
                // Favorilerden çıkar
                icon.classList.add('far');
                icon.classList.remove('fas');
                icon.classList.remove('text-danger');
                
                showAlert('Favorilerden çıkarıldı', 'info');
                
                // API'den favori silme isteği gönder
                // removeFavorite(routeId);
            }
        });
    });
}

// Bilet yönetimi
function initTicketManagement() {
    const cancelButtons = document.querySelectorAll('.btn-cancel-ticket');
    const openTicketButtons = document.querySelectorAll('.btn-open-ticket');
    
    // Bilet iptali
    cancelButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Bu bileti iptal etmek istediğinize emin misiniz?')) {
                // İptal işlemi API çağrısı
                // cancelTicket(ticketId);
                showAlert('Biletiniz iptal edildi.', 'success');
            }
        });
    });
    
    // Bileti açığa alma
    openTicketButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Bu bileti açığa almak istediğinize emin misiniz?')) {
                // Açığa alma işlemi API çağrısı
                // openTicket(ticketId);
                showAlert('Biletiniz açığa alındı.', 'success');
            }
        });
    });
}

// Kullanıcı giriş durumunu kontrol et
// Gerçek uygulamada bu session veya token kontrolü ile yapılır
function isUserLoggedIn() {
    // Test için her zaman false dönüyor
    // Gerçek uygulamada oturum kontrolü yapılmalı
    return false;
}

// Rezervasyon işlemlerini başlat
function startReservation(routeId) {
    // Rezervasyon için gereken sayfaya yönlendir veya modal göster
    // Bu örnekte kullanıcı girişi kontrolü yapılıyor
    if (!isUserLoggedIn()) {
        // Kullanıcı giriş yapmamışsa login modalını göster
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
        showAlert('Rezervasyon yapmak için lütfen giriş yapın', 'info');
        return;
    }
    
    // Kullanıcı giriş yapmışsa, rezervasyon sayfasına yönlendir
    // window.location.href = 'reservation.html?route=' + routeId;
    console.log('Rezervasyon başlatılıyor: ' + routeId);
}

// Bildirim gösterme fonksiyonu
function showAlert(message, type = 'info') {
    // Toast bildirim elementi oluştur
    const alertDiv = document.createElement('div');
    alertDiv.className = `toast align-items-center text-white bg-${type} border-0`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.setAttribute('aria-live', 'assertive');
    alertDiv.setAttribute('aria-atomic', 'true');
    
    alertDiv.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Toast container oluştur veya varolan container'ı kullan
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Toast'ı container'a ekle
    toastContainer.appendChild(alertDiv);
    
    // Toast'ı göster
    const toast = new bootstrap.Toast(alertDiv, {
        autohide: true,
        delay: 3000
    });
    toast.show();
    
    // Animasyon ile göster
    alertDiv.style.transform = 'translateY(20px)';
    alertDiv.style.opacity = '0';
    
    setTimeout(() => {
        alertDiv.style.transition = 'all 0.3s ease';
        alertDiv.style.transform = 'translateY(0)';
        alertDiv.style.opacity = '1';
    }, 10);
}

// Rota ve bilet fiyatı filtreleme
document.addEventListener('DOMContentLoaded', function() {
    const sortPriceBtn = document.getElementById('sortPriceBtn');
    if (sortPriceBtn) {
        sortPriceBtn.addEventListener('click', function() {
            const sortOrder = this.getAttribute('data-sort') || 'asc';
            
            const routeCards = Array.from(document.querySelectorAll('.route-card'));
            const routeContainer = document.querySelector('.popular-routes .row');
            
            // Kartları fiyata göre sırala
            routeCards.sort((a, b) => {
                const priceA = parseInt(a.querySelector('.price').textContent.replace(/[^\d]/g, ''));
                const priceB = parseInt(b.querySelector('.price').textContent.replace(/[^\d]/g, ''));
                
                return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
            });
            
            // Sıralama butonunu güncelle
            if (sortOrder === 'asc') {
                this.setAttribute('data-sort', 'desc');
                this.innerHTML = '<i class="fas fa-sort-amount-down"></i> Fiyat (Pahalıdan Ucuza)';
            } else {
                this.setAttribute('data-sort', 'asc');
                this.innerHTML = '<i class="fas fa-sort-amount-up"></i> Fiyat (Ucuzdan Pahalıya)';
            }
            
            // Sıralanmış kartları tekrar ekle
            routeCards.forEach(card => {
                routeContainer.appendChild(card);
            });
            
            // Sıralama animasyonu
            routeCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'all 0.3s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 50);
            });
        });
    }
});

// Form kontrolleri ve doğrulama
document.addEventListener('DOMContentLoaded', function() {
    const searchForms = document.querySelectorAll('.tab-pane form');
    
    searchForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form validasyonu
            let isValid = true;
            const requiredInputs = form.querySelectorAll('input[required], select[required]');
            
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                    
                    // Input grubuna hata mesajı ekle
                    const formGroup = input.closest('.col-md-3, .col-md-5, .col-md-2');
                    
                    // Eğer zaten hata mesajı yoksa ekle
                    if (!formGroup.querySelector('.invalid-feedback')) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'invalid-feedback';
                        errorMsg.textContent = 'Bu alan zorunludur';
                        formGroup.appendChild(errorMsg);
                    }
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (isValid) {
                // Form geçerliyse, arama sonuçlarına yönlendir
                // Gerçek uygulamada: window.location.href = 'search-results.html?' + new URLSearchParams(new FormData(form));
                
                // Örnek gösterim için:
                showAlert('Uçuşlar aranıyor...', 'info');
                
                // Animasyon göster
                document.querySelector('.search-btn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Aranıyor...';
                
                // 2 saniye sonra arama sonuçlarına gidecek
                setTimeout(() => {
                    // Gerçek uygulamada arama sonuçları sayfasına yönlendirilir
                    console.log('Arama tamamlandı');
                    showAlert('Arama tamamlandı! Sonuçlar gösterilecek', 'success');
                    document.querySelector('.search-btn').innerHTML = '<i class="fas fa-search"></i> Uçuş Ara';
                }, 2000);
            }
        });
        
        // Herhangi bir input değiştiğinde invalid durumunu kaldır
        form.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('is-invalid');
                    
                    // Hata mesajını kaldır
                    const formGroup = this.closest('.col-md-3, .col-md-5, .col-md-2');
                    const errorMsg = formGroup.querySelector('.invalid-feedback');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                }
            });
        });
    });
});

// Yolcu bilgisi ekleme ve yönetme
function addPassengerForm() {
    const passengerContainer = document.getElementById('passengerContainer');
    if (!passengerContainer) return;
    
    const passengerCount = passengerContainer.querySelectorAll('.passenger-form').length;
    const newPassenger = document.createElement('div');
    newPassenger.className = 'passenger-form mb-4 p-3 border rounded';
    
    newPassenger.innerHTML = `
        <h5>Yolcu #${passengerCount + 1}</h5>
        <div class="row g-3">
            <div class="col-md-6">
                <label for="passengerName${passengerCount}" class="form-label">Ad</label>
                <input type="text" class="form-control" id="passengerName${passengerCount}" required>
            </div>
            <div class="col-md-6">
                <label for="passengerSurname${passengerCount}" class="form-label">Soyad</label>
                <input type="text" class="form-control" id="passengerSurname${passengerCount}" required>
            </div>
            <div class="col-md-6">
                <label for="passengerTC${passengerCount}" class="form-label">T.C. Kimlik No</label>
                <input type="text" class="form-control" id="passengerTC${passengerCount}" required>
            </div>
            <div class="col-md-6">
                <label for="passengerBirthday${passengerCount}" class="form-label">Doğum Tarihi</label>
                <input type="date" class="form-control" id="passengerBirthday${passengerCount}" required>
            </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger mt-3 remove-passenger">Yolcuyu Kaldır</button>
    `;
    
    passengerContainer.appendChild(newPassenger);
    
    // Yolcu kaldırma butonunu etkinleştir
    newPassenger.querySelector('.remove-passenger').addEventListener('click', function() {
        newPassenger.remove();
    });
    
    // Animasyon efekti
    newPassenger.style.opacity = '0';
    newPassenger.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        newPassenger.style.transition = 'all 0.3s ease';
        newPassenger.style.opacity = '1';
        newPassenger.style.transform = 'translateY(0)';
    }, 10);
}

// Giriş yap ve kayıt ol formları için validasyon
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('#loginModal form');
    const registerForm = document.querySelector('#registerModal form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form validasyonu yapılır
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (email && password) {
                // Başarılı giriş simülasyonu
                // Gerçek uygulamada API'ye istek gönderilir
                showAlert('Giriş başarılı!', 'success');
                
                // Modal'ı kapat
                const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                modal.hide();
                
                // Kullanıcı adını güncelle
                // document.querySelector('.user-name').textContent = email.split('@')[0];
                
                // Login butonunu profil butonuna çevir
                // updateNavForLoggedInUser(email);
            } else {
                showAlert('Lütfen tüm alanları doldurun', 'danger');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Form validasyonu
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const phone = document.getElementById('registerPhone').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const termsAccepted = document.getElementById('termsConditions').checked;
            
            if (!name || !email || !phone || !password || !passwordConfirm) {
                showAlert('Lütfen tüm alanları doldurun', 'danger');
                return;
            }
            
            if (password !== passwordConfirm) {
                showAlert('Şifreler eşleşmiyor', 'danger');
                return;
            }
            
            if (!termsAccepted) {
                showAlert('Kullanım şartlarını kabul etmelisiniz', 'warning');
                return;
            }
            
            // Başarılı kayıt simülasyonu
            // Gerçek uygulamada API'ye istek gönderilir
            showAlert('Kayıt başarılı! Hoş geldiniz ' + name, 'success');
            
            // Modal'ı kapat
            const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
            modal.hide();
            
            // Kullanıcıyı otomatik olarak giriş yap
            // updateNavForLoggedInUser(name);
        });
    }
}); 