# ShopWave Frontend - GCP Deployment Guide

Это руководство по сборке и развертыванию фронтенда ShopWave в Google Cloud Platform (GCP).

## 🚀 Быстрый старт

### Предварительные требования

1. **Установленные инструменты:**

   ```bash
   # Google Cloud CLI
   gcloud auth login
   gcloud config set project kbtu-cloud-assignment2-w0nsdoof

   # Node.js и npm/pnpm
   npm install -g pnpm  # опционально
   ```

2. **Настройте переменные окружения:**

   Отредактируйте файл `.env.production` и замените `YOUR_CLOUD_RUN_BACKEND_URL` на реальный URL вашего бекенда:

   ```bash
   NEXT_PUBLIC_API_URL=https://shopwave-backend-abc123-ew.a.run.app
   NEXT_PUBLIC_BACKEND_URL=https://shopwave-backend-abc123-ew.a.run.app
   NEXT_PUBLIC_MEDIA_URL=https://shopwave-backend-abc123-ew.a.run.app
   ```

### Сборка проекта

```bash
npm install
npm run build
```

Статические файлы будут созданы в папке `dist/`.

## 📦 Варианты развертывания

### Вариант A (Рекомендуется): GCS + Cloud CDN

**Автоматическое развертывание:**

```bash
# Linux/macOS
BACKEND_URL="https://your-backend-url.run.app" ./deploy-gcs.sh

# Windows PowerShell
.\deploy-gcs.ps1 -BackendUrl "https://your-backend-url.run.app"
```

**Или npm script:**

```bash
npm run deploy:gcs
```

**Ручное развертывание:**

1. **Создайте и настройте bucket:**

   ```bash
   PROJECT_ID="kbtu-cloud-assignment2-w0nsdoof"
   BUCKET_NAME="shopwave-frontend-$PROJECT_ID"

   # Создать bucket
   gsutil mb -p $PROJECT_ID -c STANDARD -l europe-west3 gs://$BUCKET_NAME

   # Настроить static website hosting
   gsutil web set -m index.html -e 404.html gs://$BUCKET_NAME

   # Сделать публичным
   gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
   ```

2. **Загрузите файлы:**

   ```bash
   gsutil -m rsync -r -d dist/ gs://$BUCKET_NAME/
   ```

3. **Настройте Cloud CDN:**

   ```bash
   # Создать backend bucket
   gcloud compute backend-buckets create shopwave-frontend-backend \
     --gcs-bucket-name=$BUCKET_NAME \
     --enable-cdn \
     --cache-mode=CACHE_ALL_STATIC

   # Создать URL map
   gcloud compute url-maps create shopwave-frontend-map \
     --default-backend-bucket=shopwave-frontend-backend

   # Создать load balancer
   gcloud compute addresses create shopwave-frontend-ip --global
   gcloud compute target-http-proxies create shopwave-frontend-lb \
     --url-map=shopwave-frontend-map
   gcloud compute forwarding-rules create shopwave-frontend-lb-http \
     --address=shopwave-frontend-ip \
     --global \
     --target-http-proxy=shopwave-frontend-lb \
     --ports=80
   ```

**Преимущества варианта A:**

- Максимальная производительность
- Глобальное кеширование через CDN
- Минимальная стоимость
- Автоматическое масштабирование

### Вариант B: Cloud Run + Nginx

**Автоматическое развертывание:**

```bash
# Linux/macOS
BACKEND_URL="https://your-backend-url.run.app" ./deploy-cloudrun.sh

# Windows PowerShell
.\deploy-cloudrun.ps1 -BackendUrl "https://your-backend-url.run.app"
```

**Или npm script:**

```bash
npm run deploy:cloudrun
```

**Ручное развертывание:**

1. **Соберите Docker образ:**

   ```bash
   # Используя простой Dockerfile
   docker build -f Dockerfile.simple -t shopwave-frontend .

   # Или полный Dockerfile с multi-stage build
   docker build -t shopwave-frontend .
   ```

2. **Загрузите в GCR и разверните:**

   ```bash
   # Тегировать и загрузить
   docker tag shopwave-frontend gcr.io/kbtu-cloud-assignment2-w0nsdoof/shopwave-frontend
   docker push gcr.io/kbtu-cloud-assignment2-w0nsdoof/shopwave-frontend

   # Развернуть в Cloud Run
   gcloud run deploy shopwave-frontend \
     --image gcr.io/kbtu-cloud-assignment2-w0nsdoof/shopwave-frontend \
     --region europe-west3 \
     --allow-unauthenticated \
     --port 80 \
     --memory 256Mi
   ```

