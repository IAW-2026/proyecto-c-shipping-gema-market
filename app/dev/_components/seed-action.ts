"use server";

import { seedDatabase } from "@/lib/db/mutations/dev/seed";

export async function seedAction() {
    try {
        const result = await seedDatabase();
        return { success: true, message: result.message };
    } catch (error) {
        console.error("[SEED ACTION] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al seedear",
        };
    }
}
