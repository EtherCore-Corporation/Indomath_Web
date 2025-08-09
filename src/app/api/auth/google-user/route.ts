import { NextRequest, NextResponse } from 'next/server';

import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'User data is required' }, { status: 400 });
    }

    console.log('👤 Processing Google user:', user.email);

    // Check if this is a new Google user (created recently)
    const userCreatedAt = new Date(user.created_at);
    const now = new Date();
    const isNewUser = (now.getTime() - userCreatedAt.getTime()) < 60000; // Less than 1 minute old

    if (isNewUser) {
      console.log('🎉 New Google user detected, sending welcome email...');
      
      // Send welcome email for Google users
      try {
        const emailSent = await EmailService.sendWelcomeEmail({
          email: user.email,
          tempPassword: 'Tu cuenta está vinculada con Google',
          productName: 'Bienvenido a IndoMath',
          expiresAt: 'Acceso permanente'
        });

        if (emailSent) {
          console.log(`✅ Welcome email sent to Google user: ${user.email}`);
        } else {
          console.error(`❌ Failed to send welcome email to: ${user.email}`);
        }
      } catch (emailError) {
        console.error('Error sending welcome email to Google user:', emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Google user processed successfully',
      isNewUser 
    });

  } catch (error) {
    console.error('Error processing Google user:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
