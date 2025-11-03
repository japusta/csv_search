# CSV Explorer — загрузка, просмотр и поиск по большим CSV (10^5 → 10^6 строк)

Локальное приложение для импорта крупных CSV-файлов, их просмотра и быстрого поиска.  
Импорт идёт потоково через очередь, интерфейс остаётся отзывчивым даже на файлах 100+ МБ.

---

## Возможности

- **Загрузка CSV** (`multipart/form-data`, поле `file`) до 100 МБ по умолчанию
- **Фоновый импорт** через BullMQ (воркер) с прогрессом и статусами
- **Список наборов**: имя файла, размер/кол-во строк, статус, ошибка
- **Просмотр строк** набора (пагинация/виртуализация)
- **Поиск** по данным набора (GIN + `pg_trgm` по `JSONB`)
- **Безопасная** очистка набора (каскадное удаление строк)

---

## Технологии

- **Backend:** NestJS, Prisma, PostgreSQL, BullMQ, Redis, Multer, Morgan
- **DB/Поиск:** PostgreSQL (`jsonb`, `pg_trgm`, GIN)
- **Worker:** отдельный Nest-модуль с обработчиком очереди `csv-import`
- **Frontend:** React + TypeScript (Vite), fetch-клиент

---

## Быстрый старт (локально)

### 0) Предусловия

- Node.js 20+ (или 22+)
- PostgreSQL 14+ (локально на `localhost:5432`)
- Redis 6+ (если нет — см. команду Docker ниже)

### 1) Настрой .env

**backend/.env**
```env
PORT=3000
API_TOKEN=supersecret

# база
DATABASE_URL=postgresql://postgres:secret123@localhost:5432/csvdb?schema=public
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret123
DB_NAME=csvdb

# redis (потом)
REDIS_HOST=localhost
REDIS_PORT=6379

UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=104857600
```

### 2) csv_search/.env
```env
PORT=3000
NODE_ENV=production
API_TOKEN=supersecret

DATABASE_URL=postgresql://postgres:secret123@postgres:5432/csvdb?schema=public
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret123
DB_NAME=csvdb

REDIS_HOST=redis
REDIS_PORT=6379

UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE=104857600
```

### 3) Redis
``` bash
docker run -d --name csv-redis \
  -p 6379:6379 \
  -v csv_redis_data:/data \
  --restart unless-stopped \
  redis:7-alpine
```

### 4) PostgreSQL

```bash
docker run -d --name csv-postgres \
  -e POSTGRES_DB=csvdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=secret123 \
  -p 5432:5432 \
  -v csv_pg_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:16-alpine
```

#### 4.1) postgres+redis

```bash
docker compose up -d postgres redis
```

### 5) backend

```bash
cd backend
npm i
npx prisma migrate deploy   # создаст все таблицы и индексы
npm run start:dev
```

#### 5.1) воркер

```bash
cd backend
npm run build
npm run start:worker

```

### 6) frontend

```bash
cd frontend
npm i
npm run dev

```
Откройте http://localhost:5173.

## API

Базовый URL: http://localhost:3000/api

POST /upload — загрузка CSV

multipart/form-data, поле file (расширение .csv обязательно)

GET /datasets — список наборов

GET /datasets/:id — детали набора

GET /rows?datasetId=:id&offset=0&limit=100 — строки набора

GET /search?datasetId=:id&q=строка&offset=0&limit=50 — поиск по набору

Локально авторизация не требуется (guard пропускает всех в development). В проде можно вернуть проверку через Authorization: Bearer ....
