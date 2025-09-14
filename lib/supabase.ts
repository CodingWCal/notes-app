import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let client: SupabaseClient | undefined;
export function getClient() {
  if (!client) client = createClient(url, anon);
  return client;
}

export type Note = {
  id: string;
  title: string | null;
  content: string;
  color: 'default' | 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await getClient()
    .from('notes')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Note[];
}

type CreateNoteInput = {
  title: string | null;
  content: string;
  color?: Note['color'];
  pinned?: boolean;
};

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const payload = {
    title: input.title ?? null,
    content: input.content ?? '',
    color: input.color ?? 'default',
    pinned: input.pinned ?? false,
  };
  const { data, error } = await getClient()
    .from('notes')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Note;
}

export async function updateNote(id: string, fields: Partial<Note>): Promise<Note> {
  // Whitelist only valid DB columns
  const payload: Partial<Note> = {};
  if (typeof fields.title !== "undefined")  payload.title  = fields.title ?? null;
  if (typeof fields.content !== "undefined") payload.content = fields.content ?? "";
  if (typeof fields.color !== "undefined")   payload.color   = fields.color as Note["color"];
  if (typeof fields.pinned !== "undefined")  payload.pinned  = !!fields.pinned;

  const { data, error } = await getClient()
    .from("notes")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Supabase update error", {
      id,
      payload, // log the cleaned payload
      message: error.message,
      details: (error as any).details,
    });
    throw error;
  }
  return data as Note;
}


export async function deleteNote(id: string): Promise<void> {
  const { error } = await getClient()
    .from('notes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
