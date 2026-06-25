# Deploy na Cloudflare Pages

O CartoDie já está preparado para a Cloudflare: o cálculo de cartonagem roda no
navegador (sem servidor obrigatório) e a única rota dinâmica — `/api/vision` —
usa **Edge Runtime**, compatível com Cloudflare Pages Functions.

## Passo a passo

1. **Adicione o adaptador** (no seu ambiente local):

   ```bash
   npm install --save-dev @cloudflare/next-on-pages
   ```

2. **No painel da Cloudflare** → *Workers & Pages* → *Create application* →
   *Pages* → *Connect to Git* → selecione o repositório.

3. **Configurações de build:**

   | Campo | Valor |
   |-------|-------|
   | Framework preset | Next.js |
   | Build command | `npx @cloudflare/next-on-pages@1` |
   | Build output directory | `.vercel/output/static` |
   | Node version | `20` (variável `NODE_VERSION=20`) |

4. **Variáveis de ambiente** (Settings → Environment variables):

   - `OPENAI_API_KEY` → ativa o reconhecimento FEFCO por IA (opcional; sem ela o
     app usa o fallback heurístico e continua funcionando).

5. **Compatibilidade de runtime:** em *Settings → Functions*, marque a flag
   `nodejs_compat` (necessária para o Next no Cloudflare).

## Segurança (Cloudflare)

- Ative **SSL/TLS Full (strict)** e **Always Use HTTPS**.
- Ligue **WAF** (Web Application Firewall) e **Bot Fight Mode**.
- Use **Rate Limiting** na rota `/api/vision` para proteger a chave da IA.
- Habilite **Access** (Cloudflare Zero Trust) se quiser restringir o painel a
  usuários autenticados.

## Observação sobre upload de imagens

A rota `/api/vision` recebe a foto como Data URL (base64) e a repassa à IA, sem
gravar arquivos — nada é persistido no servidor, o que reduz a superfície de
risco. Para histórico de orçamentos no futuro, recomenda-se Cloudflare R2
(armazenamento) + D1 (banco) — ambos dentro do ecossistema Cloudflare.
