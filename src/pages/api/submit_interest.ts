import type { APIRoute } from "astro";
import { createSupabase } from "../../../lib/supabase";

export const POST: APIRoute = async ({ request, redirect }) => {
    // 1. Setup Supabase (Use Service Role Key if RLS blocks public inserts, 
    // but for now we assume public can insert 'New' leads or we use standard client)
    const supabase = createSupabase({ request } as any);

    const formData = await request.formData();

    // 2. Extract Data
    const leadData = {
        name: formData.get("name")?.toString(),
        email: formData.get("email")?.toString(),
        phone: formData.get("phone")?.toString(),
        company: formData.get("company")?.toString(), // You might need to add this column to DB later, or put in notes
        notes: `Public Application:\n${formData.get("details")?.toString() || 'No details provided.'}`,
        status: 'New',
        utm_source: 'Website_Application',
        estimated_value: 0, // You set this later
        created_at: new Date().toISOString(),
    };

    // 3. Insert into Database
    const { error } = await supabase.from('leads').insert([leadData]);

    if (error) {
        console.error("Lead Gen Error:", error);
        return new Response(error.message, { status: 500 });
    }

    // 4. Redirect to Thank You
    return redirect("/?success=true");
};