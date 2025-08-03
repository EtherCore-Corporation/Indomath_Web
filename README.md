# Indomath Web Platform

Una plataforma moderna para aprender matemáticas online, construida con Next.js, Supabase, y Stripe.

## Características

- 🎥 Videos de alta calidad alojados en Bunny.net
- 📚 Cursos estructurados con lecciones
- 💳 Pagos seguros con Stripe
- 🔐 Autenticación y autorización con Supabase
- 📱 Diseño responsive y moderno
- 🚀 Rendimiento optimizado

## Requisitos Previos

- Node.js 18.x o superior
- Cuenta en Supabase
- Cuenta en Stripe
- Cuenta en Bunny.net

## Configuración del Proyecto

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/indomath-web.git
cd indomath-web
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env.local` con las siguientes variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Email Configuration (if using custom SMTP)
SMTP_HOST=your_smtp_host_here
SMTP_PORT=587
SMTP_USER=your_smtp_user_here
SMTP_PASS=your_smtp_password_here
```

4. Configura la base de datos en Supabase:
   - Ejecuta el script SQL en `supabase/schema.sql` en tu proyecto de Supabase
   - Configura las políticas de seguridad según tus necesidades

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del Proyecto

```
indomath-web/
├── src/
│   ├── app/                 # Rutas y páginas de la aplicación
│   ├── components/          # Componentes reutilizables
│   ├── lib/                 # Utilidades y configuraciones
│   └── types/              # Definiciones de tipos TypeScript
├── public/                 # Archivos estáticos
├── supabase/              # Scripts y configuraciones de Supabase
└── package.json
```

## Despliegue

1. Construye la aplicación:
```bash
npm run build
```

2. Inicia el servidor de producción:
```bash
npm start
```

## Contribuir

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.
