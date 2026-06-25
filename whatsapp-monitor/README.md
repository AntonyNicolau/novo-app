# WhatsMonitor — Monitoramento de Vendedores no WhatsApp

Sistema web **interno** para monitorar, em tempo real, a atividade dos
vendedores que usam o WhatsApp. **Não é um CRM** e **não permite responder
mensagens** — seu único objetivo é fornecer indicadores e monitoramento da
operação comercial.

> Projeto totalmente isolado do app **CartoDie** (na raiz deste repositório):
> banco, app e deploy próprios. Nada aqui interfere no outro projeto.

## Arquitetura

```
┌────────────────────┐   QR + leitura      ┌──────────────────────────┐
│  Celular do         │ ─────────────────▶ │  Conector (Baileys, Node) │
│  vendedor (WhatsApp)│                     │  host persistente         │
└────────────────────┘                     └────────────┬─────────────┘
                                                          │ grava (service_role)
                                                          ▼
                              ┌────────────────────────────────────────┐
                              │  Supabase (Postgres + Realtime)         │
                              │  sellers, whatsapp_sessions,            │
                              │  conversations, messages, alerts,       │
                              │  seller_metrics_daily                   │
                              └────────────────┬───────────────────────┘
                                               │ realtime (anon, somente leitura)
                                               ▼
                              ┌────────────────────────────────────────┐
                              │  Dashboard Next.js (Vercel)             │
                              │  KPIs ao vivo, vendedores, relatórios,  │
                              │  alertas, conexão por QR                │
                              └────────────────────────────────────────┘
```

- **Supabase** (`sa-east-1` / São Paulo): banco, Realtime e regras de acesso.
- **Dashboard** (este diretório): Next.js 15 + React 19, CSS puro, Recharts.
  Usa apenas a chave pública (`anon`) e tem acesso **somente de leitura** aos
  dados de monitoramento.
- **Conector** (`./connector`): mantém as sessões WhatsApp e alimenta o banco.
  Roda em host persistente (Railway/Render/VPS) — veja `connector/README.md`.

## Telas

| Rota              | Descrição                                                        |
| ----------------- | ---------------------------------------------------------------- |
| `/`               | Dashboard administrativo — todos os KPIs em tempo real           |
| `/vendedores`     | Lista de vendedores em cartões, com busca e filtros              |
| `/vendedores/[id]`| Página individual: dados, indicadores e conversas (acompanhar)   |
| `/relatorios`     | Relatórios diário/semanal/mensal + exportação PDF, Excel e CSV   |
| `/alertas`        | Alertas em tempo real + histórico resolvido                      |
| `/conectar`       | Conexão de cada vendedor via **QR Code** (igual WhatsApp Web)    |

## Indicadores do dashboard

Vendedores cadastrados · online · offline · conversas abertas · novas conversas
do dia · mensagens enviadas/recebidas · tempo médio de resposta · clientes
aguardando · WhatsApps desconectados · alertas ativos · última sincronização.

## Alertas automáticos

WhatsApp desconectado · vendedor offline em horário de trabalho · cliente
aguardando além de X minutos · vendedor sem atividade · grande volume de
conversas · falha na sincronização. Todos aparecem em tempo real no painel.

## Rodando o dashboard localmente

```bash
npm install
cp .env.example .env.local      # já vem com as chaves públicas do projeto
npm run dev                     # http://localhost:3000
```

As variáveis públicas (`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
já têm fallback embutido, então roda mesmo sem `.env`.

## Banco de dados

Schema versionado em `supabase/migrations/`. Funções principais:
`record_wa_message` (registra mensagem + métricas) e `set_session_status`
(estado da sessão + alerta de desconexão). Views `dashboard_stats` e
`seller_overview` alimentam o painel.

## Segurança

- O front usa apenas a chave **anon** com RLS: leitura dos dados de
  monitoramento + ações administrativas (cadastrar vendedor, solicitar conexão,
  resolver alerta). **Não há escrita de mensagens.**
- A escrita dos dados de WhatsApp é feita só pelo conector, com a chave
  **service_role** (secreta, fora do front).
- Para uso interno recomenda-se colocar o painel atrás de autenticação
  (Supabase Auth ou proteção da Vercel).
