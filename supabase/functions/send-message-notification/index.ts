import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0"

// Secure CORS headers - restrict to specific origins in production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // TODO: Restrict to specific domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// HTML escaping function to prevent XSS attacks
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

interface NotificationRequest {
  messageId: string
  listingTitle: string
  senderName: string
  messageBody: string
  ownerUserId: string
  listingId: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Create admin client to get user email
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { 
      messageId, 
      listingTitle, 
      senderName, 
      messageBody, 
      ownerUserId, 
      listingId 
    }: NotificationRequest = await req.json()

    // Server-side validation for security
    if (!messageBody || messageBody.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Message body is required and must be under 500 characters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!listingTitle || listingTitle.length > 200) {
      return new Response(
        JSON.stringify({ error: 'Listing title is required and must be under 200 characters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!senderName || senderName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Sender name is required and must be under 100 characters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Sending notification for message:', messageId)

    // Get the owner's email using admin client
    const { data: { user: ownerUser }, error: ownerError } = await supabaseAdmin.auth.admin.getUserById(ownerUserId)
    
    if (ownerError || !ownerUser?.email) {
      console.error('Could not get owner email:', ownerError)
      return new Response(
        JSON.stringify({ error: 'Could not send notification - owner email not found' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Send email notification with properly escaped content
    const escapedListingTitle = escapeHtml(listingTitle);
    const escapedSenderName = escapeHtml(senderName);
    const escapedMessageBody = escapeHtml(messageBody);

    const emailResponse = await resend.emails.send({
      from: 'Property Listings <onboarding@resend.dev>',
      to: [ownerUser.email],
      subject: `New message about: ${escapedListingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">You have a new message!</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Property: ${escapedListingTitle}</h3>
            <p><strong>From:</strong> ${escapedSenderName}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; white-space: pre-wrap;">
              ${escapedMessageBody}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'vercel.app') || 'https://your-app.vercel.app'}/listing/${listingId}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View Listing
            </a>
            <br><br>
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'vercel.app') || 'https://your-app.vercel.app'}/inbox" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              View All Messages
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            This email was sent because someone sent you a message about your property listing. 
            You can manage your notification preferences in your account settings.
          </p>
        </div>
      `,
    })

    console.log('Email sent successfully:', emailResponse)

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in send-message-notification function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})