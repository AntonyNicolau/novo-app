# Conector WhatsApp — WhatsApp Monitor

Serviço Node.js que mantém uma sessão WhatsApp (protocolo **WhatsApp Web**, via
[Baileys](https://github.com/WhiskeySockets/Baileys)) por vendedor. Ele **apenas
observa**: lê o QR Code, escuta mensagens e presença e grava tudo no Supabase.
**Nunca envia, edita ou apaga mensagens.**

> ⚠️ Este serviço precisa rodar em um host **persistente** (processo sempre
> ligado) — não funciona em serverless/Vercel, pois mantém conexões WebSocket
> abertas com o WhatsApp. Use Railway, Render, Fly.io, uma VPS, etc.

## Como funciona

1. O gestor clica em **"Gerar QR Code"** no painel (`/conectar`). Isso marca a
   sessão do vendedor como `connecting` no banco.
2. Este conector detecta a solicitação (via Supabase Realtime), abre a conexão
   e publica o **QR Code** de volta no banco.
3. O painel renderiza o QR. O vendedor escaneia com
   *WhatsApp → Aparelhos conectados → Conectar um aparelho*.
4. Conectado, o conector registra cada mensagem e atualiza as métricas em tempo
   real. As credenciais ficam salvas em `auth_sessions/<seller_id>/` para
   reconexão automática.

## Rodando localmente

```bash
cd connector
cp .env.example .env          # preencha SUPABASE_SERVICE_ROLE_KEY
npm install
npm start
```

A `service_role key` fica em **Supabase → Project Settings → API → service_role**.
Ela é secreta — só vive aqui no servidor, nunca no front.

## Deploy (Railway / Render)

1. Crie um serviço Node apontando para a pasta `connector/`.
2. Comando de start: `npm start`.
3. Variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_DIR=/data/auth_sessions` (use um **volume persistente** para não
     precisar reescanear o QR a cada deploy).
4. Mantenha 1 instância (as sessões são afinadas com o disco local).

## Observações importantes

- Uso de bibliotecas não-oficiais do WhatsApp (Baileys) pode violar os Termos
  de Serviço do WhatsApp e levar a bloqueios do número. Avalie usar a
  **WhatsApp Business API / Cloud API** oficial em produção crítica — o mesmo
  esquema de banco e o mesmo painel funcionam: basta chamar as funções
  `record_wa_message` e `set_session_status` a partir dos webhooks oficiais.
- O serviço só lê grupos/status se você quiser; por padrão eles são ignorados.
