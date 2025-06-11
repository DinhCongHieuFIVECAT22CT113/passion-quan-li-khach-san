#!/usr/bin/env bash
# Tệp script để build dự án trên Render

# Hiển thị thư mục hiện tại
echo "Current directory: $(pwd)"
ls -la

# Build dự án
dotnet restore
dotnet build --configuration Release
dotnet publish -c Release -o out

# Hiển thị thư mục output
echo "Output directory:"
ls -la out