/**
 * Declaração ambiente mínima do Deno (Supabase Edge Runtime).
 * Necessária para o typecheck (tsc) sem instalar os tipos completos do Deno.
 * Em runtime, o global `Deno` real é fornecido pelo Supabase Edge Runtime.
 * Este arquivo não é bundlado nem enviado no deploy (não é importado).
 */
declare const Deno: {
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};
