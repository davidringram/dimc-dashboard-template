import type { APIRoute } from 'astro';
import { createSupabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
    const supabase = createSupabase({ request } as any);

    const formData = await request.formData();
    const id = formData.get("lead_id");
    const newStatus = formData.get("status");
    // We grab the "current" URL to redirect back to, defaulting to the dashboard
    const currentUrl = formData.get("current_url")?.toString() || '/dashboard';

    if (id && newStatus) {
        // THE FIX: We update status AND 'created_at' to effectively "Re-birth" the lead to now.
        const { error } = await supabase
            .from('leads')
            .update({
                status: newStatus,
                created_at: new Date().toISOString() // Bumps lead to top of list & current month
            })
            .eq('id', id);

        if (error) console.error("Supabase Update Error:", error);
    }

    return redirect(currentUrl);
};