**Преимущества варианта B:**

- Простота настройки
- Возможность серверной обработки (если нужна)
- Легкое управление через Cloud Run

## 🔄 Полное развертывание проекта

Для развертывания всей инфраструктуры (SQL, Redis, Backend, Frontend):

```bash
# Linux/macOS
./deploy-full-gcp.sh

# Windows PowerShell
.\deploy-full-gcp.ps1

# Или npm script
npm run deploy:full
```

Этот скрипт автоматически:

1. Создает Cloud SQL (PostgreSQL)
2. Создает Memorystore (Redis)
3. Собирает и развертывает бекенд
4. Собирает и развертывает фронтенд (вариант A)
5. Настраивает все связи между сервисами

## 🔧 Конфигурация CORS

После развертывания обновите настройки CORS на бекенде:

```python
# В Django settings.py
CORS_ALLOWED_ORIGINS = [
    "https://storage.googleapis.com/shopwave-frontend-kbtu-cloud-assignment2-w0nsdoof",  # Для варианта A
    "https://shopwave-frontend-xxxxx-ew.a.run.app",  # Для варианта B
    "https://your-custom-domain.com",  # Если настроен кастомный домен
]

# Для development
CORS_ALLOW_ALL_ORIGINS = False  # Установить в True только для разработки
```

Обновить FRONTEND_URL в бекенде:

```bash
gcloud run services update shopwave-backend \
  --region europe-west3 \
  --set-env-vars FRONTEND_URL=https://your-frontend-url
```

## 📁 Структура файлов

```
ShopWave_FPIS/
├── dist/                      # Собранные статические файлы (Next.js output)
├── .env.production           # Переменные окружения для продакшена
├── .env.local               # Переменные окружения для разработки
├── Dockerfile               # Docker конфигурация (multi-stage)
├── Dockerfile.simple        # Простой Dockerfile для варианта B
├── nginx.conf               # Nginx конфигурация
├── deploy-gcs.sh/.ps1       # Скрипт развертывания варианта A
├── deploy-cloudrun.sh/.ps1  # Скрипт развертывания варианта B
├── deploy-full-gcp.sh/.ps1  # Полный скрипт развертывания
└── next.config.mjs          # Next.js конфигурация
```

## 🔍 Проверка развертывания

После развертывания проверьте:

1. **Доступность сайта:** Откройте URL в браузере
2. **API подключение:** Проверьте работу функций, требующих API
3. **Загрузка изображений:** Убедитесь, что медиа файлы загружаются
4. **HTTPS:** Все запросы должны идти через HTTPS
5. **CORS:** Нет ошибок cross-origin в консоли браузера

## �️ SSL сертификаты (для варианта A)

Для настройки HTTPS с кастомным доменом:

```bash
# Создать SSL сертификат
gcloud compute ssl-certificates create shopwave-ssl-cert \
  --domains=your-domain.com

# Создать HTTPS load balancer
gcloud compute target-https-proxies create shopwave-frontend-lb-https \
  --url-map=shopwave-frontend-map \
  --ssl-certificates=shopwave-ssl-cert

gcloud compute forwarding-rules create shopwave-frontend-lb-https \
  --address=shopwave-frontend-ip \
  --global \
  --target-https-proxy=shopwave-frontend-lb-https \
  --ports=443
```

## 🐛 Устранение проблем

### Mixed Content Errors

- Убедитесь, что все URL используют HTTPS
- Проверьте переменные окружения в `.env.production`

### CORS Errors

- Настройте CORS на бекенде для правильных доменов
- Проверьте FRONTEND_URL в настройках бекенда

### 404 Errors на роутах (вариант B)

- Убедитесь, что Nginx настроен для SPA
- Проверьте конфигурацию `nginx.conf`

### Build Errors

- Проверьте версии Node.js и npm
- Очистите кеш: `npm ci` или `rm -rf node_modules && npm install`

## 💰 Оценка стоимости

**Вариант A (GCS + CDN):**

- Cloud Storage: ~$1-5/месяц
- Cloud CDN: ~$1-10/месяц (зависит от трафика)
- Load Balancer: ~$18/месяц

**Вариант B (Cloud Run):**

- Cloud Run: ~$0-10/месяц (зависит от трафика)
- Container Registry: ~$1-3/месяц

**Рекомендация:** Вариант A дешевле для большинства случаев использования.
