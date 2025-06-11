FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj và restore dependencies
COPY ["be-quanlikhachsanapi.csproj", "./"]
RUN dotnet restore "./be-quanlikhachsanapi.csproj"

# Copy everything else and build
COPY . .
RUN dotnet publish "be-quanlikhachsanapi.csproj" -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Expose port
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Start the app
ENTRYPOINT ["dotnet", "be-quanlikhachsanapi.dll"]