// Exportação DXF (AutoCAD R12 ASCII) — pronto para máquinas de corte a laser
// e máquinas automáticas de dobra de lâmina. Camadas separadas: CORTE e VINCO.
// A compensação de kerf é aplicada como atributo de espessura para o setup da lâmina.

import { Dieline, Line } from "./fefco";

function entLine(l: Line, layer: string): string {
  // Grupo de códigos DXF para uma LINE
  return [
    "0",
    "LINE",
    "8",
    layer,
    "10",
    l.x1.toFixed(3),
    "20",
    l.y1.toFixed(3),
    "30",
    "0.0",
    "11",
    l.x2.toFixed(3),
    "21",
    l.y2.toFixed(3),
    "31",
    "0.0",
  ].join("\n");
}

export interface DxfOptions {
  kerf: number; // mm — registrado no cabeçalho como referência de setup
  fefco: string;
}

export function gerarDXF(dieline: Dieline, opts: DxfOptions): string {
  const header = [
    "0",
    "SECTION",
    "2",
    "HEADER",
    "9",
    "$INSUNITS",
    "70",
    "4", // 4 = milímetros
    "0",
    "ENDSEC",
  ].join("\n");

  const tables = [
    "0",
    "SECTION",
    "2",
    "TABLES",
    "0",
    "TABLE",
    "2",
    "LAYER",
    "70",
    "2",
    // camada CORTE (vermelho = 1)
    "0",
    "LAYER",
    "2",
    "CORTE",
    "70",
    "0",
    "62",
    "1",
    "6",
    "CONTINUOUS",
    // camada VINCO (azul = 5)
    "0",
    "LAYER",
    "2",
    "VINCO",
    "70",
    "0",
    "62",
    "5",
    "6",
    "DASHED",
    "0",
    "ENDTAB",
    "0",
    "ENDSEC",
  ].join("\n");

  const ents: string[] = ["0", "SECTION", "2", "ENTITIES"];
  dieline.cut.forEach((l) => ents.push(entLine(l, "CORTE")));
  dieline.crease.forEach((l) => ents.push(entLine(l, "VINCO")));
  ents.push("0", "ENDSEC");

  // Comentário com referência de kerf/FEFCO (linha 999 = comentário no DXF)
  const meta = [
    "999",
    `FEFCO ${opts.fefco} | kerf ${opts.kerf}mm | gerado por CartoDie`,
  ].join("\n");

  const eof = ["0", "EOF"].join("\n");

  return [meta, header, tables, ents.join("\n"), eof].join("\n");
}

export function baixarTexto(nome: string, conteudo: string, mime = "application/dxf") {
  const blob = new Blob([conteudo], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
