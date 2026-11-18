# Keitaro Campaign Manager

Сервис для управления рекламными кампаниями в трекере **Keitaro** через Admin API.
Состоит из двух частей:

- **Создатель кампаний** — принимает название, гео-код и ID оффера, создаёт кампанию
  с двумя потоками: гео-фильтр → Google и поток с оффером.
- **Редактор кампаний** — позволяет просматривать потоки существующей кампании,
  менять название потока и гео-фильтр, добавлять и удалять офферы.

## Стек

| Часть | Технологии |
|-------|------------|
| Backend | Node.js (18+), Express, better-sqlite3 |
| Frontend | HTML + Vanilla JS + CSS |
| Внешний API | Keitaro Admin API v1 (`https://tlgk.host/admin_api/v1`) |
| Хранение | SQLite (`server/app.db`) — лог созданных кампаний |

> ⚠️ В исходном ТЗ указан стек FastAPI + SQLAlchemy. Данная реализация выполнена
> на Node.js + Express + better-sqlite3 как рабочий аналог: Express играет роль
> веб-фреймворка, better-sqlite3 — слоя хранения (аналог SQLAlchemy).

## Структура проекта

```text
.
├── server/
│   ├── index.js        # Express-приложение и REST-эндпоинты
│   ├── keitaro.js      # Клиент Keitaro Admin API (ключ подставляется на сервере)
│   ├── db.js           # Инициализация SQLite и запросы
│   ├── .env            # Переменные окружения (не коммитить!)
│   └── package.json
└── frontend/
    ├── index.html
    ├── style.css
    └── app.js