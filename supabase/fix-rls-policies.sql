-- ==========================================
-- ARREGLAR POLÍTICAS RLS PARA PAGOS
-- Ejecutar este SQL en Supabase Dashboard
-- ==========================================

-- 1. ELIMINAR políticas actuales de content_access
DROP POLICY IF EXISTS "Users can insert their own content access" ON content_access;
DROP POLICY IF EXISTS "Users can update their own content access" ON content_access;
DROP POLICY IF EXISTS "Users can view their own content access" ON content_access;

-- 2. ELIMINAR políticas actuales de user_purchases
DROP POLICY IF EXISTS "Users can insert their own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Users can update their own purchases" ON user_purchases;
DROP POLICY IF EXISTS "Users can view their own purchases" ON user_purchases;

-- 3. CREAR nuevas políticas permisivas para content_access

-- Política SELECT: Permitir a usuarios autenticados ver acceso a contenido
CREATE POLICY "Allow authenticated users to view content access" ON content_access
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Política INSERT: Permitir a usuarios autenticados insertar acceso
CREATE POLICY "Allow authenticated users to insert content access" ON content_access
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Política UPDATE: Permitir a usuarios autenticados actualizar acceso
CREATE POLICY "Allow authenticated users to update content access" ON content_access
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- 4. CREAR nuevas políticas permisivas para user_purchases

-- Política SELECT: Permitir a usuarios autenticados ver compras
CREATE POLICY "Allow authenticated users to view purchases" ON user_purchases
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Política INSERT: Permitir a usuarios autenticados insertar compras
CREATE POLICY "Allow authenticated users to insert purchases" ON user_purchases
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Política UPDATE: Permitir a usuarios autenticados actualizar compras
CREATE POLICY "Allow authenticated users to update purchases" ON user_purchases
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- ==========================================
-- ALTERNATIVA: POLÍTICAS PÚBLICAS (SOLO PARA TESTING)
-- Descomenta estas líneas si las políticas de arriba no funcionan
-- ==========================================

/*
-- ELIMINAR políticas restrictivas
DROP POLICY IF EXISTS "Allow authenticated users to view content access" ON content_access;
DROP POLICY IF EXISTS "Allow authenticated users to view purchases" ON user_purchases;

-- CREAR políticas públicas temporales
CREATE POLICY "Public read access to content_access" ON content_access
  FOR SELECT USING (true);

CREATE POLICY "Public read access to user_purchases" ON user_purchases
  FOR SELECT USING (true);
*/

-- ==========================================
-- VERIFICAR que RLS esté habilitado correctamente
-- ==========================================

-- Asegurar que RLS esté configurado correctamente
ALTER TABLE content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- CONFIRMAR CAMBIOS
-- ==========================================

-- Ver políticas actuales de content_access
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'content_access';

-- Ver políticas actuales de user_purchases
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'user_purchases'; 