"use client";
import { useEffect, useRef } from "react";
import { supabase } from "./supabase";

/**
 * Assina mudanças realtime em uma ou mais tabelas e dispara o callback
 * (com leve debounce) para recarregar os dados do painel.
 */
export function useRealtime(tables: string[], onChange: () => void) {
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const fire = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => cb.current(), 250);
    };

    const channel = supabase.channel("rt-" + tables.join("-"));
    tables.forEach((t) =>
      channel.on("postgres_changes", { event: "*", schema: "public", table: t }, fire),
    );
    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables.join(",")]);
}
