# Clínica Gastro Endoscópica – Sitio Web
**Dr. Byron H. Lewin | Gastroenterólogo y Endoscopista | Guatemala**

Sitio web de una sola página (HTML/CSS/JS vanilla), completamente responsivo,
con galería con lightbox, formulario que abre WhatsApp y botón flotante de contacto.

---

## Estructura de archivos

```
clinica-gastro-endoscopica/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
└── assets/
    ├── logo/
    │   └── logo.jpg          ← Logo de la clínica
    └── fotos/
        ├── foto-1.jpg        ← Foto principal (hero)
        ├── foto-2.jpg        ← Foto sección "Sobre mí"
        ├── foto-3.jpg        ← Cápsula endoscópica / galería
        ├── foto-4.jpg        ← Galería
        ├── foto-5.jpg        ← Galería
        ├── foto-6.jpg        ← Galería
        └── foto-7.jpg        ← Galería
```

---

## Cómo agregar o cambiar fotos

1. Nombra las fotos como `foto-1.jpg`, `foto-2.jpg`, … `foto-7.jpg`.
2. Cópialas en `assets/fotos/`.
3. Las fotos que no existan simplemente se omiten — no rompen el layout.
4. Para la foto principal del **hero** usa `foto-1.jpg` (preferiblemente retrato del doctor).
5. Para la sección **"Sobre mí"** usa `foto-2.jpg`.
6. Para la sección de **Cápsula Endoscópica** usa `foto-3.jpg`.

> Formatos soportados: `.jpg`, `.jpeg`, `.png`, `.webp`
> Tamaño recomendado: mínimo 800×600 px, máximo 2 MB por foto.

---

## Cómo cambiar información de contacto

Abre `index.html` y busca las secciones indicadas:

| Dato            | Qué buscar en index.html                           |
|-----------------|-----------------------------------------------------|
| Teléfonos       | `href="tel:+502..."` — cambia número y texto        |
| Horario         | `Lunes a Viernes` / `7:00 – 15:30 hrs`             |
| Dirección       | `6 Avenida 3-22, Zona 10`                           |
| WhatsApp (botón)| `href="https://wa.me/50259792344..."` en dos sitios |
| Facebook        | `href="https://www.facebook.com/..."`               |

Para cambiar el número de WhatsApp también actualiza `js/main.js`:
```js
const waURL = `https://wa.me/50259792344?text=${encoded}`;
```

---

## Cómo cambiar el mapa

En `index.html` busca el `<iframe>` dentro de `class="map-wrapper"`:
```html
<iframe src="https://maps.google.com/maps?q=Centro+Medico+II...">
```
Reemplaza el valor de `q=` con la dirección exacta que quieras mostrar.

---

## Deploy en GitHub Pages

1. Crea un repositorio en GitHub (ej. `clinica-gastro`).
2. Sube todos los archivos al repositorio:
   ```bash
   git init
   git add .
   git commit -m "Sitio web clínica"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/clinica-gastro.git
   git push -u origin main
   ```
3. En GitHub → **Settings → Pages → Source**: selecciona `main` / `/ (root)`.
4. En pocos minutos el sitio estará en: `https://TU-USUARIO.github.io/clinica-gastro/`

---

## Deploy en Netlify

**Opción A — Drag & Drop (más rápida):**
1. Entra a [netlify.com](https://netlify.com) e inicia sesión.
2. Arrastra la carpeta `clinica-gastro-endoscopica/` al dashboard.
3. Netlify asigna una URL automáticamente (ej. `amazing-lewin.netlify.app`).

**Opción B — desde GitHub:**
1. Sube el código a GitHub (ver pasos arriba).
2. En Netlify → **New site from Git** → selecciona el repositorio.
3. Build command: *(dejar vacío)*  
   Publish directory: `.` (raíz)
4. Click en **Deploy site**.

---

## Dominio personalizado

Una vez desplegado en GitHub Pages o Netlify, puedes conectar un dominio propio:
- En Netlify: **Domain settings → Add custom domain**.
- En GitHub Pages: **Settings → Pages → Custom domain**.

---

## Notas técnicas

- No requiere Node.js ni ningún framework.
- No hay dependencias externas (solo Google Fonts vía CDN).
- Las imágenes faltantes en la galería se ocultan automáticamente.
- El formulario de contacto abre WhatsApp con los datos pre-llenados.
- Compatible con todos los navegadores modernos (Chrome, Firefox, Safari, Edge).
