-- Tabla para almacenar las compras de los usuarios
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_product_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('course', 'module')),
  course_type TEXT CHECK (course_type IN ('CIENCIAS', 'CCSS', 'complete')),
  amount INTEGER NOT NULL, -- en centavos
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL, -- 1 año después de la compra
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para el acceso a contenido específico
CREATE TABLE IF NOT EXISTS content_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES user_purchases(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'module', 'lesson')),
  content_id TEXT NOT NULL, -- ID del curso, módulo o lección
  course_type TEXT CHECK (course_type IN ('CIENCIAS', 'CCSS')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_status ON user_purchases(status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_expires_at ON user_purchases(expires_at);
CREATE INDEX IF NOT EXISTS idx_content_access_user_id ON content_access(user_id);
CREATE INDEX IF NOT EXISTS idx_content_access_content_id ON content_access(content_id);
CREATE INDEX IF NOT EXISTS idx_content_access_expires_at ON content_access(expires_at);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_purchases_updated_at 
    BEFORE UPDATE ON user_purchases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar si un usuario tiene acceso a un contenido
CREATE OR REPLACE FUNCTION check_user_access(
  p_user_id UUID,
  p_content_type TEXT,
  p_content_id TEXT,
  p_course_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM content_access ca
    WHERE ca.user_id = p_user_id
      AND ca.content_type = p_content_type
      AND ca.content_id = p_content_id
      AND (p_course_type IS NULL OR ca.course_type = p_course_type)
      AND ca.is_active = true
      AND ca.expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener todos los contenidos a los que tiene acceso un usuario
CREATE OR REPLACE FUNCTION get_user_accessible_content(p_user_id UUID)
RETURNS TABLE (
  content_type TEXT,
  content_id TEXT,
  course_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.content_type,
    ca.content_id,
    ca.course_type,
    ca.expires_at
  FROM content_access ca
  WHERE ca.user_id = p_user_id
    AND ca.is_active = true
    AND ca.expires_at > NOW()
  ORDER BY ca.content_type, ca.content_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas RLS (Row Level Security)
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access ENABLE ROW LEVEL SECURITY;

-- Políticas para user_purchases
CREATE POLICY "Users can view their own purchases" ON user_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON user_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" ON user_purchases
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para content_access
CREATE POLICY "Users can view their own content access" ON content_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content access" ON content_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content access" ON content_access
  FOR UPDATE USING (auth.uid() = user_id); 