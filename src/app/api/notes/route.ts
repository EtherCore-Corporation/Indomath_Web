import { NextRequest, NextResponse } from 'next/server';
import { ChatService } from '@/lib/chat-service';
import { supabase } from '@/lib/supabase';

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

    const chatService = ChatService.getInstance();
    const notes = await chatService.getUserNotes(user.id);
    
    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Error getting notes:', error);
    return NextResponse.json(
      { error: 'Error al obtener las notas' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const { messageId, isNote } = await request.json();

    if (!messageId || typeof isNote !== 'boolean') {
      return NextResponse.json(
        { error: 'ID del mensaje y estado de nota requeridos' },
        { status: 400 }
      );
    }

    const chatService = ChatService.getInstance();
    await chatService.toggleNote(messageId, isNote);
    
    return NextResponse.json({ 
      message: isNote ? 'Mensaje marcado como nota' : 'Nota desmarcada' 
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la nota' },
      { status: 500 }
    );
  }
} 