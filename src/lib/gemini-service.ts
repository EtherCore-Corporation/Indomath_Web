const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  error?: string;
}

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  public async sendMessage(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    try {
      // Prepare the conversation context for Gemini
      const conversationContext = this.buildConversationContext(message, conversationHistory);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: conversationContext
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const assistantResponse = data.candidates[0].content.parts[0].text;
        return { response: assistantResponse };
      } else {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from Gemini API');
      }

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return { 
        response: 'Lo siento, tuve un problema procesando tu pregunta. ¿Podrías intentar de nuevo?',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private buildConversationContext(message: string, conversationHistory: ChatMessage[]): string {
    const systemPrompt = `Eres un tutor especializado en matemáticas llamado "MathBot". Tu objetivo es ayudar a estudiantes a entender conceptos matemáticos de manera clara y didáctica.

Instrucciones importantes:
1. Responde siempre en español
2. Sé paciente y explica los conceptos paso a paso
3. Usa ejemplos prácticos cuando sea posible
4. Si es apropiado, incluye fórmulas matemáticas usando LaTeX (envuelto en $$)
5. Si no estás seguro de algo, admítelo honestamente
6. Mantén un tono amigable y motivador
7. Si la pregunta no es matemática, redirige amablemente al tema de matemáticas

Historial de la conversación:`;

    const conversationText = conversationHistory
      .map(msg => `${msg.role === 'user' ? 'Estudiante' : 'MathBot'}: ${msg.content}`)
      .join('\n');

    const currentMessage = `Estudiante: ${message}`;

    return `${systemPrompt}\n\n${conversationText}\n${currentMessage}`;
  }
} 