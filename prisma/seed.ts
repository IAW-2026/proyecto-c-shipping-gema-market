import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function ulid(): string {
  const timestamp = Date.now().toString(36).padStart(10, "0").slice(-10);
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  return (timestamp + random).toLowerCase();
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function seed() {
  console.log("Seeding database...");

  // ── 0. Limpiar datos existentes (evita conflictos de unique) ──
  await prisma.envio.deleteMany();
  await prisma.cotizacion.deleteMany();
  await prisma.tarifa.deleteMany();
  await prisma.usuario.deleteMany();
  console.log("  ✓ Datos anteriores eliminados");

  // ── 1. Usuarios mock (para desarrollo con BYPASS_RBAC) ──
  await prisma.usuario.upsert({
    where: { id: "usr_mock" },
    update: {},
    create: {
      id: "usr_mock",
      clerk_user_id: "mock_clerk",
      email: "operador@example.com",
      full_name: "Gema Logística",
      role: "logistics",
    },
  });

  // Segundo repartidor — sus envíos NO deben aparecer para usr_mock
  await prisma.usuario.upsert({
    where: { id: "usr_other_operator" },
    update: {},
    create: {
      id: "usr_other_operator",
      clerk_user_id: "other_clerk",
      email: "otro@example.com",
      full_name: "Otro Repartidor",
      role: "logistics",
    },
  });

  // Repartidor real (Emiliano) — sus envíos aparecen con autenticación real
  await prisma.usuario.upsert({
    where: { id: "usr_01KRC9N1MKHHJMXYRN451BAED6" },
    update: {},
    create: {
      id: "usr_01KRC9N1MKHHJMXYRN451BAED6",
      clerk_user_id: "user_3Dakc3wkQnXR4ORgFyKIGB6sbhj",
      email: "emilianosensini@gmail.com",
      full_name: "Emiliano Sensini",
      role: "logistics",
    },
  });

  // ── 2. Envíos en distintos estados ──
  const envios = [
    // Envíos asignados a usr_mock (debe verlos)
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Carlos García",
      receiver_phone: "+54 11 5555-0101",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_mock",
      weight: 2.5,
      dimensions: { width: 30, height: 20, depth: 15 },
      pickup_address: {
        street: "Avenida Leandro N. Alem",
        number: "1253",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Alsina",
        number: "65",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "pending_pickup",
      price: 4500.0,
      created_at: daysAgo(0),
    },
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "María López",
      receiver_phone: "+54 11 5555-0202",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_mock",
      weight: 5.0,
      dimensions: { width: 40, height: 30, depth: 20 },
      pickup_address: {
        street: "Estomba",
        number: "14",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Chiclana",
        number: "209",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "in_transit",
      price: 6200.0,
      picked_up_at: daysAgo(1),
      created_at: daysAgo(2),
    },
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Juan Pérez",
      receiver_phone: "+54 11 5555-0303",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_mock",
      weight: 1.2,
      dimensions: { width: 20, height: 15, depth: 10 },
      pickup_address: {
        street: "Vieytes",
        number: "350",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "O'Higgins",
        number: "42",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "delivered",
      price: 3200.0,
      picked_up_at: daysAgo(5),
      delivered_at: daysAgo(4),
      created_at: daysAgo(7),
    },
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Ana Martínez",
      receiver_phone: "+54 11 5555-0404",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: null,
      weight: 3.8,
      dimensions: { width: 35, height: 25, depth: 18 },
      pickup_address: {
        street: "Sarmiento",
        number: "117",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Avenida Colón",
        number: "250",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "pending_pickup",
      price: 5100.0,
      created_at: daysAgo(1),
    },
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Pedro Rodríguez",
      receiver_phone: "+54 11 5555-0505",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_mock",
      weight: 10.0,
      dimensions: { width: 50, height: 40, depth: 30 },
      pickup_address: {
        street: "Zapiola",
        number: "430",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Brown",
        number: "170",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "failed",
      price: 8900.0,
      picked_up_at: daysAgo(3),
      created_at: daysAgo(4),
    },

    // Envíos asignados a OTRO repartidor — NO deben aparecer para usr_mock
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Laura Fernández",
      receiver_phone: "+54 11 5555-0606",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_other_operator",
      weight: 6.0,
      dimensions: { width: 45, height: 30, depth: 25 },
      pickup_address: {
        street: "Rivadavia",
        number: "315",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Mitre",
        number: "240",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "in_transit",
      price: 7200.0,
      picked_up_at: daysAgo(1),
      created_at: daysAgo(3),
    },
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Diego Sánchez",
      receiver_phone: "+54 11 5555-0707",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_other_operator",
      weight: 2.0,
      dimensions: { width: 25, height: 15, depth: 10 },
      pickup_address: {
        street: "Avenida Cerri",
        number: "750",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Don Bosco",
        number: "1200",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "delivered",
      price: 2800.0,
      picked_up_at: daysAgo(8),
      delivered_at: daysAgo(7),
      created_at: daysAgo(10),
    },

    // Envíos asignados a Emiliano (usr_01KRC...) — aparecen con su autenticación real
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Sofía Torres",
      receiver_phone: "+54 11 5555-0808",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_01KRC9N1MKHHJMXYRN451BAED6",
      weight: 3.2,
      dimensions: { width: 35, height: 25, depth: 12 },
      pickup_address: {
        street: "San Martín",
        number: "250",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Belgrano",
        number: "150",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "pending_pickup",
      price: 3800.0,
      created_at: daysAgo(0),
    },
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Martín Díaz",
      receiver_phone: "+54 11 5555-0909",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_01KRC9N1MKHHJMXYRN451BAED6",
      weight: 7.5,
      dimensions: { width: 60, height: 40, depth: 30 },
      pickup_address: {
        street: "Blandengues",
        number: "300",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Castelli",
        number: "500",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "in_transit",
      price: 10500.0,
      picked_up_at: daysAgo(1),
      created_at: daysAgo(2),
    },
    {
      id: "shp_" + ulid().slice(0, 27),
      order_id: "ord_" + ulid().slice(0, 27),
      quote_id: "qte_" + ulid().slice(0, 27),
      buyer_id: "usr_" + ulid().slice(0, 27),
      receiver_name: "Valentina Ruiz",
      receiver_phone: "+54 11 5555-1010",
      seller_id: "usr_" + ulid().slice(0, 27),
      logistics_id: "usr_01KRC9N1MKHHJMXYRN451BAED6",
      weight: 1.8,
      dimensions: { width: 25, height: 18, depth: 10 },
      pickup_address: {
        street: "Güemes",
        number: "800",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      delivery_address: {
        street: "Fuerte Argentino",
        number: "450",
        zip: "B8000",
        city: "Bahía Blanca",
      },
      tracking_code: "GEMA-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      status: "delivered",
      price: 2500.0,
      picked_up_at: daysAgo(4),
      delivered_at: daysAgo(3),
      created_at: daysAgo(6),
    },
  ];

  for (const envio of envios) {
    await prisma.envio.upsert({
      where: { id: envio.id },
      update: {},
      create: envio,
    });
    console.log(`  ✓ Envío ${envio.tracking_code} (${envio.status})`);
  }

  // ── 3. Tarifas ──
  const tarifas = [
    {
      id: "trf_" + ulid().slice(0, 27),
      weight_range: { min: 0, max: 2 },
      volume_range: { min: 0, max: 0.01 },
      price_per_km: 150.0,
    },
    {
      id: "trf_" + ulid().slice(0, 27),
      weight_range: { min: 2, max: 5 },
      volume_range: { min: 0.01, max: 0.05 },
      price_per_km: 200.0,
    },
    {
      id: "trf_" + ulid().slice(0, 27),
      weight_range: { min: 5, max: 20 },
      volume_range: { min: 0.05, max: 0.2 },
      price_per_km: 350.0,
    },
  ];

  for (const tarifa of tarifas) {
    await prisma.tarifa.upsert({
      where: { id: tarifa.id },
      update: {},
      create: tarifa,
    });
    console.log(`  ✓ Tarifa ${tarifa.id}`);
  }

  // ── 4. Cotizaciones ──
  const cotizaciones = [
    {
      id: "qte_" + ulid().slice(0, 27),
      product_id: "prod_abc123",
      status: "available",
      package_details: { weight: 1.5, width: 20, height: 15, depth: 10, unit: "kg/cm" },
      origin_address: {
        street: "Av. Córdoba",
        number: "2500",
        zip: "C1120AAR",
      },
      destination_address: {
        street: "Av. Pueyrredón",
        number: "1800",
        zip: "C1119AAR",
      },
      price: 2500.0,
      currency: "ARS",
      estimated_days: 3,
      valid_until: daysAgo(-7),
    },
    {
      id: "qte_" + ulid().slice(0, 27),
      product_id: "prod_def456",
      status: "reserved",
      reserved_for_order_id: "ord_test123",
      package_details: { weight: 4.0, width: 40, height: 30, depth: 20, unit: "kg/cm" },
      origin_address: {
        street: "Av. Scalabrini Ortiz",
        number: "3200",
        zip: "C1425DCM",
      },
      destination_address: {
        street: "Av. San Juan",
        number: "1500",
        zip: "C1234AAR",
      },
      price: 4800.0,
      currency: "ARS",
      estimated_days: 5,
      valid_until: daysAgo(-3),
    },
  ];

  for (const q of cotizaciones) {
    await prisma.cotizacion.upsert({
      where: { id: q.id },
      update: {},
      create: q,
    });
    console.log(`  ✓ Cotización ${q.id}`);
  }

  console.log("\n✅ Seed completado exitosamente.");
}

seed()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
