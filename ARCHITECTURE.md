## Arquitectura de Wikipedia Knowledge Explorer

Este documento describe la arquitectura general del proyecto, la organización del código y las principales decisiones de diseño tomadas para cumplir con los requisitos de la prueba técnica.

---

## Visión general

La aplicación está compuesta por dos servicios principales:

- **Backend** (`backend/`): API REST construida con FastAPI, responsable de:
  - Integrarse con la API pública de Wikipedia.
  - Procesar y analizar el contenido de los artículos.
  - Gestionar usuarios y artículos guardados en una base de datos PostgreSQL.
  - Exponer endpoints HTTP para que el frontend los consuma.

- **Frontend** (`frontend/`): aplicación web construida con Next.js (App Router) y TypeScript, responsable de:
  - Proveer la interfaz de usuario para búsqueda, exploración y gestión de artículos.
  - Manejar autenticación en el cliente y rutas protegidas.
  - Consumir la API del backend.

La comunicación entre frontend y backend se realiza vía HTTP/JSON. En entorno Docker, el frontend se comunica con el backend a través del hostname `wikipedia-backend` dentro de la red de Docker (ver `compose.yml`).

---

## Backend

### Stack y librerías clave

- **FastAPI**: framework principal para la API.
- **SQLModel**: modelo de datos y ORM sobre SQLAlchemy, integrada con PostgreSQL.
- **PostgreSQL**: base de datos relacional para usuarios y artículos guardados.
- **HTTPX**: cliente HTTP asíncrono para consumir la API de Wikipedia.
- **Alembic**: gestión de migraciones de base de datos.
- **pytest / pytest-asyncio**: pruebas unitarias y de integración ligeras.

### Organización de módulos

Estructura simplificada:

- `main.py`
  - Punto de entrada de la aplicación FastAPI. Crea la instancia de `app` a partir de `core.create_app`.

- `core/`
  - `config.py`: configuración de la aplicación (variables de entorno, URLs externas, parámetros de tiempo de espera, etc.).
  - `create_app.py`: función que crea y configura la instancia de FastAPI (rutas, middlewares, etc.).
  - `logging.py`: configuración de logging (si aplica).

- `database/`
  - `session.py`: creación del engine y sesión de base de datos.
  - `models/`
    - `users.py`: modelo de usuario.
    - `saved_article.py`: modelo para artículos guardados.

- `features/`
  - Arquitectura **orientada a features**, agrupando lógica por dominio:

    - `features/search/`
      - `routes.py`: endpoint `GET /search`.
      - `controllers.py`: orquestación entre capa HTTP y servicios.
      - `services.py`: integración con la API de Wikipedia para búsquedas.
      - `schemas.py`: modelos Pydantic para la respuesta (`SearchResult`).

    - `features/articles/`
      - `routes.py`: endpoint `GET /articles/{id}`.
      - `controllers.py`: lógica de validación de parámetros, gestión de errores y ensamblado de la respuesta.
      - `services.py`: funciones de integración con Wikipedia y análisis de texto (normalización, conteo de palabras, top words).
      - `schemas.py`: modelo Pydantic `ArticleDetail`.

    - `features/saved_articles/`
      - `routes.py`: endpoints `POST /saved_articles`, `GET /saved_articles`, `DELETE /saved_articles/{id}`.
      - `controllers.py`: validación y orquestación entre sesión de DB, usuario autenticado y servicios.
      - `services.py`: acceso a la base de datos (crear, listar y eliminar artículos guardados).
      - `schemas.py`: modelos `SavedArticleCreate` y `SavedArticleRead`.

    - `features/auth/`
      - `routes.py`, `services.py`, `schemas.py`, `dependencies.py`: autenticación y gestión de usuarios (no detallado en la prueba original, pero añadido para proteger endpoints).

- `middlewares/`
  - `exception_handler.py`: middleware/handlers de errores personalizados.

- `migrations/`
  - Configuración de Alembic y scripts de migración para tablas de usuarios y artículos guardados.

### Modelado de datos

- **Usuarios** (`Users`)
  - Tabla de usuarios con credenciales y metadatos necesarios para autenticación.

- **Artículos guardados** (`SavedArticle`)
  - Campos principales:
    - `id` (PK)
    - `user_id` (FK a `Users`)
    - `title`
    - `wikipedia_id`
    - `url`
    - `summary`
    - `deleted_at` (para borrado lógico)

#### Decisión: borrado lógico (soft delete)

En lugar de eliminar registros definitivamente, se utiliza un campo `deleted_at`:

