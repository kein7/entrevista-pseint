# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["HelpDesk.Api/HelpDesk.Api.csproj", "HelpDesk.Api/"]
COPY ["HelpDesk.Application/HelpDesk.Application.csproj", "HelpDesk.Application/"]
COPY ["HelpDesk.Domain/HelpDesk.Domain.csproj", "HelpDesk.Domain/"]
COPY ["HelpDesk.Infrastructure/HelpDesk.Infrastructure.csproj", "HelpDesk.Infrastructure/"]
RUN dotnet restore "HelpDesk.Api/HelpDesk.Api.csproj"

COPY . .
RUN dotnet publish "HelpDesk.Api/HelpDesk.Api.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
# Para SQLite, necesitamos persistir la DB
VOLUME /app/data 
ENTRYPOINT ["dotnet", "HelpDesk.Api.dll"]