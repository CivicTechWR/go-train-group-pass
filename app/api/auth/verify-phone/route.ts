import { NextRequest, NextResponse } from 'next/server';
import { phoneVerification } from '@/lib/twilio';
import { createClient } from '@/lib/supabase/server';
import { phoneSchema } from '@/lib/validations';
import { z } from 'zod';

const requestSchema = z.object({
  phone: phoneSchema,
  code: z
    .string()
    .min(4, 'Code must be at least 4 digits')
    .max(8, 'Code must be at most 8 digits'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name too long')
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, displayName } = requestSchema.parse(body);

    // Verify the code
    const verificationResult = await phoneVerification.verifyCode(phone, code);

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, error: verificationResult.error },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Check if user already exists by looking up in profiles table
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();

    let userId: string;
    let isNewUser = false;

    if (existingProfile) {
      // User exists, use their ID
      userId = existingProfile.id;
    } else {
      // Create new user with phone authentication
      const { data: newUser, error: createError } =
        await supabase.auth.admin.createUser({
          phone: phone,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            display_name:
              displayName ||
              phone
                .replace('+1', '')
                .replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
          },
        });

      if (createError) {
        console.error('Failed to create user:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
      isNewUser = true;
    }

    // Create or update profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      phone,
      display_name:
        displayName ||
        phone.replace('+1', '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
      reputation_score: 100,
      trips_completed: 0,
      on_time_payment_rate: 1,
      is_community_admin: false,
    });

    if (profileError) {
      console.error('Failed to create/update profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Generate session token for the user
    const { data: sessionData, error: sessionError } =
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userId + '@temp.com', // Use a temporary email since we're using phone auth
      });

    if (sessionError) {
      console.error('Failed to generate session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isNewUser
        ? 'Account created successfully'
        : 'Signed in successfully',
      userId,
      isNewUser,
      sessionUrl: sessionData.properties.action_link,
    });
  } catch (error: any) {
    console.error('Phone verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Phone verification failed' },
      { status: 500 }
    );
  }
}
