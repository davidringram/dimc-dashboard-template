import type { APIRoute } from "astro";
import { createSupabase } from "../../lib/supabase";

export const POST: APIRoute = async ({ request, cookies }) => {
    const supabase = createSupabase({ cookies });

    try {
        const formData = await request.formData();
        const email = formData.get("email")?.toString();

        if (!email) {
            return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
        }

        // Insert into 'leads' table
        const { error } = await supabase.from("leads").insert({
            email,
            name: "Interested User", // Placeholder since we only captured email
            status: "New",
            source: "Landing Page",
            notes: "Auto-captured from interest form",
            created_at: new Date().toISOString(),
        });

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        // Success - Redirect back to home with a query param for a thank you message
        return new Response(null, {
            status: 302,
            headers: { Location: "/?success=true" },
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
    }
};