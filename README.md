# Readme - PSINet

## 0. Comandos claves

### 0.1 Comandos en ambiente local

- **Backend:**
  - `dotnet restore`
  - `dotnet ef database update`
  - `dotnet run`
- **Frontend:**
  - `npm install`
  - `ng serve`
- **Tests:**
  - `dotnet test` (Backend)
  - `ng test` (Frontend)

### 0.2 Comando en ambiente docker

Ejecutar `docker-compose up --build` en la carpeta raiz del monorepo

_Nota_: En el enviroment.ts en frontend deje apuntando al localhost pero en un ambiente de produccion real debe apuntar a la url de la api.

## 1. Requisitos previos

- **Runtime y SDK:**
  - **.NET 8.0 SDK** Es el motor que compila el backend.
  - **Node.js** (Versión LTS recomedada).
- **Gestores de Paquetes:**
  - **NuGet** (viene incluido con .NET).
  - **npm** (viene incluido con Node.js).
- **Base de Datos:**
  - **No requiere motor de DB externo** (gracias a SQLite).

### 1.1 Dependencias del Backend (.NET)

El proyecto utiliza **Entity Framework Core**. Al abrir la terminal en la carpeta del backend, se deben restaurar estos paquetes:

- `Microsoft.EntityFrameworkCore.SqlLite: Para conectar con SQL Server.
- `Microsoft.EntityFrameworkCore.Tools`: Para ejecutar migraciones.
- `Microsoft.AspNetCore.Authentication.JwtBearer`: Para el sistema de login y tokens.
- **Para los Tests:** `Microsoft.EntityFrameworkCore.InMemory` y `xunit`.
  **Comando clave:** `dotnet restore` y luego `dotnet ef database update` para crear las tablas.

### 1.2 Dependencias del Frontend (Angular)

El frontend es moderno (Angular 18/19) y utiliza **Signals**. Requisitos específicos:

- **Angular CLI:** Se recomienda instalarlo globalmente con `npm install -g @angular/cli`.

  **Comando clave:** `npm install` dentro de la carpeta del frontend.

### 1.3 Configuración de Entorno (Importante)

Para que ambos se comuniquen, se debe verificar:

1. **CORS:** El Backend debe tener habilitado CORS para permitir peticiones desde el puerto de Angular (usualmente `http://localhost:4200`).
2. **Connection String:** En el archivo `appsettings.json` del backend, la cadena de conexión debe apuntar al archivo SQLite local `Data Source=helpdesk.db`.
3. **URL de la API:** En el frontend, el archivo `environment.ts` debe apuntar a la URL donde corre el backend.

#### 1.3.1 En caso de error de autenticacion

Lo mas probable es que haya cambiado el puerto por lo cual simplemente se debe cambiar el puerto por el que esta ocupando la api .net en el archivo enviroment.development.ts

## 2. Backend

### 2.1 Decisiones del proyecto .Net 8.0

- **Manejo de Secretos:** Se utilizó `DotNetEnv` para gestionar variables de entorno (JWT Key) y evitar subir credenciales sensibles al repositorio.
- **Base de datos**: Se utilizo EF.Design para crear una migracion lo cual permite hacer que base de datos sea portable en diferentes maquinas.

### 2.2 Ejecución de los tests

`dotnet test`

## 3. Frontend

### 3.1 Decisiones del proyecto Angular 19+ Zoneless

#### 3.1.1 Decidí no habilitar SSR/SSG por estas razones

- **Seguridad:** La web esta detrás de un login. El SEO (posicionamiento en Google) no importa para una herramienta interna.
- **Interactividad:** Estas apps dependen de datos que cambian constantemente (un ticket que pasa de "Abierto" a "Cerrado"). El renderizado desde el servidor añade una complejidad innecesaria.
- **Simplicidad:** Habilitar SSR complica el despliegue (se necesitaria de un servidor Node.js para ejecutar Angular, en lugar de solo subir archivos estáticos a un servidor web o un contenedor Docker simple).

#### 3.1.2 Zoneless

Esto permite pasar del zone.js y manejar el estado exclusivamente con **Signals**, se logra una detección de cambios más granular y eficiente, ideal para dashboards que requieren alta reactividad.

#### 3.1.3 Estructura de carpeta

Utilice la estructura Folder-by-feature para las carpetas `core`, `features` y `shared` es un patrón de desarrollo web moderno (como Angular), donde `core` maneja elementos transversales (servicios globales, interceptores), `features` organiza el código por funcionalidad específica (módulos, componentes de "página") y `shared` contiene componentes, directivas, pipes o utilidades reutilizables en múltiples funcionalidades, promoviendo la modularidad y la escalabilidad.

#### 3.1.4 Testing

Se implementaron tests unitarios para el componente de listado utilizando el nuevo esquema _Zoneless_ de Angular y _Signals_. Se validó específicamente la lógica de paginación para asegurar que el usuario siempre visualice la cantidad correcta de tickets por página, garantizando una buena UX.

### 3.2 Ejecución de los tests

`ng test`

## 4. Credenciales Login

El usuario es `admin` y la contraseña `123456`.
