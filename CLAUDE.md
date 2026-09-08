# BarberOS - Reglas de Desarrollo

## REGLA ESTRICTA DE GESTOR DE PAQUETES
- **pnpm es el ÚNICO gestor de paquetes permitido** para este proyecto.
- Cualquier instalación, ejecución o script debe correr con `pnpm`:
  - `pnpm dev`
  - `pnpm build`
  - `pnpm add <paquete>`
  - `pnpm add -D <paquete>`
  - `pnpm dlx <comando>` (en lugar de npx)
- Queda prohibido usar `npm`, `npx`, `yarn` o `bun` para instalar o ejecutar dependencias en `barber-saas`.

## ARQUITECTURA
- Multi-tenant por Slug (`/app/[slug]/...`, `/reservar/[slug]`, `/admin`).
- Base de datos y Auth con Supabase (@supabase/ssr).
- Aislamiento estricto de datos con RLS y `organization_id`.
