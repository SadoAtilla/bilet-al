const amqp = require('amqplib');
const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

async function startConsumer() {
  try {
    const conn = await amqp.connect(amqpUrl);
    const channel = await conn.createChannel();
    const queue = 'ticket_purchased';
    await channel.assertQueue(queue, { durable: false });
    console.log('Notification Service: ticket_purchased kuyruğu dinleniyor...');
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());
        console.log(`Bilet satın alındı! Kullanıcı: ${data.user}, BookingID: ${data.bookingId}, Fiyat: ${data.totalPrice} TL, Yolcu sayısı: ${data.passengers.length}`);
        // Burada gerçek e-posta/sms göndermek yerine loglamak yeterli
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('RabbitMQ consumer başlatılamadı:', err);
  }
}

startConsumer(); 