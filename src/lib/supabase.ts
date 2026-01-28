import { createServerClient, parseCookieHeader } from '@supabase/ssr';

export const createSupabase = (context: any) => {
    return createServerClient(
        // PASTE YOUR REAL URL HERE (inside quotes):
        'https://infjgdjzlwtwondwwsdp.supabase.co',

        // PASTE YOUR REAL ANON KEY HERE (inside quotes):
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluZmpnZGp6bHd0d29uZHd3c2RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDE0ODQsImV4cCI6MjA4NTExNzQ4NH0.04JYmsVFOcScjQBZ4kdvsTnV8uGRKAKB21OqsnjkV6E',

        {
            cookies: {
                getAll() {
                    return parseCookieHeader(context.request.headers.get('Cookie') ?? '');
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        context.cookies.set(name, value, options)
                    );
                },
            },
        }
    );
};