# 📱 Task Manager App — Dashboard de Tareas Colaborativas

Aplicación móvil de gestión de tareas construida con React Native (Expo bare workflow), TypeScript, WatermelonDB y módulos nativos en Kotlin.

---

## 🚀 Instalación y ejecución

### Requisitos previos

- Node.js 18+
- JDK 17
- Android Studio con SDK 34 configurado
- Un dispositivo Android físico o emulador con API 26+

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar en Android

```bash
npx expo run:android
```

> ⚠️ No uses `npx expo start` + Expo Go. La app usa módulos nativos (`CameraModule`, `AvatarView`) que solo funcionan con un build nativo completo.

### 3. Configuración nativa (ya incluida en el repo)

Los siguientes archivos ya están configurados en `android/`:

- `AndroidManifest.xml` — permisos de cámara, almacenamiento y `FileProvider`
- `MainApplication.kt` — registra `CameraPackage` y `AvatarViewPackage`
- `MainActivity.kt` — conecta `onActivityResult` al `CameraModule`
- `res/xml/file_provider_paths.xml` — rutas del `FileProvider`

No se requiere ningún paso adicional de configuración nativa.

---

## 🏗️ Arquitectura Offline-First

### Principio general

La app sigue un patrón **offline-first estricto**: la UI nunca lee datos directamente de la API. Todo pasa por WatermelonDB como fuente de verdad local.

```
API (dummyjson.com)
       ↓
  syncService.ts   ← única capa que habla con la API
       ↓
  WatermelonDB     ← fuente de verdad local
       ↓
  withObservables  ← observa cambios reactivamente
       ↓
  DashboardScreen  ← renderiza desde la BD local
```

### Flujo de datos

1. **Primera apertura**: `syncTodos()` consume `https://dummyjson.com/todos`, guarda todas las tareas en WatermelonDB y nunca vuelve a leer de la API salvo en sincronizaciones explícitas.
2. **Lectura**: `DashboardScreen` usa `withObservables` + `withDatabase` de WatermelonDB. Los datos se leen exclusivamente desde la BD local mediante queries reactivas.
3. **Modificaciones offline**: marcar una tarea como completada llama a `task.update()` directamente sobre WatermelonDB. Sin conexión, el cambio persiste localmente.
4. **Pull-to-Refresh**: al jalar la lista, se vuelve a llamar `syncTodos()`, que hace upsert de cada tarea (crea si no existe, actualiza si existe por `remote_id`).

### Por qué WatermelonDB

- Diseñado específicamente para offline-first en React Native
- Queries reactivas via RxJS (`observe()`) — la UI se actualiza automáticamente al cambiar la BD
- Alto rendimiento con listas grandes (lazy loading nativo)
- API de escritura transaccional (`database.write()`) que garantiza consistencia

---

## 📁 Estructura de carpetas

```
src/
├── data/
│   ├── local/         # WatermelonDB: schema, modelos, database.ts
│   ├── remote/        # fetchTodos.ts — único punto de contacto con la API
│   └── sync/          # syncService.ts — lógica de sincronización y utilidades puras
├── domain/
│   └── entities.ts    # Tipos e interfaces TypeScript (sin dependencias de framework)
├── modules/
│   ├── AvatarView/    # Wrapper JS del componente nativo AvatarView
│   └── CameraModule/  # Wrapper JS del módulo nativo de cámara
├── navigation/        # React Navigation — AppNavigator
├── store/             # Zustand — estado UI (filtro activo, estado de sync)
└── ui/
    ├── components/    # AvatarView.tsx, FilterBar.tsx, TaskItem.tsx
    └── screens/       # DashboardScreen.tsx

android/app/src/main/java/com/taskmanagerapp/
├── avatarview/        # AvatarNativeView.kt, AvatarViewManager.kt, AvatarViewPackage.kt
└── camera/            # CameraModule.kt, CameraPackage.kt
```

---

## ⭐ Componente de UI Nativo: AvatarView

