## Backend

**Stack**: FastAPI, SQLModel, Postgres.

- **Run app**: `uvicorn backend.main:app --reload`
- **Default DB URL**: `postgresql+psycopg://postgres:postgres@localhost:5432/wikipedia_knowledge_explorer`
- **Configure DB**: set a `DATABASE_URL` environment variable or add it to a `.env` file in the `backend` directory.
