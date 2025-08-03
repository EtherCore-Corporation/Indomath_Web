-- Chat-related tables for MathBot functionality
-- These tables should be added to the existing schema

-- Tabla de chats (conversaciones)
CREATE TABLE public.chats (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabla de mensajes de chat
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id uuid REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text,
  file_url text, -- URL del archivo en Supabase Storage
  file_type text, -- 'image', 'pdf', etc.
  file_name text, -- Nombre original del archivo
  is_note boolean DEFAULT false, -- Marca si es una nota importante
  created_at timestamp with time zone DEFAULT now()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_chats_user_id ON public.chats(user_id);
CREATE INDEX idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para chats
CREATE POLICY "Users can view their own chats" ON public.chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats" ON public.chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats" ON public.chats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats" ON public.chats
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para mensajes de chat
CREATE POLICY "Users can view messages from their chats" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = chat_messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their chats" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats 
      WHERE chats.id = chat_messages.chat_id 
      AND chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own messages" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en chats
CREATE TRIGGER update_chats_updated_at 
  BEFORE UPDATE ON public.chats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 