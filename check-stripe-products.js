require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

async function checkStripeProducts() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ Error: STRIPE_SECRET_KEY no encontrada');
      return;
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });

    console.log('🔍 Buscando productos en Stripe...\n');

    // Obtener todos los productos (activos e inactivos)
    const allProducts = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price']
    });

    const activeProducts = allProducts.data.filter(p => p.active);
    const inactiveProducts = allProducts.data.filter(p => !p.active);

    // Mostrar productos activos
    console.log('✅ PRODUCTOS ACTIVOS:', activeProducts.length);
    console.log('====================');
    activeProducts.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      if (product.default_price) {
        const price = product.default_price;
        console.log(`   Precio: ${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`);
        console.log(`   Price ID: ${price.id}`);
      }
      console.log(`   Creado: ${new Date(product.created * 1000).toLocaleString()}`);
      if (product.description) {
        console.log(`   Descripción: ${product.description}`);
      }
    });

    // Mostrar productos inactivos
    if (inactiveProducts.length > 0) {
      console.log('\n❌ PRODUCTOS INACTIVOS:', inactiveProducts.length);
      console.log('=====================');
      inactiveProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name}`);
        console.log(`   ID: ${product.id}`);
        if (product.default_price) {
          const price = product.default_price;
          console.log(`   Precio: ${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`);
          console.log(`   Price ID: ${price.id}`);
        }
        console.log(`   Creado: ${new Date(product.created * 1000).toLocaleString()}`);
      });
    }

    // Obtener todos los precios
    console.log('\n💰 PRECIOS CONFIGURADOS');
    console.log('=====================');
    const prices = await stripe.prices.list({
      limit: 100,
      expand: ['data.product']
    });

    prices.data.forEach((price, index) => {
      const productName = price.product.name || 'Producto eliminado';
      console.log(`\n${index + 1}. ${productName}`);
      console.log(`   Price ID: ${price.id}`);
      console.log(`   Precio: ${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`);
      console.log(`   Activo: ${price.active ? '✅' : '❌'}`);
      console.log(`   Creado: ${new Date(price.created * 1000).toLocaleString()}`);
    });

    // Mostrar webhooks configurados
    console.log('\n🔔 WEBHOOKS CONFIGURADOS');
    console.log('=====================');
    const webhooks = await stripe.webhookEndpoints.list();
    webhooks.data.forEach((webhook, index) => {
      console.log(`\n${index + 1}. URL: ${webhook.url}`);
      console.log(`   Eventos: ${webhook.enabled_events.join(', ')}`);
      console.log(`   Activo: ${webhook.status === 'enabled' ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('La clave de API no es válida o no tiene los permisos necesarios.');
    }
  }
}

checkStripeProducts();
