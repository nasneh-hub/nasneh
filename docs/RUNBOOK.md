# Nasneh - Runbook

> دليل التشغيل والنشر للمطورين

---

## 📋 جدول المحتويات

1. [المتطلبات](#المتطلبات)
2. [التشغيل المحلي](#التشغيل-المحلي)
3. [البيئات](#البيئات)
4. [النشر (Deployment)](#النشر-deployment)
5. [إدارة Secrets](#إدارة-secrets)
6. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## المتطلبات

### البرامج المطلوبة

| برنامج | الإصدار | التثبيت |
|--------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `npm install -g pnpm` |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org) |
| Redis | 7+ | [redis.io](https://redis.io) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

### التحقق من التثبيت

```bash
node --version    # v20.x.x
pnpm --version    # 8.x.x
psql --version    # 15.x
redis-cli --version
```

---

## التشغيل المحلي

### 1. Clone & Install

```bash
# Clone
git clone https://github.com/nasneh-hub/nasneh.git
cd nasneh

# Install dependencies
pnpm install
```

### 2. إعداد Environment

```bash
# نسخ ملفات البيئة
cp apps/customer-web/.env.example apps/customer-web/.env.local
cp apps/dashboard/.env.example apps/dashboard/.env.local
cp apps/api/.env.example apps/api/.env.local

# عدّل القيم في كل ملف .env.local
```

### 3. إعداد Database

```bash
# إنشاء قاعدة البيانات
createdb nasneh_dev

# تشغيل migrations (بعد إعداد Prisma)
cd apps/api
pnpm db:migrate
pnpm db:seed  # بيانات تجريبية
```

### 4. تشغيل التطبيقات

```bash
# تشغيل كل التطبيقات
pnpm dev

# أو تشغيل تطبيق محدد
pnpm dev --filter=customer-web
pnpm dev --filter=dashboard
pnpm dev --filter=api
```

### 5. الوصول

| التطبيق | URL |
|---------|-----|
| Customer Web | http://localhost:3000 |
| Dashboard | http://localhost:3001 |
| API | http://localhost:4000 |
| API Docs | http://localhost:4000/docs |

---

## البيئات

### Environment Overview

| البيئة | الغرض | Branch | URL |
|--------|-------|--------|-----|
| **Development** | التطوير المحلي | أي branch | localhost |
| **Staging** | الاختبار قبل Production | `develop` | staging.nasneh.com |
| **Production** | الإنتاج | `main` | nasneh.com |

### Environment Variables per Environment

```
Development → .env.local (local machine)
Staging     → AWS Secrets Manager (staging/)
Production  → AWS Secrets Manager (production/)
```

---

## النشر (Deployment)

### Staging Deployment

```bash
# 1. Push to develop branch
git checkout develop
git merge feature/your-feature
git push origin develop

# 2. CI/CD يشتغل تلقائياً
# 3. بعد نجاح CI، ينشر على Staging
# 4. تحقق من Staging
open https://staging.nasneh.com
```

### Production Deployment

```bash
# 1. Create PR from develop → main
# 2. Get approval (1 reviewer minimum)
# 3. Merge PR
# 4. CI/CD ينشر تلقائياً على Production
# 5. تحقق من Production
open https://nasneh.com
```

### Manual Deployment (Emergency Only)

```bash
# ⚠️ استخدم فقط في الطوارئ

# SSH to server
ssh deploy@nasneh-server

# Pull latest
cd /var/www/nasneh
git pull origin main

# Install & Build
pnpm install
pnpm build

# Restart services
pm2 restart all
```

---

## إدارة Secrets

### ⚠️ قواعد صارمة

1. **❌ ممنوع** رفع أي مفاتيح أو secrets في الكود
2. **❌ ممنوع** مشاركة secrets في Slack/Email/Chat
3. **✅ فقط** استخدم AWS Secrets Manager للـ Production
4. **✅ فقط** استخدم `.env.local` للتطوير المحلي

### أين توضع Secrets

| البيئة | المكان |
|--------|--------|
| Local | `.env.local` (لا يُرفع على Git) |
| Staging | AWS Secrets Manager → `nasneh/staging/*` |
| Production | AWS Secrets Manager → `nasneh/production/*` |

### إضافة Secret جديد

```bash
# 1. أضفه في .env.example (بدون قيمة حقيقية)
echo "NEW_SECRET=" >> apps/api/.env.example

# 2. أضف القيمة في .env.local محلياً
echo "NEW_SECRET=actual-value" >> apps/api/.env.local

# 3. أضفه في AWS Secrets Manager للـ Staging/Production
aws secretsmanager put-secret-value \
  --secret-id nasneh/production/api \
  --secret-string '{"NEW_SECRET":"production-value"}'
```

### الوصول لـ Secrets (للمطورين)

```bash
# عرض secrets (يحتاج صلاحية)
aws secretsmanager get-secret-value \
  --secret-id nasneh/staging/api \
  --query SecretString \
  --output text | jq .
```

---

## استكشاف الأخطاء

### مشاكل شائعة

#### 1. pnpm install فشل

```bash
# امسح cache وحاول مرة ثانية
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### 2. Database connection failed

```bash
# تأكد PostgreSQL شغال
pg_isready

# تأكد من DATABASE_URL
echo $DATABASE_URL

# اختبر الاتصال
psql $DATABASE_URL -c "SELECT 1"
```

#### 3. Redis connection failed

```bash
# تأكد Redis شغال
redis-cli ping  # Should return PONG

# إعادة تشغيل Redis
brew services restart redis  # macOS
sudo systemctl restart redis  # Linux
```

#### 4. Port already in use

```bash
# اعرف من يستخدم الـ port
lsof -i :3000

# اقتل العملية
kill -9 <PID>
```

#### 5. TypeScript errors

```bash
# أعد بناء types
pnpm clean
pnpm install
pnpm typecheck
```

#### 6. Prisma errors

```bash
# أعد توليد client
cd apps/api
pnpm db:generate

# أعد تشغيل migrations
pnpm db:migrate
```

---

## الأوامر المفيدة

### Development

```bash
pnpm dev              # تشغيل كل التطبيقات
pnpm build            # بناء كل التطبيقات
pnpm lint             # فحص الكود
pnpm typecheck        # فحص TypeScript
pnpm format           # تنسيق الكود
pnpm clean            # مسح cache و build
```

### Database

```bash
pnpm db:generate      # توليد Prisma client
pnpm db:migrate       # تشغيل migrations
pnpm db:push          # Push schema changes
pnpm db:seed          # إضافة بيانات تجريبية
```

### Git

```bash
git checkout -b feature/new-feature   # إنشاء branch جديد
git push origin feature/new-feature   # رفع الـ branch
gh pr create                          # إنشاء Pull Request
```

---

## الدعم

- **Documentation:** `/docs/`
- **Issues:** https://github.com/nasneh-hub/nasneh/issues
- **Discussions:** https://github.com/nasneh-hub/nasneh/discussions

---

**Document End**
