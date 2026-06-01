// Recrutaê — Setup Admin: tabelas, RLS, seed de dados
// node setup-admin.js

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const env = Object.fromEntries(
  readFileSync(join(__dir, '.env'), 'utf8')
    .split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
);

const PROJECT_REF  = 'niqouquemmtaokciaxpn';
const ACCESS_TOKEN = env.SUPABASE_ACCESS_TOKEN;
const MGMT_BASE    = `https://api.supabase.com/v1/projects/${PROJECT_REF}`;
const HEADERS      = { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' };

const ok  = s => console.log(`  ✅ ${s}`);
const err = s => console.log(`  ❌ ${s}`);
const log = s => console.log(`  ℹ  ${s}`);

async function runSQL(label, sql) {
  const r = await fetch(`${MGMT_BASE}/database/query`, {
    method: 'POST', headers: HEADERS, body: JSON.stringify({ query: sql }),
  });
  if (r.ok) { ok(label); return true; }
  const t = await r.text();
  if (t.includes('already exists') || t.includes('duplicate')) { ok(`${label} (já existe)`); return true; }
  err(`${label} — ${r.status}: ${t.slice(0, 200)}`);
  return false;
}

console.log('\n══════════════════════════════════════════');
console.log('  Recrutaê — Setup Admin');
console.log('══════════════════════════════════════════\n');

// ── 1. Tabela analytics_events ────────────────────────────────────────────
console.log('① Criando tabela analytics_events...');
await runSQL('analytics_events criada', `
CREATE TABLE IF NOT EXISTS analytics_events (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT        NOT NULL,
  page       TEXT,
  referrer   TEXT,
  user_agent TEXT,
  session_id TEXT,
  meta       JSONB
);
CREATE INDEX IF NOT EXISTS idx_ae_created    ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_event_type ON analytics_events (event_type);
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
`);

await runSQL('RLS anon INSERT analytics_events', `
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'anon_insert'
  ) THEN
    EXECUTE 'CREATE POLICY anon_insert ON analytics_events FOR INSERT WITH CHECK (true)';
  END IF;
END $$;
`);

await runSQL('RLS authenticated SELECT analytics_events', `
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'auth_select'
  ) THEN
    EXECUTE 'CREATE POLICY auth_select ON analytics_events FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END $$;
`);

// ── 2. RLS para candidate_searches (admin lê) ─────────────────────────────
console.log('\n② Configurando RLS candidate_searches...');
await runSQL('RLS authenticated SELECT candidate_searches', `
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_searches' AND policyname = 'auth_select'
  ) THEN
    EXECUTE 'CREATE POLICY auth_select ON candidate_searches FOR SELECT USING (auth.role() = ''authenticated'')';
  END IF;
END $$;
`);

await runSQL('RLS authenticated UPDATE candidate_searches', `
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'candidate_searches' AND policyname = 'auth_update'
  ) THEN
    EXECUTE 'CREATE POLICY auth_update ON candidate_searches FOR UPDATE USING (auth.role() = ''authenticated'')';
  END IF;
END $$;
`);

// ── 3. Seed leads ─────────────────────────────────────────────────────────
console.log('\n③ Inserindo leads de teste...');

const leads = [
  {
    contact_name: 'Rafael Mendonça',
    contact_email: 'rafael.mendonca@vixpay.com.br',
    contact_phone: '(11) 98234-5671',
    contact_role: 'Head de Pessoas',
    company_name: 'VixPay',
    candidate_count: 94,
    status: 'new',
    audio_transcript: 'Olá, sou o Rafael, Head de Pessoas da VixPay. Somos uma fintech de pagamentos B2B que cresceu 3x no último ano. Precisamos de um Gerente de Growth Marketing para escalar nossa aquisição. A pessoa precisa ter experiência com PLG, growth loops e métricas de SaaS. Preferimos alguém que já trabalhou em fintech ou SaaS B2B.',
    text_answers: {
      cargo: 'Gerente de Growth Marketing',
      local: 'São Paulo — Híbrido 3x semana',
      senioridade: 'Sênior',
      contratacao: 'CLT',
      urgencia: '30 dias',
      diferenciais: 'Experiência em PLG e growth loops em ambiente SaaS B2B'
    },
    job_description: {
      titulo_vaga: 'Gerente de Growth Marketing',
      nivel_senioridade: 'Sênior',
      empresa: 'VixPay',
      setor: 'Fintech / Pagamentos B2B',
      contexto_empresa: 'A VixPay é uma fintech de pagamentos B2B que triplicou de tamanho no último ano, atendendo mais de 1.200 empresas médias no Brasil. Com rodada Série A de R$ 45M fechada em 2025, o momento é de escala acelerada e expansão para LatAm.',
      sobre_a_vaga: 'Buscamos um Gerente de Growth Marketing para liderar a estratégia de aquisição e ativação de novos clientes B2B, com foco em Product-Led Growth e canais digitais.',
      responsabilidades: ['Liderar estratégia de growth e geração de demanda B2B', 'Implementar loops de PLG e otimizar funil de ativação', 'Gerenciar budget de mídia paga (Google, LinkedIn)', 'Analisar cohorts e métricas de LTV/CAC'],
      requisitos_obrigatorios: ['5+ anos em marketing digital B2B', 'Experiência comprovada com PLG ou SaaS', 'Domínio de Google Analytics, Mixpanel ou Amplitude', 'Inglês avançado'],
      requisitos_desejaveis: ['Experiência em fintech ou pagamentos', 'Conhecimento de SQL para análise de dados', 'MBA ou especialização em marketing'],
      perfil_comportamental: ['Orientado a dados e resultados', 'Alta autonomia e visão de dono', 'Capacidade de execução em ambiente de alta velocidade'],
      modelo_trabalho: 'Híbrido 3x/semana — São Paulo',
      candidatos_mapeados: 94,
      analise_mercado: 'Perfil com boa disponibilidade no mercado paulistano. Combinação de growth B2B + experiência em fintech reduz o pool, mas ainda há candidatos qualificados ativos.',
      resumo_executivo: 'VixPay busca liderança de growth para escalar aquisição B2B pós-Série A. Vaga estratégica com orçamento e autonomia para construir o motor de crescimento da companhia.'
    }
  },
  {
    contact_name: 'Camila Ferreira',
    contact_email: 'camila.ferreira@shopflex.com.br',
    contact_phone: '(21) 97654-3210',
    contact_role: 'CEO',
    company_name: 'ShopFlex',
    candidate_count: 47,
    status: 'contacted',
    audio_transcript: 'Oi, sou a Camila, CEO da ShopFlex, uma plataforma de e-commerce para marcas DTC. Estamos em fase de product-market fit consolidado e precisamos de um Head de Produto para liderar nosso roadmap. Queremos alguém com experiência em plataformas de marketplace ou e-commerce, que saiba equilibrar necessidades de lojistas e consumidores finais.',
    text_answers: {
      cargo: 'Head de Produto',
      local: 'Rio de Janeiro — Remoto com visitas mensais',
      senioridade: 'Staff / Principal',
      contratacao: 'CLT ou PJ',
      urgencia: '45 dias',
      diferenciais: 'Experiência em plataformas two-sided (marketplace ou e-commerce)'
    },
    job_description: {
      titulo_vaga: 'Head de Produto',
      nivel_senioridade: 'Staff / Principal',
      empresa: 'ShopFlex',
      setor: 'E-commerce / Plataforma DTC',
      contexto_empresa: 'ShopFlex é uma plataforma SaaS de e-commerce para marcas DTC (Direct-to-Consumer) com mais de 800 lojistas ativos e GMV crescendo 15% ao mês. Baseada no Rio de Janeiro, a empresa opera 100% remote-first.',
      sobre_a_vaga: 'Head de Produto para definir e executar o roadmap da plataforma, liderando time de 8 PMs e designers, com foco em crescimento de GMV e retenção de lojistas.',
      responsabilidades: ['Definir visão e roadmap do produto ShopFlex', 'Liderar e desenvolver time de 8 PMs', 'Equilibrar necessidades de lojistas e consumidores finais', 'Colaborar com engenharia para entregas de alta qualidade'],
      requisitos_obrigatorios: ['8+ anos em produto digital, sendo 3+ em liderança', 'Experiência em marketplace ou plataforma two-sided', 'Forte senso analítico com dados de produto (DAU, retention, NPS)', 'Capacidade de influenciar stakeholders sem autoridade direta'],
      requisitos_desejaveis: ['Background técnico (engenharia ou ciência da computação)', 'Experiência em e-commerce ou retail tech', 'Inglês fluente'],
      perfil_comportamental: ['Pensamento sistêmico e visão de plataforma', 'Liderança servidora e desenvolvimento de times', 'Tomada de decisão baseada em dados e evidências'],
      modelo_trabalho: 'Remoto com visitas mensais ao Rio de Janeiro',
      candidatos_mapeados: 47,
      analise_mercado: 'Perfil sênior de Head de Produto com experiência específica em marketplace é escasso. Pool reduzido mas com candidatos de altíssima qualidade disponíveis no mercado.',
      resumo_executivo: 'ShopFlex busca liderança de produto para consolidar posição de mercado e acelerar crescimento de GMV. Oportunidade de construir o futuro de e-commerce DTC no Brasil.'
    }
  },
  {
    contact_name: 'Dr. Thiago Vasconcellos',
    contact_email: 'thiago.v@medsync.com.br',
    contact_phone: '(11) 99876-5432',
    contact_role: 'CTO',
    company_name: 'MedSync',
    candidate_count: 23,
    status: 'new',
    audio_transcript: 'Olá, sou o Thiago, CTO da MedSync. Desenvolvemos software de gestão hospitalar com IA para hospitais de médio porte. Precisamos de um Cientista de Dados Sênior especializado em dados clínicos e NLP para saúde. O projeto é desenvolver modelos de predição de readmissão hospitalar e análise de prontuários eletrônicos.',
    text_answers: {
      cargo: 'Cientista de Dados Sênior — Saúde',
      local: 'São Paulo — Híbrido',
      senioridade: 'Sênior',
      contratacao: 'CLT',
      urgencia: '60 dias',
      diferenciais: 'Experiência com dados clínicos, HL7/FHIR e NLP para prontuários eletrônicos'
    },
    job_description: {
      titulo_vaga: 'Cientista de Dados Sênior — Health AI',
      nivel_senioridade: 'Sênior',
      empresa: 'MedSync',
      setor: 'Healthtech / Software Hospitalar',
      contexto_empresa: 'MedSync desenvolve software de gestão hospitalar com inteligência artificial para hospitais de médio porte no Brasil. Atendemos 47 hospitais e processamos mais de 2 milhões de eventos clínicos por mês.',
      sobre_a_vaga: 'Cientista de Dados Sênior para liderar desenvolvimento de modelos preditivos em dados clínicos, com foco em redução de readmissão hospitalar e extração de informação de prontuários.',
      responsabilidades: ['Desenvolver modelos de predição de readmissão hospitalar', 'Implementar pipeline de NLP para análise de prontuários eletrônicos (HL7/FHIR)', 'Trabalhar com dados sensíveis em conformidade com LGPD e CFM', 'Colaborar com equipes médicas para validação clínica dos modelos'],
      requisitos_obrigatorios: ['Mestrado ou Doutorado em área quantitativa', 'Python avançado (scikit-learn, PyTorch ou TensorFlow)', 'Experiência com dados clínicos ou HL7/FHIR', 'NLP e modelos de linguagem para domínio especializado'],
      requisitos_desejaveis: ['Publicações em saúde digital ou bioinformática', 'Experiência com LGPD aplicada a dados de saúde', 'Conhecimento de fluxos hospitalares'],
      perfil_comportamental: ['Rigor científico e pensamento crítico', 'Capacidade de comunicar achados técnicos para stakeholders não-técnicos', 'Colaboração estreita com equipes multidisciplinares'],
      modelo_trabalho: 'Híbrido 2x/semana — São Paulo',
      candidatos_mapeados: 23,
      analise_mercado: 'Perfil altamente especializado com pool muito reduzido. Combinação de ciência de dados + domínio clínico + HL7 é rara no mercado brasileiro. Busca pode incluir profissionais em transição de pesquisa acadêmica.',
      resumo_executivo: 'MedSync busca especialista para construir capacidades de IA clínica que impactarão diretamente a qualidade do atendimento hospitalar. Projeto de alto impacto e relevância científica.'
    }
  },
  {
    contact_name: 'Beatriz Leal',
    contact_email: 'beatriz.leal@edumax.com.br',
    contact_phone: '(31) 98765-1234',
    contact_role: 'VP de Operações',
    company_name: 'EduMax',
    candidate_count: 61,
    status: 'converted',
    audio_transcript: 'Oi, sou Beatriz, VP de Operações da EduMax, plataforma de educação corporativa. Estamos expandindo para o mercado de grandes empresas e precisamos de um Diretor Comercial B2B com experiência em vendas enterprise de SaaS educacional. O ticket médio é R$ 180k por ano e queremos alguém que já trabalhou com ciclos de venda longos e múltiplos stakeholders.',
    text_answers: {
      cargo: 'Diretor Comercial B2B',
      local: 'Belo Horizonte ou São Paulo',
      senioridade: 'Diretor',
      contratacao: 'CLT com equity',
      urgencia: '30 dias',
      diferenciais: 'Experiência em vendas enterprise de SaaS com ticket médio acima de R$ 100k'
    },
    job_description: {
      titulo_vaga: 'Diretor Comercial B2B — Enterprise',
      nivel_senioridade: 'Diretor',
      empresa: 'EduMax',
      setor: 'Edtech / Educação Corporativa',
      contexto_empresa: 'EduMax é a principal plataforma de educação corporativa do Brasil, com mais de 200.000 colaboradores ativos em empresas clientes. Em expansão para o segmento enterprise, com contratos acima de R$ 500k/ano.',
      sobre_a_vaga: 'Diretor Comercial para liderar expansão enterprise, construir e gerenciar time de executivos de contas, e fechar contratos de grande porte com empresas Fortune 500 Brasil.',
      responsabilidades: ['Liderar time de 6 executivos de contas enterprise', 'Desenvolver e executar estratégia de go-to-market para grandes contas', 'Gerenciar pipeline com ciclos de 6-12 meses', 'Representar a empresa em eventos do setor e com decisores C-level'],
      requisitos_obrigatorios: ['10+ anos em vendas B2B, sendo 4+ em nível enterprise', 'Experiência em SaaS com ticket médio acima de R$ 100k/ano', 'Histórico comprovado de superar metas em vendas complexas', 'Rede de contatos em RH e L&D de grandes empresas'],
      requisitos_desejaveis: ['Experiência em edtech ou HCM (Workday, SAP SuccessFactors)', 'Participação em processos de fundraising ou M&A', 'MBA em Negócios ou Gestão'],
      perfil_comportamental: ['Liderança de alta performance e desenvolvimento de vendedores', 'Resiliência e capacidade de navegar vendas complexas', 'Foco em relacionamento de longo prazo com clientes'],
      modelo_trabalho: 'Híbrido — Belo Horizonte ou São Paulo',
      candidatos_mapeados: 61,
      analise_mercado: 'Diretores Comerciais com experiência enterprise em SaaS educacional têm boa disponibilidade no mercado. Perfil está ativo especialmente em São Paulo e Belo Horizonte.',
      resumo_executivo: 'EduMax busca liderança comercial para dobrar receita enterprise em 18 meses. Posição estratégica com participação em equity e visibilidade direta ao board.'
    }
  },
  {
    contact_name: 'Marcus Oliveira',
    contact_email: 'marcus.o@retailco.com.br',
    contact_phone: '(11) 97321-8654',
    contact_role: 'Diretor de Marketing',
    company_name: 'RetailCo',
    candidate_count: 78,
    status: 'new',
    audio_transcript: 'Oi, sou o Marcus, Diretor de Marketing da RetailCo, uma das maiores redes de varejo do Brasil com 340 lojas. Precisamos de um Coordenador de Marketing Digital para liderar a operação de mídia paga e CRM. A pessoa vai gerenciar um budget mensal de R$ 2,5 milhões em mídia e trabalhar com nossa base de 4 milhões de clientes no CRM.',
    text_answers: {
      cargo: 'Coordenador de Marketing Digital',
      local: 'São Paulo — Presencial',
      senioridade: 'Pleno/Sênior',
      contratacao: 'CLT',
      urgencia: '15 dias',
      diferenciais: 'Experiência com gestão de alto volume em mídia paga e CRM no varejo'
    },
    job_description: {
      titulo_vaga: 'Coordenador de Marketing Digital',
      nivel_senioridade: 'Pleno / Sênior',
      empresa: 'RetailCo',
      setor: 'Varejo / Retail',
      contexto_empresa: 'RetailCo é uma das maiores redes de varejo do Brasil, com 340 lojas físicas e operação e-commerce em crescimento. A empresa processa mais de 12 milhões de transações por mês e tem base CRM de 4 milhões de clientes.',
      sobre_a_vaga: 'Coordenador de Marketing Digital para gerenciar operações de mídia paga (R$ 2,5M/mês) e automação de CRM, com foco em aquisição online e retenção da base de clientes.',
      responsabilidades: ['Gerenciar campanhas de mídia paga (Google, Meta, TikTok) com budget de R$ 2,5M/mês', 'Operar plataforma de CRM e automação de email/SMS para 4M de clientes', 'Reportar KPIs semanalmente ao Diretor de Marketing', 'Coordenar agências e fornecedores de tecnologia'],
      requisitos_obrigatorios: ['4+ anos em marketing digital com foco em mídia paga', 'Experiência com alto volume de budget (R$ 1M+/mês)', 'Google Ads, Meta Business Manager (certificações preferencialmente)', 'Plataforma de CRM (Salesforce, HubSpot ou similar)'],
      requisitos_desejaveis: ['Experiência em varejo ou e-commerce de grande escala', 'Conhecimento de programática e DSPs', 'Google Analytics 4 e ferramentas de BI'],
      perfil_comportamental: ['Execução rápida e capacidade de gerenciar múltiplas campanhas', 'Foco em ROI e ROAS', 'Comunicação clara com stakeholders internos'],
      modelo_trabalho: 'Presencial 5x/semana — São Paulo (Pinheiros)',
      candidatos_mapeados: 78,
      analise_mercado: 'Perfil com boa disponibilidade em São Paulo. Coordenadores de marketing digital experientes com varejo estão ativos no mercado, especialmente pós-reestruturações de grandes redes.',
      resumo_executivo: 'RetailCo busca profissional de marketing digital para operar uma das maiores máquinas de mídia do varejo brasileiro. Posição com alta visibilidade e impacto direto em receita.'
    }
  },
  {
    contact_name: 'André Souza',
    contact_email: 'andre.souza@nexussaas.com.br',
    contact_phone: '(11) 96543-7890',
    contact_role: 'Engineering Manager',
    company_name: 'Nexus SaaS',
    candidate_count: 38,
    status: 'contacted',
    audio_transcript: 'Olá, aqui é o André, Engineering Manager da Nexus SaaS. Desenvolvemos software de gestão para escritórios contábeis e precisamos de um Engenheiro Backend Sênior especializado em Node.js e arquitetura de microsserviços. O projeto principal é uma migração de monolito para microsserviços com Kubernetes. Buscamos alguém com experiência real nesse tipo de migração.',
    text_answers: {
      cargo: 'Engenheiro Backend Sênior',
      local: 'Remoto — Brasil',
      senioridade: 'Sênior',
      contratacao: 'PJ',
      urgencia: '45 dias',
      diferenciais: 'Experiência comprovada em migração de monolito para microsserviços com Kubernetes'
    },
    job_description: {
      titulo_vaga: 'Engenheiro Backend Sênior — Node.js',
      nivel_senioridade: 'Sênior',
      empresa: 'Nexus SaaS',
      setor: 'B2B SaaS / Contabilidade',
      contexto_empresa: 'Nexus SaaS desenvolve software de gestão para escritórios contábeis, atendendo 2.800 escritórios e 45.000 usuários ativos. Com ARR de R$ 28M e crescimento de 80% ao ano, a empresa está investindo fortemente em infraestrutura e escalabilidade.',
      sobre_a_vaga: 'Engenheiro Backend Sênior para liderar iniciativa de migração de monolito para arquitetura de microsserviços, garantindo disponibilidade durante a transição e estabelecendo padrões técnicos.',
      responsabilidades: ['Liderar migração de monolito Node.js para microsserviços', 'Configurar e gerenciar clusters Kubernetes (EKS/GKE)', 'Definir padrões de API e contratos entre serviços', 'Mentoria técnica de engenheiros juniores e plenos'],
      requisitos_obrigatorios: ['5+ anos em backend com Node.js (TypeScript)', 'Experiência comprovada em migração de monolito para microsserviços', 'Kubernetes e Docker em produção', 'PostgreSQL avançado e Redis'],
      requisitos_desejaveis: ['AWS ou GCP com certificação', 'Experiência em DDD (Domain-Driven Design)', 'Conhecimento de filas de mensagem (Kafka, RabbitMQ)'],
      perfil_comportamental: ['Mentalidade de engenharia de plataforma', 'Comunicação técnica clara e documentação cuidadosa', 'Proatividade para identificar débito técnico e propor soluções'],
      modelo_trabalho: '100% Remoto — fuso horário Brasil',
      candidatos_mapeados: 38,
      analise_mercado: 'Engenheiros backend sênior com experiência real em Kubernetes e migração de microsserviços têm demanda alta no mercado. Pool limitado mas com profissionais disponíveis para regime PJ.',
      resumo_executivo: 'Nexus SaaS busca liderança técnica para projeto de modernização de infraestrutura crítico para suportar crescimento de 80% ao ano. Projeto de alto impacto técnico com autonomia.'
    }
  }
];

for (const lead of leads) {
  const ta = JSON.stringify(lead.text_answers).replace(/'/g, "''");
  const jd = JSON.stringify(lead.job_description).replace(/'/g, "''");
  const transcript = lead.audio_transcript.replace(/'/g, "''");
  const sql = `
    INSERT INTO candidate_searches
      (contact_name, contact_email, contact_phone, contact_role, company_name,
       audio_transcript, text_answers, job_description, candidate_count, status,
       created_at)
    VALUES (
      '${lead.contact_name.replace(/'/g, "''")}',
      '${lead.contact_email}',
      '${lead.contact_phone}',
      '${lead.contact_role.replace(/'/g, "''")}',
      '${lead.company_name.replace(/'/g, "''")}',
      '${transcript}',
      '${ta}'::jsonb,
      '${jd}'::jsonb,
      ${lead.candidate_count},
      '${lead.status}',
      NOW() - INTERVAL '${Math.floor(Math.random() * 20)} days'
    )
    ON CONFLICT DO NOTHING;
  `;
  await runSQL(`Lead: ${lead.contact_name} / ${lead.company_name}`, sql);
}

// ── 4. Seed analytics events ──────────────────────────────────────────────
console.log('\n④ Inserindo eventos de analytics...');

const pages = ['/', '/busca-candidatos.html', '/recrutamento-selecao.html', '/sou-candidato.html', '/blog.html'];
const eventTypes = ['page_view', 'page_view', 'page_view', 'cta_click', 'wizard_start', 'wizard_complete'];
const sessions = Array.from({ length: 12 }, (_, i) => `sess_${Math.random().toString(36).slice(2, 10)}`);

const analyticsSQL = `
INSERT INTO analytics_events (event_type, page, session_id, created_at, meta)
VALUES
  ('page_view', '/', '${sessions[0]}', NOW() - INTERVAL '18 days', '{"referrer":"google.com"}'),
  ('page_view', '/', '${sessions[1]}', NOW() - INTERVAL '17 days', '{"referrer":"linkedin.com"}'),
  ('cta_click', '/', '${sessions[0]}', NOW() - INTERVAL '18 days', '{"button":"buscar_candidatos"}'),
  ('page_view', '/busca-candidatos.html', '${sessions[0]}', NOW() - INTERVAL '18 days', '{}'),
  ('wizard_start', '/busca-candidatos.html', '${sessions[0]}', NOW() - INTERVAL '18 days', '{}'),
  ('wizard_complete', '/busca-candidatos.html', '${sessions[0]}', NOW() - INTERVAL '18 days', '{"candidate_count":94}'),
  ('page_view', '/', '${sessions[2]}', NOW() - INTERVAL '16 days', '{"referrer":"direct"}'),
  ('page_view', '/', '${sessions[3]}', NOW() - INTERVAL '15 days', '{"referrer":"google.com"}'),
  ('cta_click', '/', '${sessions[3]}', NOW() - INTERVAL '15 days', '{"button":"buscar_candidatos"}'),
  ('page_view', '/busca-candidatos.html', '${sessions[3]}', NOW() - INTERVAL '15 days', '{}'),
  ('wizard_start', '/busca-candidatos.html', '${sessions[3]}', NOW() - INTERVAL '15 days', '{}'),
  ('page_view', '/', '${sessions[4]}', NOW() - INTERVAL '14 days', '{"referrer":"instagram.com"}'),
  ('page_view', '/recrutamento-selecao.html', '${sessions[4]}', NOW() - INTERVAL '14 days', '{}'),
  ('page_view', '/', '${sessions[5]}', NOW() - INTERVAL '13 days', '{"referrer":"google.com"}'),
  ('cta_click', '/', '${sessions[5]}', NOW() - INTERVAL '13 days', '{"button":"falar_consultor"}'),
  ('page_view', '/', '${sessions[6]}', NOW() - INTERVAL '12 days', '{"referrer":"direct"}'),
  ('cta_click', '/', '${sessions[6]}', NOW() - INTERVAL '12 days', '{"button":"buscar_candidatos"}'),
  ('page_view', '/busca-candidatos.html', '${sessions[6]}', NOW() - INTERVAL '12 days', '{}'),
  ('wizard_start', '/busca-candidatos.html', '${sessions[6]}', NOW() - INTERVAL '12 days', '{}'),
  ('wizard_complete', '/busca-candidatos.html', '${sessions[6]}', NOW() - INTERVAL '12 days', '{"candidate_count":47}'),
  ('page_view', '/', '${sessions[7]}', NOW() - INTERVAL '10 days', '{"referrer":"google.com"}'),
  ('page_view', '/', '${sessions[8]}', NOW() - INTERVAL '9 days', '{"referrer":"linkedin.com"}'),
  ('cta_click', '/', '${sessions[8]}', NOW() - INTERVAL '9 days', '{"button":"buscar_candidatos"}'),
  ('page_view', '/busca-candidatos.html', '${sessions[8]}', NOW() - INTERVAL '9 days', '{}'),
  ('wizard_start', '/busca-candidatos.html', '${sessions[8]}', NOW() - INTERVAL '9 days', '{}'),
  ('wizard_complete', '/busca-candidatos.html', '${sessions[8]}', NOW() - INTERVAL '9 days', '{"candidate_count":23}'),
  ('page_view', '/', '${sessions[9]}', NOW() - INTERVAL '7 days', '{"referrer":"direct"}'),
  ('page_view', '/sou-candidato.html', '${sessions[9]}', NOW() - INTERVAL '7 days', '{}'),
  ('page_view', '/', '${sessions[10]}', NOW() - INTERVAL '5 days', '{"referrer":"google.com"}'),
  ('cta_click', '/', '${sessions[10]}', NOW() - INTERVAL '5 days', '{"button":"buscar_candidatos"}'),
  ('page_view', '/busca-candidatos.html', '${sessions[10]}', NOW() - INTERVAL '5 days', '{}'),
  ('wizard_start', '/busca-candidatos.html', '${sessions[10]}', NOW() - INTERVAL '5 days', '{}'),
  ('wizard_complete', '/busca-candidatos.html', '${sessions[10]}', NOW() - INTERVAL '5 days', '{"candidate_count":61}'),
  ('page_view', '/', '${sessions[11]}', NOW() - INTERVAL '2 days', '{"referrer":"instagram.com"}'),
  ('cta_click', '/', '${sessions[11]}', NOW() - INTERVAL '2 days', '{"button":"buscar_candidatos"}'),
  ('page_view', '/busca-candidatos.html', '${sessions[11]}', NOW() - INTERVAL '2 days', '{}'),
  ('wizard_start', '/busca-candidatos.html', '${sessions[11]}', NOW() - INTERVAL '2 days', '{}'),
  ('wizard_complete', '/busca-candidatos.html', '${sessions[11]}', NOW() - INTERVAL '2 days', '{"candidate_count":78}');
`;

await runSQL('38 eventos de analytics inseridos', analyticsSQL);

console.log('\n══════════════════════════════════════════');
console.log('  Setup concluído! 🎉');
console.log('══════════════════════════════════════════\n');
console.log('  Próximos passos:');
console.log('  1. Crie um usuário admin em: https://supabase.com/dashboard/project/niqouquemmtaokciaxpn/auth/users');
console.log('  2. Abra admin.html e faça login com esse usuário');
console.log('  3. Verifique os 6 leads e 38 eventos no dashboard\n');
