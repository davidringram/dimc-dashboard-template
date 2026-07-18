import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request }) => {
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return new Response(JSON.stringify({ error: "Server configuration missing." }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        const formData = await request.formData();
        
        const honeypot = formData.get("nickname");
        const gateToken = formData.get("gate_token");
        const email = formData.get("email")?.toString();

        // --- SECURITY PERIMETER ATTACK GATE ---
        // 1. If a bot completely stripped out the honeypot key to bypass validation -> DROP
        // 2. If a bot filled out the honeypot text input -> DROP
        if (honeypot === null || honeypot.toString().trim().length > 0) {
            console.warn("🛡️ Security Alert: Bot payload omitted required fields or filled trap.");
            return new Response(null, { status: 302, headers: { Location: "/?success=true" } });
        }

        // 3. HUMAN VELOCITY CHECK (Speed Trap)
        if (gateToken) {
            const submissionTime = Date.now();
            const loadTime = parseInt(gateToken.toString(), 10);
            const durationSeconds = (submissionTime - loadTime) / 1000;

            // If the form is filled out and submitted in under 2 seconds, it's machine automation
            if (durationSeconds < 2) {
                console.warn(`🛡️ Security Alert: Velocity bypass caught. Form filled in ${durationSeconds}s.`);
                return new Response(null, { status: 302, headers: { Location: "/?success=true" } });
            }
        } else {
            // Missing token means direct headless target execution -> DROP
            return new Response(null, { status: 302, headers: { Location: "/?success=true" } });
        }

        // --- CRITICAL DATA VALIDATION ---
        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
        }

        const leadData = {
            name: formData.get("name")?.toString() || "Unknown Subject",
            email: email,
            phone: formData.get("phone")?.toString() || null,
            geo_location: formData.get("location")?.toString() || null,
            service: formData.get("service")?.toString() || null,
            notes: `Public Inquiry:\n${formData.get("details")?.toString() || ''}`,
            status: 'New',
            utm_source: 'Website_Form',
            utm_medium: 'Organic',
            estimated_value: 0,
            created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("leads").insert([leadData]);

        if (error) {
            console.error("Supabase Error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(null, {
            status: 302,
            headers: { Location: "/?success=true" },
        });

    } catch (err) {
        console.error("System Failure:", err);
        return new Response(JSON.stringify({ error: "System Error" }), { status: 500 });
    }
};