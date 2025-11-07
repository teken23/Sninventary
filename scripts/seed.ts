import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Camila24', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      username: 'admin',
      name: 'Administrador',
      password: hashedPassword,
    },
  });

  console.log('Admin user created:', admin.email);

  // Create currency config
  const currency = await prisma.currencyConfig.upsert({
    where: { id: 'default' },
    update: { usdToDOP: 58.5 },
    create: {
      id: 'default',
      usdToDOP: 58.5,
    },
  });

  console.log('Currency config created:', currency.usdToDOP);

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Crema Hidratante Corporal - Lavanda',
        description: 'Crema hidratante con aroma a lavanda, 250ml',
        category: 'cremas corporales',
        priceDOP: 350,
        costUSD: 4.5,
        stock: 25,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Crema Exfoliante - Coco',
        description: 'Crema exfoliante con aroma a coco, 200ml',
        category: 'cremas corporales',
        priceDOP: 400,
        costUSD: 5.0,
        stock: 15,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jabón Artesanal - Miel y Avena',
        description: 'Jabón natural con miel y avena, 100g',
        category: 'jabones de baño',
        priceDOP: 150,
        costUSD: 2.0,
        stock: 50,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jabón Exfoliante - Café',
        description: 'Jabón exfoliante con café molido, 100g',
        category: 'jabones de baño',
        priceDOP: 180,
        costUSD: 2.5,
        stock: 1,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Crema de Manos - Aloe Vera',
        description: 'Crema nutritiva para manos, 100ml',
        category: 'cremas corporales',
        priceDOP: 250,
        costUSD: 3.5,
        stock: 0,
      },
    }),
  ]);

  console.log('Products created:', products.length);

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'María García',
        phone: '809-555-0101',
        email: 'maria@example.com',
        address: 'Santo Domingo, DN',
        balance: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Juan Pérez',
        phone: '809-555-0102',
        email: 'juan@example.com',
        address: 'Santiago, RD',
        balance: 500,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Ana Rodríguez',
        phone: '809-555-0103',
        address: 'La Romana, RD',
        balance: 0,
      },
    }),
  ]);

  console.log('Customers created:', customers.length);

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      customerId: customers[0].id,
      status: 'Pendiente de preparar',
      totalDOP: 700,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 2,
            priceDOP: products[0].priceDOP,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now() + 1}`,
      customerId: customers[1].id,
      status: 'Listo para enviar',
      totalDOP: 600,
      items: {
        create: [
          {
            productId: products[2].id,
            quantity: 4,
            priceDOP: products[2].priceDOP,
          },
        ],
      },
    },
  });

  console.log('Orders created: 2');

  // Create invoice
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${Date.now()}`,
      orderId: order2.id,
      customerId: customers[1].id,
      totalDOP: 600,
      paymentMethod: 'credito',
      paidAmount: 100,
      balanceDue: 500,
    },
  });

  console.log('Invoice created:', invoice1.invoiceNumber);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
