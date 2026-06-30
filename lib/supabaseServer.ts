import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BirthInput, CharacterBond, CharacterProfile, StoredBond, StoredCharacter, BaziChart } from './types';

type CharacterRow = {
  id: string;
  name: string;
  birth_input: BirthInput;
  bazi_chart: BaziChart;
  profile: CharacterProfile;
  created_at: string;
  updated_at: string;
};

type BondRow = {
  id: string;
  character_a_id: string;
  character_b_id: string;
  bond: CharacterBond;
  created_at: string;
  updated_at: string;
};

let supabase: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('缺少 SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY 环境变量');
  }
  supabase ??= createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return supabase;
}

export async function listCharacters() {
  const { data, error } = await getSupabaseAdmin()
    .from('characters')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return ((data || []) as CharacterRow[]).map(mapCharacterRow);
}

export async function createCharacter(input: {
  name: string;
  birthInput: BirthInput;
  baziChart: BaziChart;
  profile: CharacterProfile;
}) {
  const { data, error } = await getSupabaseAdmin()
    .from('characters')
    .insert({
      name: input.name,
      birth_input: input.birthInput,
      bazi_chart: input.baziChart,
      profile: input.profile,
    })
    .select('*')
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return mapCharacterRow(data as CharacterRow);
}

export async function updateCharacter(
  id: string,
  input: Partial<Pick<StoredCharacter, 'name' | 'birthInput' | 'baziChart' | 'profile'>>
) {
  const payload: Partial<CharacterRow> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) payload.name = input.name;
  if (input.birthInput !== undefined) payload.birth_input = input.birthInput;
  if (input.baziChart !== undefined) payload.bazi_chart = input.baziChart;
  if (input.profile !== undefined) payload.profile = input.profile;

  const { data, error } = await getSupabaseAdmin()
    .from('characters')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return mapCharacterRow(data as CharacterRow);
}

export async function deleteCharacter(id: string) {
  const { error } = await getSupabaseAdmin().from('characters').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function saveBond(input: {
  characterAId: string;
  characterBId: string;
  bond: CharacterBond;
}) {
  const { data, error } = await getSupabaseAdmin()
    .from('bonds')
    .insert({
      character_a_id: input.characterAId,
      character_b_id: input.characterBId,
      bond: input.bond,
    })
    .select('*')
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return mapBondRow(data as BondRow);
}

export async function listBonds() {
  const { data, error } = await getSupabaseAdmin()
    .from('bonds')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  return ((data || []) as BondRow[]).map(mapBondRow);
}

function mapCharacterRow(row: CharacterRow): StoredCharacter {
  return {
    id: row.id,
    name: row.name,
    birthInput: row.birth_input,
    baziChart: row.bazi_chart,
    profile: row.profile,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBondRow(row: BondRow): StoredBond {
  return {
    id: row.id,
    characterAId: row.character_a_id,
    characterBId: row.character_b_id,
    bond: row.bond,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
