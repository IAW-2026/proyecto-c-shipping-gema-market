[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mVV06Hfm)
# shipping

Aplicación **Shipping** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión `<!-- completar -->`.

Esta app corresponde al módulo de envíos y logística en el proyecto de tipo **C (Marketplace)**.

## Estimación de días de entrega

Siempre sumamos 1 día por procesamiento administrativo. Después, por cada 8 horas de viaje sumamos 1 día de tránsito (máximo 5). Para rutas urbanas esto da unos 2 días; si en el futuro se manejan rutas más largas, la cuenta escala sola.

---

## Caché

**Sesión:** el `userId` interno se cachea en memoria con TTL de 30s para evitar llamar a `currentUser()` (Clerk API) en cada navegación.

- **Cache hit:** devuelve `userId` directo del Map — 0ms, sin Clerk API ni Prisma
- **Cache miss:** `auth()` → `currentUser()` (HTTP Clerk) → Prisma lookup → guarda en Map
- **TTL expirado:** próximo request refresca automáticamente
- **Mutaciones de admin:** limpian la entrada del caché vía `invalidateUserCache(clerkUserId)`

**Dólar (USD/ARS):** misma estrategia con TTL de 5 min — evita llamar a dolarapi.com en cada cotización. Ver `lib/services/exchange-rate/`.

---

Enunciado completo: <https://iaw-2026.github.io/proyecto/>
