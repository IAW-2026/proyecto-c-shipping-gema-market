import prisma from "@/lib/db/prisma";

export async function getUsers() {
    const users = await prisma.user.findMany({
        orderBy: { created_at: "desc" },
    });

    return users.map((u) => ({
        id: u.id,
        clerk_user_id: u.clerk_user_id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        banned: u.banned,
        created_at: u.created_at.toISOString(),
    }));
}

export async function getShipments() {
    const shipments = await prisma.shipment.findMany({
        orderBy: { created_at: "desc" },
        take: 100,
    });

    return shipments.map((s) => ({
        id: s.id,
        order_id: s.order_id,
        tracking_code: s.tracking_code,
        status: s.status,
        logistics_id: s.logistics_id ?? null,
        price: Number(s.price),
        weight: Number(s.weight),
        created_at: s.created_at.toISOString(),
        delivered_at: s.delivered_at?.toISOString() ?? null,
    }));
}

export async function getRates() {
    const rates = await prisma.rate.findMany({
        orderBy: { price_per_km: "asc" },
    });

    return rates.map((r) => ({
        id: r.id,
        weight_range: `${(r.weight_range as { min: number; max: number }).min} - ${(r.weight_range as { min: number; max: number }).max} kg`,
        price_per_km: Number(r.price_per_km),
    }));
}

export async function getTrackingSequence() {
    const sequences = await prisma.trackingSequence.findMany({
        orderBy: { year: "desc" },
    });

    return sequences.map((s) => ({
        year: s.year,
        last_number: s.last_number,
    }));
}
