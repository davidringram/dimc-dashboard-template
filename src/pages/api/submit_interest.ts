import type { APIRoute } from "astro";
import { createSupabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
    // Initialize Supabase using the CURRENT environment's keys
    // This automatically routes data to the correct Client DB based on the Netlify site
    const supabase = createSupabase({ cookies });

    try {
        const formData = await request.formData();
        const email = formData.get("email")?.toString();

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
        }

        // Map Form Data to "God Tier" DB Schema
        const leadData = {
            name: formData.get("name")?.toString() || "Unknown Subject",
            email: email,
            phone: formData.get("phone")?.toString(),
            // Map "Location" input to 'geo_location' or 'company' depending on your final DB choice
            // (We settled on 'geo_location' in the last step)
            geo_location: formData.get("location")?.toString(),
            service: formData.get("service")?.toString(),
            notes: `Public Inquiry:\n${formData.get("details")?.toString() || ''}`,
            status: 'New',
            // Auto-tag source so you know it came from the website
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

        // Success - Redirect with flag
        return new Response(null, {
            status: 302,
            headers: { Location: "/?success=true" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
};