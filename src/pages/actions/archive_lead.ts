import type { APIRoute } from 'astro';
import { createSupabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
    const supabase = createSupabase({ request } as any); // Type cast for context

    const formData = await request.formData();
    const id = formData.get("lead_id");

    if (id) {
        // Toggle archived to TRUE
        await supabase.from('leads').update({ archived: true }).eq('id', id);
    }

    return redirect('/dashboard');
};