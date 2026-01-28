import type { APIRoute } from 'astro';
import { createSupabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
    const supabase = createSupabase({ request } as any);

    // Fetch all leads (respecting RLS)
    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

    if (!leads) return new Response('No data', { status: 404 });

    // Convert JSON to CSV
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Value', 'Source', 'Campaign', 'Created At'];
    const csvRows = [headers.join(',')];

    leads.forEach(lead => {
        const row = [
            lead.id,
            `"${lead.name}"`, // Quote strings to handle commas in names
            lead.email,
            lead.phone,
            lead.status,
            lead.estimated_value,
            lead.utm_source,
            lead.utm_campaign,
            lead.created_at
        ];
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');

    return new Response(csvString, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="leads_export_${new Date().toISOString().split('T')[0]}.csv"`,
        },
    });
};