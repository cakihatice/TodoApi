# Todo API — .NET 10 + Angular

CQRS mimarisiyle yazılmış, JWT kimlik doğrulama ve kullanıcı adı destekli bir todo uygulaması. Backend .NET 10 Web API + Entity Framework Core + MSSQL, frontend Angular 22.

## İçindekiler

- [Teknolojiler](#teknolojiler)
- [Klasör Yapısı](#klasör-yapısı)
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [API Endpointleri](#api-endpointleri)
- [Ekstra Özellikler](#ekstra-özellikler)

## Teknolojiler

**Backend**
- .NET 10 Web API
- Entity Framework Core 10
- MSSQL Server 2022 (Docker container)
- ASP.NET Core Identity + JWT Bearer
- CQRS pattern (elle yazılmış ICommand/IQuery arayüzleri, MediatR kullanılmadı)
- Repository pattern (ITodoRepository)

**Frontend**
- Angular 22 (standalone components)
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
│   └── DTOs/                # RegisterDto, LoginDto, TodoDto
├── Domain/
│   ├── Entities/            # TodoItem, AppUser
│   └── Interfaces/          # ITodoRepository
├── Infrastructure/
│   ├── Data/                # AppDbContext
│   └── Repositories/        # TodoRepository (EF Core)
├── Migrations/              # EF Core migrations
├── frontend/                # Angular projesi
│   └── src/app/
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

Bu, `Migrations/` klasöründeki migration'ları uygulayıp `TodoDb`, `Todos`, `AspNetUsers` gibi tabloları oluşturur.

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

1. `/register` — kullanıcı adı, email, şifre gir
2. `/login` — email ve şifreyle giriş yap (JWT alınır, localStorage'a saklanır)
3. `/todos` — todo ekle, düzenle, tamamlandı işaretle, sil
4. Çıkış yap butonu token'ı siler, login sayfasına yönlendirir

## API Endpointleri

Tüm todo endpoint'leri `Authorization: Bearer <token>` header'ı gerektirir.

### Auth

**POST /api/auth/register**
```json
{ "displayName": "Hatice", "email": "test@test.com", "password": "Test123!" }
```
→ `200 OK { "message": "Kullanıcı başarıyla oluşturuldu." }`

**POST /api/auth/login**
```json
{ "email": "test@test.com", "password": "Test123!" }
```
→ `200 OK { "token": "eyJ...", "displayName": "Hatice" }`

### Todo (JWT gerekli)

**GET /api/todo** — tüm todo'ları getir
→ `200 OK [{ "id": "...", "title": "...", "description": "...", "isCompleted": false, "createdAt": "...", "dueDate": null }]`

**GET /api/todo/{id}** — tek todo getir
→ `200 OK { ... }` ya da `404 Not Found`

**POST /api/todo** — yeni todo oluştur
```json
{ "title": "Süt al", "description": "Migros", "dueDate": "2026-08-05" }
```
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

# Todo oluştur
curl -X POST http://localhost:5158/api/todo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Süt al","description":null,"dueDate":null}'

# Todo listele
curl -X GET http://localhost:5158/api/todo \
  -H "Authorization: Bearer $TOKEN"
```

## Ekstra Özellikler

Spec'te olmayan, geliştirici tercihiyle eklenen özellikler:

- **JWT tabanlı kimlik doğrulama** — register/login endpoint'leri + Angular tarafında interceptor
- **Kullanıcı adı (DisplayName)** — kayıt sırasında alınır, todos sayfasında "Hoş geldin, [ad]" olarak gösterilir
- **Son tarih (DueDate)** — todo'lara opsiyonel son tarih eklenebilir, listede vurgulanır
- **Responsive tasarım** — mobil, tablet, desktop için CSS media queries

## Geliştirici

Hatice Çakı  
GitHub: [github.com/cakihatice](https://github.com/cakihatice)