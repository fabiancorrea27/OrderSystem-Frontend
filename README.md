# OrderSystem Frontend

Sistema de pedidos en línea construido con **React 19**, **TypeScript** y **Vite**. Se conecta a un backend en .NET para la gestión de autenticación, productos y pedidos.

## Stack

| Tecnología      | Detalle                        |
| --------------- | ------------------------------ |
| Framework       | React 19                       |
| Lenguaje        | TypeScript                     |
| Build tool      | Vite 8                         |
| Routing         | react-router-dom v7            |
| HTTP            | axios                          |
| Estilos         | CSS Modules                    |
| Proxy dev       | `/api` → `localhost:5108`      |

## Vistas del sistema

### 1. Login (`/login`)

Formulario de inicio de sesión con correo electrónico y contraseña. Al autenticarse, se almacena un **JWT** en `localStorage` y el usuario es redirigido a la página anterior o al catálogo.

- **Acceso**: Solo usuarios no autenticados (redirige al catálogo si ya hay sesión).
- **Test**: Incluye un aviso con la cuenta de administrador de prueba (`admin@example.com / Admin123!`).

### 2. Registro (`/register`)

Formulario de creación de cuenta con correo electrónico y contraseña (mín. 6 caracteres). Al registrarse exitosamente, redirige al login.

- **Acceso**: Solo usuarios no autenticados.

### 3. Catálogo de productos (`/catalog`) — Vista principal

Grilla de productos obtenidos desde `GET /api/products`. Cada producto muestra nombre, precio, stock y un botón para agregar al carrito.

- **Acceso**: Cualquier usuario autenticado.
- **Comportamiento**:
  - Productos sin stock aparecen atenuados y se ordenan al final.
  - Productos con stock bajo (≤ 12) muestran una advertencia.
  - Cada producto indica cuántas unidades de ese artículo hay actualmente en el carrito.

### 4. Carrito de compras (`/cart`)

Lista de productos agregados al carrito, persistida en `localStorage`. El usuario puede:

- Ajustar cantidades (más, menos, eliminar).
- Vaciar el carrito por completo.
- Realizar un pedido (`POST /api/orders`).

Tras confirmar el pedido, se muestra una pantalla de éxito con enlaces a **Mis pedidos** y al **Catálogo**.

- **Acceso**: Cualquier usuario autenticado.

### 5. Mis pedidos (`/orders`)

Lista de todos los pedidos del usuario autenticado obtenidos desde `GET /api/orders/my`. Cada pedido se muestra como un acordeón expandible que revela una tabla con:

- Nombre del producto, precio unitario, cantidad y subtotal.

- **Acceso**: Cualquier usuario autenticado.

### 6. Panel de administración (`/admin`)

Panel exclusivo para usuarios con rol **Admin**. Se divide en dos secciones:

1. **Crear producto** — Formulario para dar de alta un nuevo producto (nombre, precio, stock).
2. **Lista de productos existentes** — Tabla con todos los productos del sistema. Cada fila permite actualizar el stock de forma inline. Al final de la lista se muestra una alerta con los productos cuyo stock es bajo (≤ 12).

- **Acceso**: Solo usuarios con rol `Admin`. Usuarios no autenticados son redirigidos al login; usuarios autenticados sin rol Admin son redirigidos al catálogo.

### 7. Redirecciones

- **`/`** — Redirige automáticamente a `/catalog`.
- **`*` (cualquier ruta no definida)** — Redirige a `/catalog`.

## Control de acceso

| Componente guardia | Uso                                    | Comportamiento                                     |
| ------------------ | -------------------------------------- | -------------------------------------------------- |
| `RequireAuth`      | `/catalog`, `/cart`, `/orders`         | Redirige a `/login` si no hay sesión               |
| `RequireAdmin`     | `/admin`                               | Redirige a `/login` o `/catalog` según el caso     |
| `PublicRoute`      | `/login`, `/register`                  | Redirige a `/catalog` si ya hay sesión             |

## Barra de navegación

La `Navbar` se adapta según el estado de autenticación y el rol:

| Estado               | Enlaces visibles                                              |
| -------------------- | ------------------------------------------------------------- |
| No autenticado       | Iniciar sesión · Registrarse                                  |
| Usuario estándar     | Catálogo · Mis pedidos · Email · Carrito · Salir             |
| Usuario administrador | Catálogo · Mis pedidos · Admin · Email (badge Admin) · Carrito · Salir |

## Scripts disponibles

```bash
npm run dev      # Inicia servidor de desarrollo en localhost:5173
npm run build    # Compila para producción
npm run preview  # Previsualiza la build de producción
npm run lint     # Ejecuta ESLint
```

## Variables de entorno

| Variable        | Descripción                        | Valor por defecto     |
| --------------- | ---------------------------------- | --------------------- |
| `VITE_API_URL`  | URL base del backend (no definida) | — (usa el proxy `/api`) |

El proxy de Vite redirige las peticiones `/api` a `http://localhost:5108` en desarrollo.
