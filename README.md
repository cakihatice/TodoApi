# Do'ty — Todo Uygulaması (.NET 10 + Angular)

CQRS mimarisiyle yazılmış, JWT kimlik doğrulama, profil yönetimi ve e-posta doğrulama destekli bir todo uygulaması. Backend .NET 10 Web API + Entity Framework Core + MSSQL, frontend Angular 22 + Angular Material.

**Do'ty**, "done" (tamamlandı) fikrinden esinlenen özel bir isim ve AI ile tasarlanmış bir logoya sahiptir (D + onay işareti + 'ty). Logoya tıklandığında ana sayfaya dönülür.

## İçindekiler

- [Teknolojiler](#teknolojiler)
- [Klasör Yapısı](#klasör-yapısı)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [API Endpointleri](#api-endpointleri)
- [Özellikler](#özellikler)

## Teknolojiler

**Backend**
- .NET 10 Web API
- Entity Framework Core 10
- MSSQL Server 2022 (Docker container)
- ASP.NET Core Identity + JWT Bearer
- CQRS pattern (elle yazılmış ICommand/IQuery arayüzleri, MediatR kullanılmadı)
- Repository pattern (ITodoRepository)
- IEmailSender soyutlaması (hoşgeldin maili + e-posta doğrulama için)

**Frontend**
- Angular 22 (standalone components)
- Angular Material (dialog, toolbar, form-field, icon, snackbar, datepicker)
- HTML + SCSS
- Angular Signals + FormsModule
- HttpClient + JWT Interceptor
- RxJS

## Klasör Yapısı

```
TodoApi/
├── Application/
│   ├── Commands/            # Command DTOs (Create/Update/Delete)
│   ├── CommandHandlers/     # Command iş mantığı
│   ├── Queries/             # Query DTOs (GetAll/GetById)
│   ├── QueryHandlers/       # Query iş mantığı
│   ├── Common/              # ICommand, IQuery arayüzleri
│   ├── Controllers/         # AuthController, TodoController
│   └── DTOs/                # RegisterDto, LoginDto, TodoDto, ProfileDto
├── Domain/
│   ├── Entities/            # TodoItem, AppUser (DisplayName + PhotoBase64)
│   └── Interfaces/          # ITodoRepository, IEmailSender
├── Infrastructure/
│   ├── Data/                # AppDbContext
│   ├── Email/               # LoggingEmailSender (sahte/log implementasyon)
│   └── Repositories/        # TodoRepository (EF Core)
├── Migrations/              # EF Core migrations
├── frontend/                # Angular projesi
│   └── src/app/
│       ├── components/      # header, logo, todo-dialog, profile-dialog, confirm-dialog
│       ├── pages/           # login, register, todo-list
│       ├── services/        # Auth, Todo
│       └── interceptors/    # authInterceptor (JWT)
└── Program.cs
```

## Kurulum

### Ön Gereksinimler

- .NET 10 SDK
- Node.js 20+ ve npm
- Angular CLI 22 (`npm install -g @angular/cli`)
- Docker Desktop
- (Opsiyonel) Azure Data Studio veya benzeri MSSQL istemcisi

### 1. Repoyu klonla

```bash
git clone https://github.com/cakihatice/TodoApi.git
cd TodoApi
```

### 2. MSSQL container'ı başlat

```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong!Pass" \
  -p 1433:1433 --name mssql-container \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

Zaten varsa:

```bash
docker start mssql-container
```

### 3. Backend user secrets

`Jwt:Key` ve connection string'i user secrets'a ekle:

```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=TodoDb;User Id=sa;Password=YourStrong!Pass;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "your-secret-key-min-32-chars-long!"
dotnet user-secrets set "Jwt:Issuer" "TodoApi"
```

### 4. Database'i oluştur

```bash
dotnet ef database update
```

Bu, `Migrations/` klasöründeki migration'ları uygulayıp `TodoDb`, `Todos`, `AspNetUsers` gibi tabloları oluşturur. `AspNetUsers` tablosu `DisplayName` (kullanıcı adı) ve `PhotoBase64` (profil fotoğrafı) sütunlarını da içerir.

> Tüm şemanın ham SQL karşılığını görmek için: `dotnet ef migrations script -o full-schema.sql`

### 5. Frontend bağımlılıkları

```bash
cd frontend
npm install
cd ..
```

## Çalıştırma

İki terminal aç.

**Terminal 1 — Backend:**

```bash
cd TodoApi
dotnet run
```

`http://localhost:5158` adresinde çalışır.

**Terminal 2 — Frontend:**

```bash
cd TodoApi/frontend
ng serve
```

`http://localhost:4200` adresinde çalışır. Tarayıcıda aç.

### Kullanım

1. `/register` — kullanıcı adı, email, şifre gir. Kayıt olunca Do'ty temalı bir hoşgeldin maili ve e-posta doğrulama linki gönderilir.
2. `/login` — email ve şifreyle giriş yap (JWT alınır, localStorage'a saklanır)
3. `/todos` — todo ekle, düzenle, tamamlandı işaretle, sil (ekle/güncelle bir dialog içinde açılır; ana sayfada sadece grid ve "Ekle" butonu bulunur)
4. Header'daki profil fotoğrafına tıkla — profil dialogu açılır; fotoğraf, e-posta ve şifre güncellenebilir (kullanıcı adı readonly)
5. Çıkış yap butonu token'ı siler, login sayfasına yönlendirir

> **Mail testi:** Gerçek SMTP bağlı olmadığı için mailler (hoşgeldin + doğrulama linki) backend terminaline `📧 [SAHTE MAIL]` log'u olarak düşer. Doğrulama linkini log'dan kopyalayıp tarayıcıya yapıştırarak e-postayı doğrulayabilirsin. İleride `LoggingEmailSender` yerine gerçek bir `IEmailSender` implementasyonu (Gmail SMTP / SendGrid) kaydedilerek mailler gerçekten gönderilir.

## API Endpointleri

Tüm todo ve profil endpoint'leri `Authorization: Bearer <token>` header'ı gerektirir.

### Auth

**POST /api/auth/register**
```json
{ "displayName": "Hatice", "email": "test@test.com", "password": "Test123!" }
```
→ `200 OK { "message": "Kullanıcı başarıyla oluşturuldu." }`
Kullanıcı adı (`displayName`) benzersiz olmalıdır; alınmışsa `400 Bad Request` döner. Başarılı kayıtta hoşgeldin maili + doğrulama linki gönderilir.

**POST /api/auth/login**
```json
{ "email": "test@test.com", "password": "Test123!" }
```
→ `200 OK { "token": "eyJ...", "displayName": "Hatice" }`

**GET /api/auth/confirm-email?userId={id}&token={token}**
E-posta doğrulama linki. Başarılıysa kullanıcının `EmailConfirmed` alanı `true` olur.
→ `200 OK { "message": "E-posta başarıyla doğrulandı! Artık giriş yapabilirsin." }`

**GET /api/auth/me** — mevcut kullanıcının profilini getir
→ `200 OK { "displayName": "Hatice", "email": "...", "photoBase64": "data:image/...", "emailConfirmed": true }`

**PUT /api/auth/profile** — profili güncelle (kullanıcı adı değiştirilemez)
```json
{ "email": "yeni@test.com", "photoBase64": "data:image/png;base64,...", "newPassword": "Yeni123!", "currentPassword": "Test123!" }
```
`newPassword` gönderildiğinde `currentPassword` zorunludur. E-posta değişince `EmailConfirmed` sıfırlanır.
→ `200 OK { "message": "Profil güncellendi." }`

### Todo (JWT gerekli)

**GET /api/todo** — tüm todo'ları getir
→ `200 OK [{ "id": "...", "title": "...", "description": "...", "isCompleted": false, "createdAt": "...", "dueDate": null }]`

**GET /api/todo/{id}** — tek todo getir
→ `200 OK { ... }` ya da `404 Not Found`

**POST /api/todo** — yeni todo oluştur
```json
{ "title": "Süt al", "description": "Migros", "dueDate": "2026-08-05", "requestId": "guid" }
```
`requestId` ile idempotency sağlanır: aynı istek tekrar gelirse yeni kayıt açılmaz, mevcut kaydın id'si döner (yavaş ağda çift tıklamaya karşı sunucu tarafı koruma).
→ `201 Created { "id": "..." }`

**PUT /api/todo/{id}** — güncelle
```json
{ "id": "...", "title": "...", "description": "...", "isCompleted": true, "dueDate": null }
```
→ `204 No Content` ya da `404 Not Found`

**DELETE /api/todo/{id}** — sil
→ `204 No Content` ya da `404 Not Found`

### Örnek curl akışı

```bash
# Kayıt
curl -X POST http://localhost:5158/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Hatice","email":"t@t.com","password":"Test123!"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:5158/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"t@t.com","password":"Test123!"}' | jq -r '.token')

# Profil getir
curl -X GET http://localhost:5158/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Todo oluştur
curl -X POST http://localhost:5158/api/todo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Süt al","description":null,"dueDate":null,"requestId":"11111111-1111-1111-1111-111111111111"}'

# Todo listele
curl -X GET http://localhost:5158/api/todo \
  -H "Authorization: Bearer $TOKEN"
```

## Özellikler

**Kimlik ve güvenlik**
- JWT tabanlı kimlik doğrulama — register/login endpoint'leri + Angular tarafında interceptor
- Benzersiz kullanıcı adı (DisplayName) kontrolü
- E-posta doğrulama sistemi (ASP.NET Identity `EmailConfirmed` + confirm-email endpoint'i)
- Şifre güvenliği — tüm şifre alanları `type="password"`, şifre istekten hemen sonra bellekten temizlenir, düz metin hiçbir yerde görünmez

**Profil yönetimi**
- Ayrı bir profil componenti, header'daki fotoğraf/avatara tıklanınca dialog olarak açılır
- Base64 fotoğraf yükleme (DB'de string olarak `PhotoBase64` sütununda saklanır), header avatarında gösterilir
- E-posta ve şifre güncelleme; kullanıcı adı readonly textbox olarak görünür (değiştirilemez)

**Todo yönetimi**
- Ekle ve güncelle işlemleri dialog içinde açılır; ana sayfada sadece grid ve "Ekle" butonu bulunur
- Düzenle/sil işlemleri için mat-icon kullanılır
- Yavaş ağda çift tıklamaya karşı koruma: sunucu tarafında `requestId` idempotency (Create), istemci tarafında `saving`/`deletingIds` kilitleri
- Son tarih (DueDate) — todo'lara opsiyonel son tarih eklenebilir, listede vurgulanır

**Mail**
- Kayıt olunca uygulama adı ve logosunu içeren "Do'ty uygulamasına hoş geldiniz" konulu HTML mail
- IEmailSender soyutlaması — şu an loglayan sahte implementasyon; ileride gerçek servise (Gmail SMTP / SendGrid) tek satırla bağlanabilir

**Arayüz**
- AI ile tasarlanmış özel Do'ty logosu (login ekranında üstte, header'da; tıklanınca ana sayfaya döner)
- Angular Material bileşenleri (dialog, toolbar, snackbar, datepicker)
- Responsive tasarım — mobil, tablet, desktop için CSS media queries

## Geliştirici

Hatice Çakı
GitHub: [github.com/cakihatice](https://github.com/cakihatice)