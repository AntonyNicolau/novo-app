// IA Vision — sugere a estrutura FEFCO a partir de uma foto da caixa.
// Usa a API da OpenAI quando OPENAI_API_KEY está configurada; caso contrário
// devolve uma sugestão heurística para o app seguir funcionando sem chave.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const FEFCO_VALIDOS = ["0201", "0203", "0215", "0300", "0427", "0427B"];

interface VisionResposta {
  fefco: string;
  confianca: number; // 0..1
  motivo: string;
  fonte: "ia" | "heuristica";
}

export async function POST(req: NextRequest) {
  let imageBase64 = "";
  try {
    const body = await req.json();
    imageBase64 = body.image ?? "";
  } catch {
    // sem corpo válido
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || !imageBase64) {
    const heuristica: VisionResposta = {
      fefco: "0201",
      confianca: 0.4,
      motivo:
        "Sugestão padrão (RSC 0201), a estrutura mais comum. Configure OPENAI_API_KEY para reconhecimento por IA.",
      fonte: "heuristica",
    };
    return NextResponse.json(heuristica);
  }

  try {
    const prompt =
      "Você é um especialista em cartonagem. Analise a foto de uma caixa de papelão e identifique a estrutura FEFCO mais provável entre: " +
      FEFCO_VALIDOS.join(", ") +
      ". Responda APENAS em JSON: {\"fefco\":\"0201\",\"confianca\":0.0-1.0,\"motivo\":\"...\"}.";

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });

    const data = await r.json();
    const txt = data?.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(txt);
    const fefco = FEFCO_VALIDOS.includes(parsed.fefco) ? parsed.fefco : "0201";
    const resp: VisionResposta = {
      fefco,
      confianca: Math.max(0, Math.min(1, Number(parsed.confianca) || 0.5)),
      motivo: String(parsed.motivo ?? "Estrutura identificada por IA."),
      fonte: "ia",
    };
    return NextResponse.json(resp);
  } catch {
    return NextResponse.json({
      fefco: "0201",
      confianca: 0.3,
      motivo: "Falha ao consultar a IA; usando sugestão padrão 0201.",
      fonte: "heuristica",
    } satisfies VisionResposta);
  }
}
