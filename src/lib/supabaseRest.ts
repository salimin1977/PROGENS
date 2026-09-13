const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export async function supabaseSelect<T>(table: string, query = 'select=*'): Promise<T[]> {
  if (!isSupabaseConfigured) return [];

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: {
      apikey: SUPABASE_KEY!,
      Authorization: `Bearer ${SUPABASE_KEY!}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase ${table} request failed: ${response.status}`);
  }

  return (await response.json()) as T[];
}
