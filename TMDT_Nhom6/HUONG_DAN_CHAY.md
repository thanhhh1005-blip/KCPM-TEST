# Huong Dan Chay

## Terminal 1 - Clone source

```powershell
git clone 
cd TMDT_Nhom6
```

## Terminal 2 - Start SQL Server

```powershell
docker compose -f docker-compose.sql.yml up -d
docker compose -f docker-compose.sql.yml ps
```

## Terminal 3 - Start Backend

```powershell
dotnet restore HomeDecorShop\HomeDecorShop.sln
cd HomeDecorShop\HomeDecorShop.API
dotnet run --launch-profile http
```

## Terminal 4 - Seed du lieu

```powershell
Invoke-RestMethod -Method Post http://localhost:5020/api/Maintenance/seed/all
```

## Terminal 5 - Start Frontend

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

## Terminal 6 - Start ngrok

```powershell
ngrok config add-authtoken cr_3CHoaWrCdUOtOabC06EdBZIu7cA
ngrok http --domain=gecko-canning-viability.ngrok-free.dev 5020
```

## URL

```text
Frontend: http://127.0.0.1:3000
Backend: http://localhost:5020
Swagger: http://localhost:5020/swagger
```
