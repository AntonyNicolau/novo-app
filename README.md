# FuelWise — Gestão de Combustível para Frotas

MVP de uma plataforma SaaS de controle de combustível para pequenas e médias
frotas. O motorista registra cada abastecimento pelo celular; o gestor acompanha
consumo, custos e **alertas inteligentes** de inconsistência em um dashboard.

## Funcionalidades do MVP

- **App do motorista** (`/abastecimento`): registro de km, data/hora, litros,
  valor pago e posto, com cálculo do preço por litro em tempo real.
- **Dashboard do gestor** (`/dashboard`): KPIs da frota, gráfico de consumo
  (km/L) por veículo, gasto por veículo e tabela de desempenho.
- **Gestão de veículos** (`/veiculos`): cadastro de placa, modelo e capacidade
  do tanque.
- **Histórico** (`/abastecimentos`): todos os abastecimentos com filtro por
  veículo e métricas calculadas (R$/L, km/L).
- **Motor de alertas**: detecta automaticamente
  - quilometragem regressiva/inconsistente,
  - litros acima da capacidade do tanque,
  - preço por litro fora da faixa plausível,
  - consumo (km/L) fora do padrão histórico do veículo.

## Arquitetura

- **Next.js 15 (App Router) + React 19 + TypeScript**
- **Tailwind CSS v4 + shadcn/ui** para a interface
- **Recharts** para os gráficos
- **Supabase** para autenticação e persistência (opcional)
- **Camada de dados** (`src/lib/fuelwise`): usa Supabase quando configurado e
  cai para **localStorage (modo demo)** caso contrário — o app funciona sem
  backend para testes rápidos.

```
src/lib/fuelwise/
  types.ts       # tipos do domínio (Vehicle, FuelEntry, Alert, ...)
  analytics.ts   # cálculo de km/L, R$/km e motor de alertas (puro)
  store.ts       # persistência (Supabase + fallback localStorage)
  format.ts      # formatação pt-BR (R$, datas, km/L)
src/components/fuelwise/
  AppShell.tsx   # navegação + alternador gestor/motorista
  AlertsPanel.tsx
src/app/
  dashboard/ veiculos/ abastecimento/ abastecimentos/
supabase/schema.sql  # schema + RLS para persistência remota
```

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Sem configuração extra o app
roda em **modo demo** com dados de exemplo salvos no navegador.

## Persistência na nuvem (opcional)

1. Crie um projeto no [Supabase](https://supabase.com).
2. Rode o conteúdo de `supabase/schema.sql` no SQL Editor.
3. Crie um arquivo `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

Com isso, login e dados passam a ser persistidos no Supabase (com RLS por
usuário).

## Próximos passos (fora do MVP)

Telemetria automática, análise preditiva de manutenção, integração com cartões
de combustível e planos de assinatura.
