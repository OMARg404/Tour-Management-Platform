# =========================
# 1) Build React frontend
# =========================
FROM node:18 AS build-frontend

WORKDIR /app

# Install frontend deps
COPY client/package*.json ./client/
RUN cd client && npm install

# Copy frontend source
COPY client ./client

# Build production React
RUN cd client && npm run build

# =========================
# 2) Build backend + copy React build
# =========================
FROM node:18

WORKDIR /app

# Copy backend package.json and install deps
COPY package*.json ./
RUN npm install --only=production

# Copy backend source code
COPY . .

# Copy React build from build-frontend stage
COPY --from=build-frontend /app/client/build ./public

EXPOSE 3000
CMD ["node", "server.js"]



# # =====================================
# # Docker Commands for Project
# # =====================================

# # -------------------------
# # 1️⃣ تشغيل الحاوية (Container) من الصورة الجاهزة
# # -------------------------
# # --env-file config.env : يستخدم ملف الإعدادات (Environment Variables)
# # -p 3000:3000         : ربط البورت 3000 من الحاوية مع جهازك
# # omgaa-app:1.0        : اسم الصورة ووسمها
# docker run --env-file config.env -p 3000:3000 omgaa-app:1.0

# # -------------------------
# # 2️⃣ حفظ الصورة في ملف (لمشاركة الصورة مع شخص آخر)
# # -------------------------
# # -o omgaa-app.tar     : اسم الملف اللي هيتم حفظ الصورة فيه
# docker save -o omgaa-app.tar omgaa-app:1.0

# # -------------------------
# # 3️⃣ الشخص التاني يحمل الصورة على جهازه
# # -------------------------
# # docker load -i : تحميل الصورة من ملف tar
# docker load -i omgaa-app.tar

# # -------------------------
# # 4️⃣ تشغيل الحاوية عند الشخص التاني
# # -------------------------
# # نفس الأمر اللي استخدمناه قبل كده مع env
# docker run --env-file config.env -p 3000:3000 omgaa-app:1.0

# # -------------------------
# # 5️⃣ إعادة بناء الصورة بعد تعديل الكود
# # -------------------------
# # إذا عايز تعيد بناء نفس النسخة
# docker build -t omgaa-app:1.0 .

# # أو تعطيها نسخة جديدة
# docker build -t omgaa-app:1.1 .

# # مثال على نسخة جديدة كليًا
# docker build -t omgaa-app:2.0 .
