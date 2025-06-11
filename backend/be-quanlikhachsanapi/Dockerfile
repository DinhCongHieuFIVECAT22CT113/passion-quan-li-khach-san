# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj và khôi phục dependency
COPY ["be-quanlikhachsanapi.csproj", "./"]
RUN dotnet restore "./be-quanlikhachsanapi.csproj"

# Copy toàn bộ mã nguồn và build
COPY . .
RUN dotnet publish "be-quanlikhachsanapi.csproj" -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copy file đã build từ build stage
COPY --from=build /app/out .

# Cấu hình cổng và biến môi trường
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "be-quanlikhachsanapi.dll"]
