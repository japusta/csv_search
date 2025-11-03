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


---

## Быстрый старт (локально)

### 0) Предусловия

- Node.js 20+ (или 22+)
- PostgreSQL 14+ (локально на `localhost:5432`)
- Redis 6+ (если нет — см. команду Docker ниже)

### 1) Настрой .env

**backend/.env**
```env
# Postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/csvdb?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Путь, куда кладём загруженные файлы (создастся автоматически)
UPLOAD_DIR=./uploads

# Лимит размера файла (МБ)
MAX_FILE_SIZE_MB=100

# В проде можно вернуть защиту по токену; локально guard пропускает всех
NODE_ENV=development


