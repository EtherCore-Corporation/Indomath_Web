# Configuración de SendGrid para Email

## Variables de Entorno Requeridas

Para que el servicio de email funcione correctamente, necesitas agregar la siguiente variable de entorno a tu archivo `.env.local`:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=tu_sendgrid_api_key_aqui
```

## Cómo Obtener tu API Key de SendGrid

1. **Crea una cuenta en SendGrid** (si no tienes una):
   - Ve a [sendgrid.com](https://sendgrid.com)
   - Regístrate con tu email

2. **Verifica tu dominio (Importante)**:
   - Ve a Settings > Sender Authentication
   - Agrega y verifica el dominio `indomath.es`
   - Esto es crucial para que los emails se envíen desde `contacto@indomath.es`

3. **Crear API Key**:
   - Ve a Settings > API Keys
   - Haz clic en "Create API Key"
   - Selecciona "Restricted Access"
   - Nombre: "IndoMath Web App"
   - Permisos necesarios:
     - Mail Send: Full Access
     - Sender Authentication: Read Access (para verificar dominio)

4. **Agregar la API Key**:
   - Copia la API Key generada
   - Agrégala a tu archivo `.env.local`:
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx
   ```

## Funcionamiento del Sistema

### Flujo de Email Automático

1. **Usuario completa compra** → Stripe webhook se ejecuta
2. **Si es usuario nuevo** → Se crea cuenta automáticamente
3. **Se genera contraseña temporal** → Se guarda en user metadata
4. **Se envía email de bienvenida** → Con credenciales de acceso
5. **Usuario ve contraseña en página de éxito** → Para acceso inmediato

### Emails que se Envían

#### Email de Bienvenida
- **Trigger**: Usuario nuevo creado automáticamente tras compra
- **Desde**: contacto@indomath.es
- **Contiene**:
  - Credenciales de acceso (email + contraseña temporal)
  - Detalles de la compra
  - Instrucciones para cambiar contraseña
  - Enlace directo para hacer login

#### Email de Recuperación (Futuro)
- **Trigger**: Usuario solicita recuperar contraseña
- **Desde**: contacto@indomath.es
- **Contiene**: Enlace seguro para restablecer contraseña

## Verificación de Configuración

Para verificar que todo está funcionando:

1. **Comprueba las variables de entorno**:
   ```bash
   # En tu terminal de desarrollo
   echo $SENDGRID_API_KEY
   ```

2. **Revisa los logs del servidor**:
   ```bash
   # Busca estos mensajes en la consola
   ✅ Email de bienvenida enviado a: [email]
   ❌ Error enviando email de bienvenida a: [email]
   ```

3. **Prueba el flujo completo**:
   - Hacer una compra de prueba
   - Verificar que el email llega
   - Confirmar que la contraseña funciona

## Solución de Problemas

### Error: "SENDGRID_API_KEY no está configurada"
- Verifica que la variable esté en `.env.local`
- Reinicia el servidor de desarrollo
- Asegúrate de que el nombre de la variable sea exacto

### Emails no llegan
- Verifica que el dominio esté autenticado en SendGrid
- Revisa la carpeta de spam del destinatario
- Comprueba los logs de SendGrid en su dashboard

### Error de autenticación
- Verifica que la API Key tenga los permisos correctos
- Asegúrate de que la API Key no haya expirado
- Regenera la API Key si es necesario

## Archivos Modificados

Los siguientes archivos fueron modificados para integrar SendGrid:

- `src/lib/email-service.ts` - Servicio de email con SendGrid
- `src/app/api/webhooks/stripe/route.ts` - Webhook que envía emails
- `src/app/api/verify-payment/route.ts` - Verificación de pagos con emails
- `package.json` - Dependencia @sendgrid/mail agregada

## Próximos Pasos

1. Configurar la variable de entorno `SENDGRID_API_KEY`
2. Verificar el dominio en SendGrid
3. Probar con una compra de prueba
4. Personalizar los templates de email si es necesario
