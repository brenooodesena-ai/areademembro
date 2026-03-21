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
        let payload: any = {};
        try { payload = JSON.parse(rawBody || "{}"); } catch (e) { }

        // 0. IGNORAR WEBHOOKS DO SUPABASE (Database Webhooks)
        if (payload.table && payload.type && payload.record) {
            console.log(`ℹ️ [${requestId}] Database Webhook detectado (${payload.type} em ${payload.table}). Ignorando para evitar emails duplicados.`);
            return new Response(JSON.stringify({ status: 'ignored', message: 'Database Webhook ignorado' }), { status: 200, headers });
        }

        let email = payload.email || payload.customer?.email || payload.customer_email || payload.data?.email;
        let name = payload.name || payload.customer?.name || "Aluno";

        // Adicional: Se não houver campos de compra da Kiwify, ignora
        if (!email || (!payload.order_status && !payload.webhook_event_type)) {
            console.log(`ℹ️ [${requestId}] Webhook ignorado: Não parece uma venda da Kiwify.`);
            return new Response(JSON.stringify({ status: 'ignored', message: 'Não é um evento de venda' }), { status: 200, headers });
        }

        const resendKey = Deno.env.get('RESEND_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) throw new Error('SUPABASE_CONFIG_MISSING');

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const passwordHash = await hashPassword(DEFAULT_PASSWORD);

        // 1. VERIFICAR SE O ALUNO JÁ EXISTE
        const { data: existingStudent } = await supabase
            .from('students')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();

        const isNewStudent = !existingStudent;

        // 2. SE FOR ALUNO NOVO, CRIA COM SENHA PADRÃO. SE JÁ EXISTIR, NÃO MEXE NA SENHA.
        if (isNewStudent) {
            await supabase.from('students').insert({
                email: email.toLowerCase().trim(),
                name: name,
                password_hash: passwordHash,
                status: 'approved',
                approved_at: new Date().toISOString()
            });
        }

        // SEND EMAIL ONLY FOR NEW STUDENTS
        let deliveryStatus = "Pendente";
        let fullError = null;

        if (resendKey && isNewStudent) {
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