`AvatarView` es un componente nativo en Kotlin (`AvatarNativeView.kt`) expuesto a React Native vía `AvatarViewManager`.

**Funcionalidad:**
- Recibe la prop `name` desde JS (ej. `name="Carlos Rivera"`)
- Extrae las iniciales: `"CR"`
- Genera un color de fondo único y determinístico aplicando un hash sobre el nombre → conversión a HSV
- Renderiza un `View` circular nativo en Canvas con las iniciales centradas en blanco

**Uso en JS:**
```tsx
<AvatarView name="Carlos Rivera" size={44} />
```

El wrapper `AvatarView.tsx` detecta si el módulo nativo está disponible vía `UIManager.getViewManagerConfig`. Si no lo está (Expo Go, web, tests), usa un fallback puro en React Native con la misma lógica de color e iniciales replicada en TypeScript.

---

## 📷 Módulo Nativo: CameraModule

Módulo nativo Android (Kotlin) que expone `openCamera()` a JavaScript.

**Flujo:**
1. Solicita permiso `CAMERA` en runtime
2. Crea un archivo temporal en `getExternalFilesDir(Pictures)`
3. Lanza `ACTION_IMAGE_CAPTURE` con `FileProvider`
4. En `onActivityResult` (conectado desde `MainActivity`), resuelve la Promise con `{ uri, fileName, size }`
5. La cancelación resuelve con rechazo `E_CANCELLED` — sin crash

**Uso en JS:**
```ts
const result = await CameraModule.openCamera();
// result.uri → "file:///data/.../JPEG_20260411_175200_.jpg"
```

---
## Generar la Firma

keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000 


## 🧪 Pruebas unitarias

Las pruebas cubren la lógica de negocio crítica:

```
src/__tests__/
├── avatarUtils.test.ts     # extractInitials, nameToColor
├── filterTasks.test.ts     # lógica de filtros ALL/COMPLETED/PENDING
├── syncService.test.ts     # sincronización, upsert, manejo de errores
└── taskStore.test.ts       # estado Zustand: setFilter, setSyncing, setSyncError
```

Ejecutar:
```bash
npm test
```

---

## 🤖 Uso de IA

Durante el desarrollo se utilizó **Claude (Anthropic)** como asistente principal. A continuación se documenta el uso honesto y detallado:

### Tareas donde la IA fue clave

| Tarea | Herramienta | Cómo se usó |
|---|---|---|
| Arquitectura inicial del proyecto | Claude | Se le describió el stack (WatermelonDB + Zustand + RN) y generó la estructura de carpetas base y los modelos |
| `CameraModule.kt` | Claude | Generación del módulo nativo completo, incluyendo FileProvider, permisos runtime y manejo de `onActivityResult` |
| `AvatarNativeView.kt` | Claude | Generación del Canvas nativo con lógica de hash de color e iniciales |
| `syncService.ts` | Claude | Lógica de upsert offline-first, manejo de errores por ítem |
| Depuración de crashes | Claude | Análisis de logcat — identificó que faltaba `@ReactModule` en `CameraModule` y el `FileProvider` en el manifiesto |
| README | Claude | Redacción completa basada en el código real del proyecto |

### Supervisión humana aplicada

La IA no operó de forma autónoma. En cada caso se revisó y validó el output:

- Los archivos Kotlin generados se revisaron línea a línea antes de incluirlos
- Los crashes se diagnosticaron compartiendo el logcat real con la IA — sin el log, el error (`@ReactModule` faltante) no hubiera sido identificable solo con el código
- La arquitectura offline-first fue una decisión propia; la IA implementó el patrón pero no lo eligió
- Las pruebas unitarias fueron revisadas para asegurar que cubrían casos edge reales (nombre vacío, userId inválido, fallo de red en sync)

### Limitación encontrada

El prebuild de Expo sobreescribe `MainActivity.kt` eliminando customizaciones manuales. Este problema fue identificado y resuelto iterativamente con ayuda de la IA al analizar el error de runtime.
