# CartoDie — Plataforma Web-to-Die de Cartonagem

Sistema de orçamento instantâneo e geração de projetos para **cartonagem e
papelão ondulado**, seguindo padrões industriais (FEFCO, compensação de vinco,
faca plana/rotativa, kerf, DXF).

## Recursos

1. **Entrada e Reconhecimento (IA Vision)**
   - Upload de **foto** → IA sugere a estrutura FEFCO (0201, 0427, 0215, 0300…).
   - Upload de **vetores** DXF/AI/PDF para projetos personalizados.
   - Seleção manual na biblioteca FEFCO.
2. **Medidas e material**
   - Dimensões internas **C × L × H em mm** (obrigatórias, nesta ordem).
   - Onda **B, C, E, BC (dupla)** ou **Kraft**, com faixa de espessura.
   - Aviso e campo para **espessura real medida com paquímetro**.
3. **Inteligência de cálculo**
   - **Compensação de vinco** automática (acréscimos lineares pela espessura).
   - **Metragem de lâmina** de corte e vinco (em metros).
   - **Margens de segurança**: 10mm de sangria, 5mm dos vincos.
4. **Especificação da faca**
   - Faca **plana** (madeira 18mm, lâmina 23,8mm) ou **rotativa** (cilindro).
   - Lâmina de aço alto carbono 0,71mm + emborrachamento técnico no custo.
   - **Compensação de kerf** do laser (0,1–0,2mm).
5. **Visualização e saída**
   - **Preview 3D** da caixa dobrada (arraste para girar).
   - Desenho da **faca (dieline)** em SVG: corte (vermelho) e vinco (azul).
   - **Proposta em PDF** instantânea (impressão do navegador).
   - **Exportação DXF** com camadas CORTE/VINCO em mm.

## Estrutura do código

| Caminho | Função |
|---------|--------|
| `src/lib/cartonagem/fefco.ts` | Catálogo FEFCO + geração de geometria (dieline) |
| `src/lib/cartonagem/flutes.ts` | Ondas/materiais e espessuras |
| `src/lib/cartonagem/engine.ts` | Compensações, metragem, faca, kerf e custos |
| `src/lib/cartonagem/dxf.ts` | Exportador DXF industrial |
| `src/components/cartonagem/DielinePreview.tsx` | Preview 2D da faca (SVG) |
| `src/components/cartonagem/Box3D.tsx` | Preview 3D da caixa (CSS 3D) |
| `src/app/orcamento/page.tsx` | Ferramenta de orçamento |
| `src/app/api/vision/route.ts` | IA Vision (OpenAI + fallback) |

## Desenvolvimento

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
```

## Deploy

Hospedagem na **Cloudflare Pages** — ver [`DEPLOY-CLOUDFLARE.md`](./DEPLOY-CLOUDFLARE.md).

> Os preços em `engine.ts` (`PRECOS`) são valores de referência e devem ser
> ajustados à sua realidade de custos.
