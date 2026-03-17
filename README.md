## Wikipedia Knowledge Explorer

Aplicación web **Full Stack** para explorar artículos de Wikipedia, obtener un análisis básico de su contenido y gestionar una lista personal de artículos guardados.

- **Backend**: FastAPI, SQLModel, PostgreSQL, HTTPX  
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS  
- **Infra**: Docker, Docker Compose

---

## Requisitos previos

- Docker y Docker Compose instalados  
  - `docker --version`  
  - `docker compose version`
- (Opcional, para ejecutar sin Docker)
  - Python **>= 3.11**
  - Node.js **>= 20** (se usa Node 22 en Docker)
  - `pnpm` (recomendado) o `npm`

---

## Correr el proyecto con Docker Compose (recomendado)

Desde la raíz del repositorio:

```bash
docker compose up --build
```

Servicios:

- **Backend**: `http://localhost:8000`
  - Documentación interactiva de la API: `http://localhost:8000/docs`
- **Frontend**: `http://localhost:3000`

Variables de entorno:

- Backend: `backend/.env` (opcional; ver `backend/README.md` para `DATABASE_URL` y otros ajustes).
- Frontend: `frontend/.env` (por defecto se utiliza `NEXT_PUBLIC_API_BASE_URL` del `compose.yml` apuntando a `http://wikipedia-backend:8000` dentro de la red de Docker).

Para detener los servicios:

```bash
docker compose down
```

---

## Ejecución sin Docker

### 1. Backend

Desde `backend/`:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # En Windows: .venv\Scripts\activate
pip install uv
uv sync
```

Configura la base de datos (PostgreSQL):

- Crea una base de datos, por ejemplo: `wikipedia_knowledge_explorer`
- Define la variable de entorno `DATABASE_URL`, por ejemplo:

```bash
export DATABASE_URL="postgresql+psycopg://postgres:postgres@localhost:5432/wikipedia_knowledge_explorer"
```

Aplica migraciones (si corresponde):

```bash
alembic upgrade head
```

Ejecuta el servidor:

```bash
uvicorn backend.main:app --reload
```

Por defecto correrá en `http://localhost:8000`.

### 2. Frontend

Desde `frontend/`:

```bash
cd frontend
pnpm install
```

Asegúrate de que la URL de la API apunte al backend local, por ejemplo en `frontend/.env`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Inicia el servidor de desarrollo:

```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## Endpoints principales de la API

Todos los endpoints asumen una base `http://localhost:8000`.

- **Búsqueda de artículos**
  - **Método**: `GET`
  - **Ruta**: `/search`
  - **Query params**:
    - `q` (string, obligatorio): término de búsqueda en Wikipedia.
  - **Respuesta (ejemplo)**:

    ```json
    [
      {
        "id": "123",
        "title": "Python (lenguaje de programación)",
        "snippet": "Python es un lenguaje de programación de alto nivel..."
      }
    ]
    ```

- **Detalle y análisis de un artículo**
  - **Método**: `GET`
  - **Ruta**: `/articles/{id}`
  - **Descripción**: Obtiene el contenido del artículo por `pageid` de Wikipedia, genera un resumen y análisis básico del texto.
  - **Respuesta (ejemplo)**:

    ```json
    {
      "title": "Python",
      "summary": "Python es un lenguaje de programación de alto nivel...",
      "word_count": 1200,
      "top_words": ["python", "lenguaje", "programacion"],
      "wikipedia_url": "https://wikipedia.org/..."
    }
    ```

- **Artículos guardados**  
  Estos endpoints requieren autenticación (el backend gestiona los artículos guardados por usuario).

  - **Crear artículo guardado**
    - **Método**: `POST`
    - **Ruta**: `/saved_articles`
    - **Body**:

      ```json
      {
        "title": "Python",
        "wikipedia_id": "123",
        "url": "https://wikipedia.org/...",
        "summary": "..."
      }
      ```

  - **Listar artículos guardados**
    - **Método**: `GET`
    - **Ruta**: `/saved_articles`

  - **Eliminar artículo guardado**
    - **Método**: `DELETE`
    - **Ruta**: `/saved_articles/{id}`

Para más detalles (incluyendo esquemas completos y errores), puedes consultar `http://localhost:8000/docs`.

---

## Interfaz de usuario (frontend)

La aplicación ofrece:

- **Página principal**
  - Barra de búsqueda para consultar artículos de Wikipedia.
  - Lista de resultados de búsqueda.
  - Sección “Mis artículos guardados” con posibilidad de navegar al detalle y eliminar artículos.
- **Página de detalle de artículo**
  - Título, resumen, conteo de palabras y palabras más frecuentes.
  - Enlace directo al artículo original en Wikipedia.
  - Botón para guardar el artículo en la lista personal.
- **Autenticación**
  - Rutas protegidas para las vistas principales, con contexto de autenticación en el frontend.

El diseño utiliza clases de Tailwind para lograr una interfaz moderna, responsiva y con soporte básico de modo oscuro.

---

## Tests

En el backend se incluyen pruebas con `pytest`:

- Pruebas para el endpoint de búsqueda (`/search`).
- Pruebas para el endpoint de detalle de artículo (`/articles/{id}`).

Para ejecutarlas desde `backend/`:

```bash
cd backend
pytest
```

---

## Decisiones de arquitectura

Las decisiones de arquitectura y diseño se detallan en [ARCHITECTURE.md](ARCHITECTURE.md), incluyendo:

- Organización por **features** tanto en backend como en frontend.
- Uso de **FastAPI + SQLModel + PostgreSQL**.
- Elección de análisis de texto simple (frecuencia de palabras y stopwords).
- Enfoque de **soft delete** para artículos guardados.

