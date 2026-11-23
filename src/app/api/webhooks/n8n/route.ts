import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("x-webhook-secret") || req.headers.get("authorization");
    const configuredSecret = process.env.N8N_WEBHOOK_SECRET || "outreachos-n8n-bridge-secret";

    // Validate secret if configured
    if (process.env.N8N_WEBHOOK_SECRET && authHeader !== configuredSecret && authHeader !== `Bearer ${configuredSecret}`) {
      return NextResponse.json({ error: "Unauthorized webhook payload." }, { status: 401 });
    }

    const body = await req.json();
    const { event_type, workflow_id, payload } = body;

    const supabase = createAdminClient();

    switch (event_type) {
      case "message_sent": {
        if (payload?.prospect_id) {
          await supabase.from("outreach_events").insert({
            prospect_id: payload.prospect_id,
            step: payload.step ?? 1,
            channel: payload.channel || "email",
            action: payload.action || "email_sent",
            message: payload.message || null,
            message_id: payload.message_id || null,
            sent_at: payload.sent_at || new Date().toISOString(),
            response: payload.response || {},
          });

          // Update prospect current step
          if (payload.step !== undefined) {
            await supabase
              .from("prospects")
              .update({
                current_step: payload.step,
                processing: false,
                processing_started_at: null,
                next_send_at: payload.next_send_at || null,
              })
              .eq("id", payload.prospect_id);
          }
        }
        break;
      }

      case "reply_received": {
        if (payload?.prospect_id) {
          await supabase.from("outreach_events").insert({
            prospect_id: payload.prospect_id,
            step: payload.step ?? 0,
            channel: payload.channel || "email",
            action: "reply_received",
            message: payload.message || null,
            message_id: payload.message_id || null,
            sent_at: new Date().toISOString(),
            response: payload.response || {},
          });

          await supabase
            .from("prospects")
            .update({ status: "replied", processing: false })
            .eq("id", payload.prospect_id);
        }
        break;
      }

      case "restriction_detected": {
        if (payload?.account_id) {
          await supabase
            .from("linkedin_accounts")
            .update({
              health_state: "red",
              restriction_detected: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payload.account_id);
        }
        break;
      }

      case "lock_prospect": {
        if (payload?.prospect_id) {
          await supabase
            .from("prospects")
            .update({
              processing: true,
              processing_started_at: new Date().toISOString(),
            })
            .eq("id", payload.prospect_id);
        }
        break;
      }

      case "unlock_prospect": {
        if (payload?.prospect_id) {
          await supabase
            .from("prospects")
            .update({
              processing: false,
              processing_started_at: null,
            })
            .eq("id", payload.prospect_id);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      success: true,
      received_event: event_type,
      workflow: workflow_id,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal webhook failure" },
      { status: 500 }
    );
  }
}
