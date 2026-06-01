// Recrutaê — Teste de integração (Claude + Resend)
// Roda localmente sem precisar de deploy: node test-integration.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));

// Lê o .env manualmente (sem dotenv)
const env = Object.fromEntries(
  readFileSync(join(__dir, '.env'), 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);

const ANTHROPIC_KEY    = env.ANTHROPIC_API_KEY;
const RESEND_KEY       = env.RESEND_API_KEY;
const RECRUITER_EMAIL  = env.RECRUITER_EMAIL;
const FROM_EMAIL       = env.RESEND_FROM_EMAIL;

const ok  = s => console.log(`  ✅ ${s}`);
const err = s => console.log(`  ❌ ${s}`);
const log = s => console.log(`  ℹ  ${s}`);

console.log('\n══════════════════════════════════════════');
console.log('  Recrutaê — Teste de Integração');
console.log('══════════════════════════════════════════\n');

// ── 1. Gerar job description com OpenAI GPT-4o ────────────────────────────
console.log('① Chamando OpenAI (GPT-4o)...');

const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    max_tokens: 900,
    response_format: { type: 'json_object' },
    messages: [{
      role: 'user',
      content: `Você é um especialista em recrutamento executivo no Brasil. Gere um JSON de job description de TESTE para a posição de "Gerente de Marketing Digital" em uma fintech em crescimento. Retorne APENAS o JSON com os campos: titulo_vaga, nivel_senioridade, empresa, contexto_empresa (1 parágrafo), resumo_executivo (1 parágrafo), requisitos_obrigatorios (array 3 itens), perfil_comportamental (array 3 itens), modelo_trabalho.`
    }]
  }),
});

let jd = {};
if (openaiResp.ok) {
  const od = await openaiResp.json();
  try {
    jd = JSON.parse(od.choices[0].message.content);
    ok(`OpenAI → "${jd.titulo_vaga}" | ${jd.nivel_senioridade} | ${jd.modelo_trabalho}`);
  } catch {
    log('JSON inválido — usando fallback');
    jd = {
      titulo_vaga: 'Gerente de Marketing Digital',
      nivel_senioridade: 'Sênior',
      empresa: 'FinTech Demo',
      contexto_empresa: 'Startup de pagamentos digitais em fase de expansão acelerada.',
      resumo_executivo: 'Profissional experiente para liderar a estratégia de marketing de crescimento.',
      requisitos_obrigatorios: ['5+ anos em marketing digital', 'Google Analytics e Meta Ads', 'Experiência em fintechs'],
      perfil_comportamental: ['Alta autonomia', 'Orientado a dados', 'Dono do negócio'],
      modelo_trabalho: 'Híbrido 3x/semana — São Paulo',
    };
  }
} else {
  const e = await openaiResp.text();
  err(`OpenAI falhou (${openaiResp.status}): ${e.slice(0, 120)}`);
  process.exit(1);
}

// ── 2. Teste Resend (email) ────────────────────────────────────────────────
console.log('\n② Enviando email via Resend...');
log(`De: ${FROM_EMAIL}`);
log(`Para: ${RECRUITER_EMAIL}`);

