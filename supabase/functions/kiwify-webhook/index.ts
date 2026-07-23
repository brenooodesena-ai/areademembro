import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { argon2id } from "https://esm.sh/hash-wasm@4.11.0";

// Helper to escape user‑provided data before inserting into HTML
function escapeHTML(str: string): string {
    if (!str) return '';
    return String(str).replace(/[&<>"]/g, (c) => {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;'
        } as Record<string, string>)[c] || c;
    });
}

// Generate a secure temporary password for new students
function generateTempPassword(): string {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    const raw = new Uint8Array(16);
    crypto.getRandomValues(raw);
    
    let pwd = "";
    for (let i = 0; i < 14; i++) {
        pwd += chars[raw[i] % chars.length];
    }
    // Append two symbols to ensure inclusion of special characters
    pwd += symbols[raw[14] % symbols.length];
    pwd += symbols[raw[15] % symbols.length];
    return pwd;
}

// Hash a plain‑text password using Argon2id with memorySize safe for Deno
async function hashPasswordAsync(password: string): Promise<string> {
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    const hash = await argon2id({
        password: password,
        salt: salt,
        parallelism: 1,
        iterations: 2,
        memorySize: 512, // safe memory limit for Deno sandboxed env
        hashLength: 32,
        outputType: "encoded",
    });
    return hash;
}