- Ventajas:
  - Permite auditoría y recuperación de datos si fuera necesario.
  - Evita problemas de integridad referencial si se añaden relaciones futuras.
- Implementación:
  - Los listados (`list_saved_articles`) filtran por `deleted_at is None`.
  - El endpoint de borrado marca `deleted_at` con la fecha actual.

### Integración con Wikipedia

- Se usa la API de Wikipedia en dos contextos:
  1. **Búsqueda** (`features/search.services.search_wikipedia`):
     - Llama al endpoint de búsqueda de Wikipedia con el término `q`.
     - Limpia el HTML de los snippets mediante expresiones regulares.
     - Mapea los resultados a objetos `SearchResult` con `id`, `title`, `snippet`.

  2. **Detalle de artículo** (`features.articles.services.get_article_from_wikipedia`):
     - Usa el `pageid` para obtener el extracto en texto plano (`explaintext=1`).
     - Construye una URL amigable al artículo en Wikipedia.
     - Lanza una excepción específica (`ArticleNotFoundError`) cuando la página no existe o no tiene extracto.

### Análisis de texto

El análisis de contenido se mantiene **intencionalmente simple y determinista**:

- Normalización y limpieza:
  - Normalización Unicode (formas canónicas y compatibilidad).
  - Conversión a minúsculas.
  - Eliminación de marcas diacríticas (acentos) en la medida de lo posible.
  - Colapsado de espacios en blanco.

- Tokenización:
  - Uso de una expresión regular centrada en letras ASCII (`[a-z]+`), adecuada para texto principalmente en inglés.

- Stopwords:
  - Conjunto fijo de stopwords en inglés (`the`, `a`, `is`, `of`, etc.).

- Métricas:
  - **`word_count`**: número total de tokens tras normalización y filtrado de stopwords.
  - **`top_words`**: palabras más frecuentes, ordenadas por frecuencia descendente y limitadas a un número configurable.

- Resumen:
  - El resumen se construye recortando el extracto original a un máximo de 500 caracteres, respetando el límite de palabra para no cortar a mitad.

#### Motivación de este enfoque

- Suficiente para la prueba técnica: aporta valor (conteo, top words, resumen) sin introducir dependencias pesadas (NLP compleja, modelos estadísticos).
- Fácil de probar y mantener.
- Independiente del idioma a nivel de infraestructura, aunque el conjunto de stopwords actual está pensado para texto en inglés.

### Autenticación y seguridad

A nivel de backend:

- Los endpoints de artículos guardados (`/saved_articles`) están protegidos y requieren un usuario autenticado (`get_current_user`).
- La implementación concreta de registro/login (tokens, hashing de contraseñas, etc.) se encapsula en `features/auth/*`.

Decisión:

- Proveer un mínimo de seguridad que permita cumplir el requisito de “Mis artículos guardados por usuario” sin convertir la prueba en un ejercicio de identidad y acceso completo.

---

## Frontend

### Stack y organización

- **Next.js (App Router)** con TypeScript.
- Arquitectura también **orientada a features**:

  - `app/`
    - `page.tsx`: página principal de búsqueda y listado de artículos guardados.
    - `articles/[id]/page.tsx`: página de detalle de un artículo.
    - `login/page.tsx`, `register/page.tsx`: pantallas de autenticación.
    - `layout.tsx`: layout raíz.

  - `features/search/`
    - `components/SearchBar.tsx`: componente de barra de búsqueda.
    - `components/SearchResults.tsx`: listado y estado de resultados.
    - `services/index.ts`: cliente para consumir el endpoint `/search`.

  - `features/articles/`
    - `services/index.ts`: cliente para `/articles/{id}`.

  - `features/saved_articles/`
    - `services/index.ts`: clientes para `/saved_articles` (listar, crear, eliminar).

  - `features/auth/`
    - `components/LoginForm.tsx`, `components/RegisterForm.tsx`.
    - `ProtectedRoute.tsx`: envoltorio para proteger rutas solo para usuarios autenticados.
    - `schemas/`: validaciones de formularios con Zod u otro esquema (según el código).

  - `features/shared/components/ui/`
    - Componentes UI reutilizables (botones, inputs, cards, etc.), basados en clases tipo Tailwind.

  - `contexts/AuthContext.tsx`
    - Contexto de autenticación para el frontend, gestión de sesión del usuario, logout, etc.

  - `lib/`
    - `api.ts`: cliente HTTP base para llamar a la API del backend (gestiona `NEXT_PUBLIC_API_BASE_URL`).
    - `auth.ts`: utilidades relacionadas con autenticación en el cliente.

### Flujo principal de usuario

