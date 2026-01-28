import type { APIRoute } from "astro";
import { createClient } from "@supabase/supabase-js";

export const POST: APIRoute = async ({ request }) => {
    // Use environment variables directly for public ingestion
    // This is more robust for public-facing forms
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return new Response(JSON.stringify({ error: "Server configuration missing." }), { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    try {
        const formData = await request.formData();
        const email = formData.get("email")?.toString();

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
        }

        // Map Form Data to our specific DB Schema
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

        // Insert into DB
        const { error } = await supabase.from("leads").insert([leadData]);

        if (error) {
            console.error("Supabase Error:", error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        // Success - Redirect back to home with success flag
        // This allows the index.astro to show the "Transmission Received" message
        return new Response(null, {
            status: 302,
            headers: { Location: "/?success=true" },
        });

    } catch (err) {
        console.error("Catch Error:", err);
        return new Response(JSON.stringify({ error: "System Error: Contact Terminated" }), { status: 500 });
    }
};