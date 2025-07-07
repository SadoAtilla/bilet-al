# Node.js 18 tabanlı resmi imajı kullan
FROM node:18

# Çalışma dizinini ayarla
WORKDIR /app

# package.json ve package-lock.json'u kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Tüm backend dosyalarını kopyala
COPY . .

# Uygulamanın dışarıya açılacak portu
EXPOSE 5000

# Sunucuyu başlat
CMD ["npm", "start"] 