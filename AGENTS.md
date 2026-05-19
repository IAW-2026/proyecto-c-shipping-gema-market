<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:clerk-core3 -->
# Clerk v7 usa Core 3 API (NO Core 2)

- `signIn.create({ identifier, password })` ya NO funciona → retorna 422.
- Usar `signIn.password({ emailAddress, password })` en su lugar.
- El patrón de error no es `try/catch` sino `{ error }` en el return.
- `finalize()` puede retornar `{ error }`, verificar siempre.
- No existe `needs_first_factor` con `password` strategy; password ES el first factor.

Ejemplo:
```typescript
const { error } = await signIn.password({ emailAddress, password });
if (error) { /* handle */ return; }
if (signIn.status === "complete") {
  const { error: finalizeError } = await signIn.finalize();
  if (finalizeError) { /* handle */ return; }
  router.push("/dashboard");
}
```
<!-- END:clerk-core3 -->
