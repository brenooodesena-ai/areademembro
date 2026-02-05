import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const DEFAULT_PASSWORD = "aluno123";
const SALT = "area-membros-salt";

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] --- INICIANDO V12 ---`);

    const headers = new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });

    if (req.method === 'OPTIONS') return new Response('ok', { headers });

    try {
        const rawBody = await req.text();
        let payload = {};
        try { payload = JSON.parse(rawBody || "{}"); } catch (e) { }

        let email = payload.email || payload.customer?.email || payload.customer_email || payload.data?.email;
        let name = payload.name || payload.customer?.name || "Aluno";

        if (!email) {
            return new Response(JSON.stringify({ status: 'ignored', message: 'Sem email no payload' }), { status: 200, headers });
        }

        const resendKey = Deno.env.get('RESEND_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) throw new Error('SUPABASE_CONFIG_MISSING');

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const passwordHash = await hashPassword(DEFAULT_PASSWORD);

        // UPSERT STUDENT
        await supabase.from('students').upsert({
            email: email.toLowerCase().trim(),
            name: name,
            password_hash: passwordHash,
            status: 'approved',
            approved_at: new Date().toISOString()
        }, { onConflict: 'email' });

        // SEND EMAIL
        let deliveryStatus = "Pendente";
        let fullError = null;

        if (resendKey) {
            const res = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resendKey}`
                },
                body: JSON.stringify({
                    from: 'onboarding@resend.dev', // O MAIS SIMPLES POSSÍVEL
                    to: email.trim(),
                    subject: 'Seu acesso chegou!',
                    html: `<p>Olá ${name}, sua senha é: <b>${DEFAULT_PASSWORD}</b></p>`
                })
            });

            const resText = await res.text();
            if (res.ok) {
                deliveryStatus = "Sucesso";
            } else {
                deliveryStatus = "Erro";
                fullError = JSON.parse(resText);
            }
        } else {
            deliveryStatus = "Sem Chave API";
        }

        return new Response(JSON.stringify({
            status: deliveryStatus,
            error_details: fullError,
            target_email: email,
            requestId
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({ status: 'error', message: err.message }), { status: 200, headers });
    }
});
