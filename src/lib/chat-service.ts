import { supabaseService } from '@/lib/supabase-service';
import { Chat, ChatMessage, ChatWithMessages, FileUpload } from '@/types';

export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // Crear un nuevo chat
  async createChat(userId: string, title?: string): Promise<Chat> {
    try {
      const { data, error } = await supabaseService
        .from('chats')
        .insert({
          user_id: userId,
          title: title || 'Nueva conversación'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat:', error);
        throw new Error(`Error creating chat: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Exception creating chat:', error);
      throw error;
    }
  }

  // Obtener todos los chats de un usuario
  async getUserChats(userId: string): Promise<Chat[]> {
    const { data, error } = await supabaseService
      .from('chats')
      .select(`
        *,
        chat_messages (
          id,
          content,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching chats: ${error.message}`);
    }

    // Procesar los datos para incluir información adicional
    return data.map(chat => ({
      ...chat,
      message_count: chat.chat_messages?.length || 0,
      last_message: chat.chat_messages?.[0]?.content || null
    }));
  }

  // Obtener un chat específico con todos sus mensajes
  async getChatWithMessages(chatId: string): Promise<ChatWithMessages> {
    const { data, error } = await supabaseService
      .from('chats')
      .select(`
        *,
        chat_messages (
          *
        )
      `)
      .eq('id', chatId)
      .single();

    if (error) {
      throw new Error(`Error fetching chat: ${error.message}`);
    }

    return {
      ...data,
      messages: data.chat_messages || []
    };
  }

  // Guardar un mensaje en el chat
  async saveMessage(
    chatId: string,
    userId: string,
    role: 'user' | 'assistant',
    content: string,
    fileUpload?: FileUpload
  ): Promise<ChatMessage> {
    let fileUrl = null;
    let fileType = null;
    let fileName = null;

    // Si hay un archivo, subirlo primero
    if (fileUpload) {
      const uploadResult = await this.uploadFile(fileUpload, userId);
      fileUrl = uploadResult.url;
      fileType = uploadResult.type;
      fileName = uploadResult.name;
    }

    const { data, error } = await supabaseService
      .from('chat_messages')
      .insert({
        chat_id: chatId,
        user_id: userId,
        role,
        content,
        file_url: fileUrl,
        file_type: fileType,
        file_name: fileName
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error saving message: ${error.message}`);
    }

    return data;
  }

  // Subir archivo a Supabase Storage
  async uploadFile(fileUpload: FileUpload, userId: string): Promise<{
    url: string;
    type: string;
    name: string;
  }> {
    const file = fileUpload.file;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const filePath = `chat-files/${fileName}`;

    // Validar tipo de archivo
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'].includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP) y PDFs.');
    }

    // Validar tamaño (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB.');
    }

    const { error } = await supabaseService.storage
      .from('chat-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Error uploading file: ${error.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabaseService.storage
      .from('chat-files')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      type: file.type,
      name: file.name
    };
  }

  // Eliminar un chat
  async deleteChat(chatId: string): Promise<void> {
    const { error } = await supabaseService
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      throw new Error(`Error deleting chat: ${error.message}`);
    }
  }

  // Marcar mensaje como nota
  async toggleNote(messageId: string, isNote: boolean): Promise<void> {
    const { error } = await supabaseService
      .from('chat_messages')
      .update({ is_note: isNote })
      .eq('id', messageId);

    if (error) {
      throw new Error(`Error updating note: ${error.message}`);
    }
  }

  // Obtener todas las notas de un usuario
  async getUserNotes(userId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabaseService
      .from('chat_messages')
      .select(`
        *,
        chats (
          title
        )
      `)
      .eq('user_id', userId)
      .eq('is_note', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching notes: ${error.message}`);
    }

    return data || [];
  }

  // Actualizar título del chat
  async updateChatTitle(chatId: string, title: string): Promise<void> {
    const { error } = await supabaseService
      .from('chats')
      .update({ title })
      .eq('id', chatId);

    if (error) {
      throw new Error(`Error updating chat title: ${error.message}`);
    }
  }
} 