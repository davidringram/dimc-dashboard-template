import type { APIRoute } from 'astro';
import { createSupabase } from '../../lib/supabase';

export const POST: APIRoute = async ({ request, redirect }) => {
    const supabase = createSupabase({ request } as any);
    const formData = await request.formData();

    const id = formData.get("id");
    const action = formData.get("action"); // 'update' or 'delete'

    // 1. Handle Delete
    if (action === 'delete') {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) console.error("Delete Error:", error);
        return redirect('/dashboard');
    }

    // 2. Handle Update
    const updates = {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        estimated_value: parseFloat(formData.get("estimated_value")?.toString() || '0'),
        notes: formData.get("notes"),

        // Marketing Fields
        utm_source: formData.get("utm_source"),
        utm_medium: formData.get("utm_medium"),
        utm_campaign: formData.get("utm_campaign"),
    };

    const { error } = await supabase.from('leads').update(updates).eq('id', id);

    if (error) console.error("Update Error:", error);

    return redirect('/dashboard');
};