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

## Autenticação (cadastro e login)

O cadastro de usuários usa **Supabase Auth**. Sem configuração, o app roda em
**modo demonstração** (contas salvas só no navegador) — útil para testar, mas
**não use em produção**. Para ativar o cadastro real e seguro:

1. Crie um projeto grátis em <https://supabase.com>.
2. Em *Project Settings → API*, copie a **Project URL** e a **anon public key**.
3. Adicione como variáveis de ambiente na Cloudflare Pages:

   | Variável | Valor |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | a *Project URL* |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | a *anon public key* |

4. **Crie as tabelas:** em *SQL Editor → New query*, cole o conteúdo de
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) e
   clique em **Run**. Isso cria `profiles` e `orcamentos` com **RLS**, de modo
   que cada cliente só enxerga os próprios orçamentos.
5. Em *Supabase → Authentication → Providers*, mantenha **Email** ativo. Para
   uso interno, deixe **Confirm email** ligado (o usuário confirma por e-mail).
6. Para restringir quem pode se cadastrar (site interno), use *Authentication →
   Settings*: desative cadastros abertos e convide usuários, ou combine com o
   **Cloudflare Access** para um segundo fator de acesso à empresa.

### Planos (gratuito agora, mensal depois)

A tabela `profiles` já tem o campo `plano` (padrão `gratuito`). Quando ativar o
modo pago, basta integrar um provedor de cobrança (ex.: Stripe) e atualizar o
`plano` do usuário para `mensal` — a base de dados e o isolamento por cliente já
estão prontos para o modelo SaaS.

> Quando o projeto virar produto à venda, o Supabase já oferece perfis, papéis
> (RBAC) e integração com cobrança — base pronta para o modelo SaaS.

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