async function sendWelcomeEmailResend(resendKey: string, email: string, firstName: string, tempPassword: string) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
            from: 'Caminho Digital Master <suporte@caminhodigitalmaster.com>',
            to: email,
            subject: '🚀 Seu acesso à Área de Membros!',
            html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #ffffff; color: #333333; line-height: 1.6;">
          <div style="margin-bottom: 25px;">
            <p style="font-size: 18px; margin: 0 0 15px 0;">Olá, <strong>${escapeHTML(firstName)}</strong>!</p>
            <p style="font-size: 16px; margin: 0;">Sua inscrição foi confirmada com sucesso!</p>
          </div>
          <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Dados de acesso:</p>
            <p style="margin: 6px 0; font-size: 16px;"><strong>Email:</strong> <span style="color: #333; text-decoration: none;">${escapeHTML(email)}</span></p>
            <p style="margin: 6px 0; font-size: 16px;"><strong>Senha:</strong> <span style="color: #333;">${tempPassword}</span></p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://membros.caminhodigitalmaster.com" 
               style="background-color: #2ecc71; display: inline-block; padding: 18px 50px; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 20px; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);">
              Acesse aqui
            </a>
          </div>
          <div style="border-left: 4px solid #eeeeee; padding: 15px; background-color: #fafafa; margin-bottom: 30px; border-radius: 4px;">
            <p style="font-size: 14px; color: #555555; margin: 0;">
              <strong>ATENÇÃO:</strong> Por segurança, recomendamos que você altere sua senha imediatamente após o primeiro acesso à plataforma.
            </p>
          </div>
          <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="font-size: 16px; margin: 0;">
              Nos vemos na área de membros!!<br><br>
              <strong>Breno Sena</strong>
            </p>
          </div>
        </div>
      `
        })
    });
    return res.ok;
}

async function sendUpgradeEmailResend(resendKey: string, email: string, firstName: string) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
            from: 'Caminho Digital Master <suporte@caminhodigitalmaster.com>',
            to: email,
            subject: '🚀 Seu acesso foi atualizado!',
            html: `
        <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #ffffff; color: #333333; line-height: 1.6;">
          <div style="margin-bottom: 25px;">
            <p style="font-size: 18px; margin: 0 0 15px 0;">Olá, <strong>${escapeHTML(firstName)}</strong>!</p>
            <p style="font-size: 16px; margin: 0;">Recebemos a confirmação da sua nova compra. Seu acesso à Área de Membros foi atualizado com sucesso!</p>
          </div>
          <div style="background-color: #f9f9f9; border: 1px solid #eeeeee; padding: 20px; border-radius: 10px; margin-bottom: 30px;">
            <p style="margin: 0 0 12px 0; font-size: 13px; color: #999999; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Como acessar:</p>
            <p style="margin: 6px 0; font-size: 16px;">Você já possui um cadastro ativo conosco.</p>
            <p style="margin: 6px 0; font-size: 16px;">Basta fazer login usando o seu e-mail: <strong style="color: #333;">${email}</strong> e a sua <strong>senha atual</strong>.</p>
          </div>
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://membros.caminhodigitalmaster.com" 
               style="background-color: #2ecc71; display: inline-block; padding: 18px 50px; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 20px; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.2);">
              Acesse agora
            </a>
          </div>
          <div style="border-left: 4px solid #eeeeee; padding: 15px; background-color: #fafafa; margin-bottom: 30px; border-radius: 4px;">
            <p style="font-size: 14px; color: #555555; margin: 0;">
              <strong>Esqueceu sua senha?</strong> Não tem problema! Na tela de login, basta clicar em "Redefinir Senha".
            </p>
          </div>
          <div style="border-top: 1px solid #eeeeee; padding-top: 20px;">
            <p style="font-size: 16px; margin: 0;">
              Nos vemos na área de membros!!<br><br>
              <strong>Breno Sena</strong>
            </p>
          </div>
        </div>
      `
        })
    });
    return res.ok;
}

Deno.serve(async (req) => {
    const requestId = crypto.randomUUID();
    console.log(`[${requestId}] --- INICIANDO WEBHOOK KIWIFY ---`);

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
            console.log(`ℹ️ [${requestId}] Database Webhook detectado. Ignorando.`);
            return new Response(JSON.stringify({ status: 'ignored', message: 'Database Webhook ignorado' }), { status: 200, headers });
        }

        const clienteDados = payload.Customer || payload.customer || payload;
        if (!clienteDados || !clienteDados.email) {
            console.log(`ℹ️ [${requestId}] Webhook ignorado: Sem email do cliente.`);
            return new Response(JSON.stringify({ status: 'ignored', message: 'Sem email do cliente' }), { status: 200, headers });
        }

        // Expanded email extraction – covers all known Kiwify field names
        const emailCandidates = [
          clienteDados.email,
          clienteDados.customer_email,
          clienteDados.email_address,
          payload.email,
          payload.customer_email,
          payload.customer?.email,
          payload.data?.email,
          payload.email_address
        ];
        const email = emailCandidates.find(e => !!e);
        if (!email) {
          console.log(`ℹ️ [${requestId}] Webhook ignorado: Nenhum e‑mail encontrado nos campos: ${JSON.stringify(emailCandidates)}`);
          return new Response(JSON.stringify({ status: 'ignored', message: 'Sem email' }), { status: 200, headers });
        }
        const normalizedEmail = email.toLowerCase().trim();
        const fullName = clienteDados.full_name || clienteDados.name || 'Aluno';
        const firstName = clienteDados.first_name || fullName.split(' ')[0];
        // Use normalizedEmail for further DB ops
        // ----- Select Existing Student -----
        const { data: existingStudent, error: selectError } = await supabase
            .from('students')
            .select('*')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (selectError) throw selectError;

        // ----- Cancelamento / Reembolso -----
        const isRefund = ['refunded', 'chargeback', 'chargedback', 'canceled', 'cancelled', 'refused', 'disputed', 'refund_pending'].includes(status) ||
                         ['order_refunded', 'order_canceled', 'order_chargedback', 'subscription_canceled', 'order_refund_pending'].includes(eventType);

        if (isRefund) {
            if (existingStudent) {
                const { error: refundError } = await supabase
                    .from('students')
                    .update({ status: 'rejected', expiry_at: null })
                    .eq('email', normalizedEmail);
                if (refundError) throw refundError;
                console.log(`❌ [${requestId}] Acesso bloqueado para: ${normalizedEmail}`);
            } else {
                console.log(`ℹ️ [${requestId}] Reembolso recebido para aluno inexistente: ${normalizedEmail}`);
            }
            return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
        }
        const fullName = clienteDados.full_name || clienteDados.name || 'Aluno';
        const firstName = clienteDados.first_name || fullName.split(' ')[0];

        const rawStatus = payload.order_status || payload.status || payload.event || '';
        const status = String(rawStatus).toLowerCase().trim();
        const eventType = String(payload.webhook_event_type || '').toLowerCase().trim();

        if (!status && !eventType) {
            console.log(`ℹ️ [${requestId}] Webhook ignorado: Sem status ou tipo de evento.`);
            return new Response(JSON.stringify({ status: 'ignored', message: 'Sem status ou tipo de evento' }), { status: 200, headers });
        }

        console.log(`📩 [${requestId}] Processando ${email}. Status: ${status || eventType}`);

        const resendKey = Deno.env.get('RESEND_API_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) throw new Error('SUPABASE_CONFIG_MISSING');

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const orderBumps = payload.Complements?.order_bumps || [];
        const isLifetime = orderBumps.some((bump: any) => 
            bump.product_name && bump.product_name.toLowerCase().includes('vitalicio')
        );
        const accessType = isLifetime ? 'lifetime' : 'annual';
        const expiryAt = isLifetime ? null : new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

        // ----- Select Existing Student -----
        const { data: existingStudent, error: selectError } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (selectError) throw selectError;

        // ----- Cancelamento / Reembolso -----
        const isRefund = ['refunded', 'chargeback', 'chargedback', 'canceled', 'cancelled', 'refused', 'disputed'].includes(status) ||
                         ['order_refunded', 'order_canceled', 'order_chargedback', 'subscription_canceled'].includes(eventType);
        
        if (isRefund) {
            if (existingStudent) {
                const { error: refundError } = await supabase
                    .from('students')
                    .update({ status: 'rejected' })
                    .eq('email', email);
                if (refundError) throw refundError;
                console.log(`❌ [${requestId}] Acesso bloqueado para: ${email}`);
            } else {
                console.log(`ℹ️ [${requestId}] Reembolso recebido para aluno inexistente: ${email}`);
            }
            return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
        }

        // ----- Compra / Aprovação -----
        const isApproval = ['paid', 'approved', 'completed'].includes(status) ||
                           ['order_approved'].includes(eventType);

        if (isApproval) {
            const isNewStudent = !existingStudent || !existingStudent.password_hash;
            const isReturningStudent = existingStudent && existingStudent.status !== 'approved';

            if (isNewStudent || isReturningStudent) {
                const tempPassword = generateTempPassword();
                const hashedPassword = await hashPasswordAsync(tempPassword);

                if (isNewStudent) {
                    const { error: insertError } = await supabase
                        .from('students')
                        .insert({
                            email,
                            name: fullName,
                            status: 'approved',
                            lastAccess: new Date().toISOString(),
                            approved_at: new Date().toISOString(),
                            access_type: accessType,
                            expiry_at: expiryAt,
                            password_hash: hashedPassword
                        });
                    if (insertError) throw insertError;
                    console.log(`✅ [${requestId}] Novo aluno criado (${accessType}): ${email}`);
                } else {
                    const { error: updateError } = await supabase
                        .from('students')
                        .update({
                            status: 'approved',
                            lastAccess: new Date().toISOString(),
                            access_type: accessType,
                            expiry_at: expiryAt,
                            password_hash: hashedPassword,
                            name: fullName
                        })
                        .eq('email', email);
                    if (updateError) throw updateError;
                    console.log(`✅ [${requestId}] Aluno reativado com nova senha (${accessType}): ${email}`);
                }
                
                if (resendKey) {
                    await sendWelcomeEmailResend(resendKey, email, firstName, tempPassword);
                } else {
                    console.warn('⚠️ RESEND_API_KEY não configurada na Edge Function.');
                }
            } else {
                // Aluno já existe e já está ativo
                const { error: updateError } = await supabase
                    .from('students')
                    .update({
                        status: 'approved',
                        lastAccess: new Date().toISOString(),
                        access_type: accessType,
                        expiry_at: expiryAt,
                        name: fullName
                    })
                    .eq('email', email);
                if (updateError) throw updateError;
                
                console.log(`✅ [${requestId}] Aluno atualizado (${accessType}): ${email}`);
                if (resendKey) {
                    await sendUpgradeEmailResend(resendKey, email, firstName);
                }
            }
        }

        return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });

    } catch (err) {
        console.error(`❌ [${requestId}] Erro no webhook:`, err.message);
        return new Response(JSON.stringify({ status: 'error', message: err.message }), { status: 200, headers });
    }
});
