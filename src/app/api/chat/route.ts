import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/gemini-service';
import { ChatService } from '@/lib/chat-service';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Chat API called');
    
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    console.log('🔑 Auth header present:', !!authHeader);
    console.log('🔑 Auth header starts with Bearer:', authHeader?.startsWith('Bearer '));
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token length:', token.length);
    console.log('🔑 Token starts with:', token.substring(0, 20) + '...');

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.error('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Usuario no autenticado', details: authError.message },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('❌ No user found');
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.email);

    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { message, chatId, fileUpload } = body;

    if (!message || typeof message !== 'string') {
      console.error('❌ Invalid message:', message);
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    console.log('✅ Message validated:', message.substring(0, 50) + '...');

    const chatService = ChatService.getInstance();
    const geminiService = GeminiService.getInstance();

    let currentChatId = chatId;

    // Si no hay chatId, crear un nuevo chat
    if (!currentChatId) {
      console.log('🆕 Creating new chat for user:', user.id);
      const newChat = await chatService.createChat(user.id);
      currentChatId = newChat.id;
      console.log('✅ New chat created:', currentChatId);
    }

    // Obtener historial del chat
    console.log('📚 Getting chat history for:', currentChatId);
    const chatWithMessages = await chatService.getChatWithMessages(currentChatId);
    const conversationHistory = chatWithMessages.messages.map(msg => ({
      role: msg.role,
      content: msg.content || '',
      timestamp: new Date(msg.created_at)
    }));
    console.log('📚 Conversation history length:', conversationHistory.length);

    // Guardar mensaje del usuario
    console.log('💾 Saving user message...');
    const userMessage = await chatService.saveMessage(
      currentChatId,
      user.id,
      'user',
      message,
      fileUpload
    );
    console.log('✅ User message saved:', userMessage.id);

    // Obtener respuesta de Gemini
    console.log('🤖 Getting response from Gemini...');
    const geminiResponse = await geminiService.sendMessage(message, conversationHistory);

    if (geminiResponse.error) {
      console.error('❌ Gemini error:', geminiResponse.error);
      return NextResponse.json(
        { 
          response: 'Lo siento, tuve un problema procesando tu pregunta. ¿Podrías intentar de nuevo?',
          error: geminiResponse.error,
          chat_id: currentChatId
        },
        { status: 500 }
      );
    }

    console.log('✅ Gemini response received:', geminiResponse.response.substring(0, 50) + '...');

    // Guardar respuesta del asistente
    console.log('💾 Saving assistant message...');
    const assistantMessage = await chatService.saveMessage(
      currentChatId,
      user.id,
      'assistant',
      geminiResponse.response
    );
    console.log('✅ Assistant message saved:', assistantMessage.id);

    const response = {
      response: geminiResponse.response,
      chat_id: currentChatId,
      message_id: assistantMessage.id
    };

    console.log('✅ Returning response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json(
      { 
        response: 'Lo siento, ocurrió un error interno. Por favor, intenta de nuevo.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    const chatService = ChatService.getInstance();

    if (chatId) {
      // Obtener chat específico con mensajes
      const chatWithMessages = await chatService.getChatWithMessages(chatId);
      return NextResponse.json({ chat: chatWithMessages });
    } else {
      // Obtener todos los chats del usuario
      const chats = await chatService.getUserChats(user.id);
      return NextResponse.json({ chats });
    }

  } catch (error) {
    console.error('Error getting chat history:', error);
    return NextResponse.json(
      { error: 'Error al obtener el historial' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'ID del chat requerido' },
        { status: 400 }
      );
    }

    const chatService = ChatService.getInstance();
    await chatService.deleteChat(chatId);
    
    return NextResponse.json({ message: 'Chat eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el chat' },
      { status: 500 }
    );
  }
} 