1. **Autenticación**
   - El usuario se registra o inicia sesión.
   - El contexto de autenticación guarda el estado (tokens, usuario actual, etc.).
   - `ProtectedRoute` redirige a login si el usuario no está autenticado.

2. **Página principal**
   - El usuario ve:
     - Barra de búsqueda en el header.
     - Sección “Saved articles” (artículos guardados del usuario actual).
   - Acciones:
     - Escribir una consulta y lanzar la búsqueda.
     - Navegar a un artículo guardado (link a `/articles/{wikipedia_id}`).
     - Eliminar un artículo guardado.

3. **Búsqueda**
   - La barra de búsqueda llama a `searchArticles`, que usa `lib/api.ts` para hacer `GET /search?q=...`.
   - La UI muestra:
     - Estado de carga (“Loading…”).
     - Mensajes de error si la llamada falla.
     - Lista de resultados con enlace al detalle del artículo.

4. **Detalle de artículo**
   - La página `/articles/[id]` obtiene el `id` de la URL.
   - Llama a `getArticle(id)` para consumir `GET /articles/{id}`.
   - Muestra:
     - Título, resumen, conteo de palabras y top words.
     - Botón para guardar el artículo (`saveArticle` → `POST /saved_articles`).
     - Enlace “Read on Wikipedia” apuntando a `wikipedia_url`.

5. **Gestión de artículos guardados**
   - La página principal llama `getSavedArticles` al cargarse.
   - Mostrar:
     - Lista de artículos guardados con título y resumen.
     - Botón “Remove” que llama `deleteSavedArticle(id)` → `DELETE /saved_articles/{id}`.

### Diseño y UX

- Uso de Tailwind para:
  - Layout responsivo (`max-w-3xl`, paddings en breakpoints, etc.).
  - Soporte de modo oscuro mediante clases `dark:`.
  - Componentes reutilizables estilo “design system” ligero (`Button`, `Input`, `Card`, `Label`, etc.).

- Manejo explícito de estados:
  - **Loading**, **Error** y **Empty state** para:
    - Resultados de búsqueda.
    - Lista de artículos guardados.
    - Carga de detalle de artículo.

---

## Infraestructura y despliegue

### Docker y Docker Compose

- **Backend**:
  - Imagen basada en `python:3.13-slim`.
  - Uso de `uv` para gestionar dependencias en un entorno virtual (`/venv`).
  - Fase de *builder* para instalar dependencias y fase de *runtime* ligera.
  - Expone el puerto `8000` y ejecuta `uvicorn main:app`.

- **Frontend**:
  - Multi-stage build con Node 22 en Alpine.
  - Fase de dependencias (`deps`) para instalar `node_modules` con `pnpm`.
  - Fase de build (`builder`) que genera la app Next.js compilada.
  - Fase de runtime (`runner`) que sirve la app en modo producción.
  - Expone el puerto `3000`.

- **Compose (`compose.yml`)**:
  - Define servicios `backend` y `frontend`.
  - Usa una red bridge `wikipedia-network`.
  - Mapea:
    - `backend:8000 -> localhost:8000`
    - `frontend:3000 -> localhost:3000`
  - Inyecta `NEXT_PUBLIC_API_BASE_URL=http://wikipedia-backend:8000` al frontend.

### Decisiones clave

- **Separación estricta de responsabilidades**:
  - Backend centrado en lógica de negocio, persistencia y comunicación con Wikipedia.
  - Frontend centrado en presentación, UX y consumo de la API.

- **Arquitectura orientada a features**:
  - Favorece el encapsulamiento de lógica por dominio (`search`, `articles`, `saved_articles`, `auth`) en lugar de por capas puras (controllers/services/etc. dispersos).
  - Facilita la escalabilidad incremental de cada feature.

- **Simplicidad en el análisis de texto**:
  - Evitar sobre-ingeniería y mantener el foco en la integración y el modelado de datos.

- **Uso de Docker**:
  - Hacer trivial la ejecución del proyecto en entornos distintos (local, CI, etc.).
  - Proveer una experiencia de “levantar y usar” para evaluadores de la prueba.

---

## Posibles extensiones futuras

Algunas mejoras que se podrían incorporar fácilmente sobre esta base:

- Añadir **Redis** para cachear respuestas frecuentes de Wikipedia y reducir latencia.
- Incorporar un sistema de **workers en background** (por ejemplo, Celery, RQ o Dramatiq) para análisis más costosos o precálculo de métricas.
- Internacionalización del frontend (i18n) y manejo explícito de stopwords en otros idiomas.
- Métricas y trazas (Prometheus, OpenTelemetry) para monitorizar uso y rendimiento.