const li = arr => (arr || []).map(x => `<li style="margin-bottom:5px">${x}</li>`).join('');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td>
<table width="600" align="center" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto">

  <tr><td style="background:#1F1C4B;padding:32px 40px;text-align:center">
    <p style="color:#F5B914;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;margin:0 0 6px">TESTE DE INTEGRAÇÃO ✓</p>
    <h1 style="color:#F5F0E8;font-size:22px;font-weight:800;margin:0;line-height:1.2">${jd.titulo_vaga}</h1>
    <p style="color:rgba(245,240,232,.5);font-size:13px;margin:8px 0 0">${jd.empresa} · ${new Date().toLocaleDateString('pt-BR')}</p>
  </td></tr>

  <tr><td style="background:white;padding:28px 40px;border-bottom:1px solid #EDE8DE">
    <p style="color:#1F1C4B;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 14px">Contato (dados de teste)</p>
    <table width="100%">
      <tr>
        <td width="50%"><p style="margin:0 0 4px;font-size:11px;color:#6B6860;text-transform:uppercase">Nome</p><p style="margin:0;font-size:15px;font-weight:600;color:#0D0C1D">João Silva</p></td>
        <td width="50%"><p style="margin:0 0 4px;font-size:11px;color:#6B6860;text-transform:uppercase">Cargo</p><p style="margin:0;font-size:15px;font-weight:600;color:#0D0C1D">CEO</p></td>
      </tr>
      <tr><td style="padding-top:12px"><p style="margin:0 0 4px;font-size:11px;color:#6B6860;text-transform:uppercase">Email</p><p style="margin:0;font-size:14px;color:#1F1C4B">joao@empresademo.com.br</p></td>
      <td style="padding-top:12px"><p style="margin:0 0 4px;font-size:11px;color:#6B6860;text-transform:uppercase">WhatsApp</p><p style="margin:0;font-size:14px;color:#1F1C4B">(11) 99999-9999</p></td></tr>
    </table>
  </td></tr>

  <tr><td style="background:#1F1C4B;padding:22px 40px;text-align:center">
    <p style="color:#F5B914;font-size:44px;font-weight:800;margin:0;line-height:1">87</p>
    <p style="color:rgba(245,240,232,.5);font-size:11px;margin:5px 0 0;text-transform:uppercase;letter-spacing:.1em">candidatos mapeados</p>
  </td></tr>

  <tr><td style="background:white;padding:28px 40px;border-bottom:1px solid #EDE8DE">
    <p style="color:#1F1C4B;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 10px">Resumo executivo</p>
    <p style="font-size:14px;color:#0D0C1D;line-height:1.65;margin:0">${jd.resumo_executivo}</p>
  </td></tr>

  <tr><td style="background:white;padding:28px 40px;border-bottom:1px solid #EDE8DE">
    <p style="color:#1F1C4B;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 10px">Contexto da empresa</p>
    <p style="font-size:13px;color:#6B6860;line-height:1.7;margin:0">${jd.contexto_empresa}</p>
  </td></tr>

  <tr><td style="background:white;padding:28px 40px;border-bottom:1px solid #EDE8DE">
    <p style="color:#1F1C4B;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 12px">Requisitos obrigatórios</p>
    <ul style="margin:0;padding-left:18px;font-size:13px;color:#0D0C1D;line-height:1.65">${li(jd.requisitos_obrigatorios)}</ul>
  </td></tr>

  <tr><td style="background:white;padding:28px 40px;border-bottom:1px solid #EDE8DE">
    <p style="color:#1F1C4B;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 12px">Perfil comportamental</p>
    <ul style="margin:0;padding-left:18px;font-size:13px;color:#0D0C1D;line-height:1.65">${li(jd.perfil_comportamental)}</ul>
  </td></tr>

  <tr><td style="background:#F5F0E8;padding:28px 40px">
    <p style="color:#1F1C4B;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin:0 0 10px">Transcrição do vídeo (teste)</p>
    <p style="font-size:13px;color:#6B6860;font-style:italic;line-height:1.7;margin:0">"Olá, sou o João, CEO da Empresa Demo. Estamos crescendo 30% ao mês e precisamos de um gerente de marketing forte para escalar nossa aquisição de clientes. É uma vaga estratégica para nós."</p>
  </td></tr>

  <tr><td style="background:#0D0C1D;padding:18px 40px;text-align:center">
    <p style="color:rgba(245,240,232,.25);font-size:11px;margin:0">Email de teste · Recrutaê © ${new Date().getFullYear()}</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;

const emailResp = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${RESEND_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: FROM_EMAIL,
    to: [RECRUITER_EMAIL],
    subject: `[TESTE Recrutaê] ${jd.titulo_vaga} — João Silva / Empresa Demo`,
    html,
  }),
});

const emailData = await emailResp.json();
if (emailData.id) {
  ok(`Email enviado! ID: ${emailData.id}`);
  ok(`Verifique a caixa de ${RECRUITER_EMAIL}`);
} else {
  err(`Resend (${emailResp.status}): ${JSON.stringify(emailData)}`);
}

console.log('\n══════════════════════════════════════════\n');
