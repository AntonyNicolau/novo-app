# Deploy — WhatsMonitor

O **banco já está 100% online** no Supabase (projeto `whatsapp-monitor`,
região São Paulo) com schema, dados e Realtime ativos. Falta apenas publicar o
dashboard. São 2 minutos.

## 1) Publicar o dashboard na Vercel (recomendado — Git integration)

1. Acesse <https://vercel.com/new> e selecione o repositório
   **`AntonyNicolau/novo-app`**.
2. Em **Root Directory**, clique em *Edit* e selecione **`whatsapp-monitor`**.
   (Isso garante que o CartoDie na raiz **não** seja publicado.)
3. Framework: **Next.js** (detectado automaticamente).
4. Branch de produção: `claude/whatsapp-seller-monitoring-dh9k3c`
   (ou faça o merge para a sua branch principal antes).
5. **Environment Variables** (opcional — já há fallback embutido, mas o ideal é
   definir):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://jkyavukompbnzuotelpl.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_OeNMMlH-1xrxFCn7_rw7Jg_Ml0choKg`
6. Clique em **Deploy**. Em ~1 min você recebe a URL pública e o site fica
   sempre online, com deploy automático a cada push.

## 2) Alternativa — Vercel CLI (na sua máquina)

```bash
cd whatsapp-monitor
npx vercel        # faz login no navegador
npx vercel --prod
```

## 3) Subir o conector WhatsApp (para dados reais)

O dashboard já abre com dados de demonstração. Para capturar conversas reais via
QR Code, suba o serviço `connector/` em um host persistente (Railway, Render,
Fly.io ou VPS) — passo a passo em `connector/README.md`. Resumo:

1. Crie um serviço Node apontando para `whatsapp-monitor/connector`.
2. Variáveis: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Settings →
   API → service_role) e `AUTH_DIR` em volume persistente.
3. Start: `npm start`. Depois, no painel `/conectar`, clique em **Gerar QR Code**
   para cada vendedor e escaneie no celular.

---

### Por que o deploy não foi feito automaticamente?

A política de rede deste ambiente de execução bloqueia o acesso de saída a
`api.vercel.com` (resposta 403 do proxy de egress), então o build do Vercel não
pôde ser disparado a partir daqui. O passo 1 acima resolve em poucos cliques.
