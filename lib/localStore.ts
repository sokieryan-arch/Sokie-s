import { randomUUID } from 'crypto';
import { mkdir, readFile, rename, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { BirthInput, BaziChart, CharacterBond, CharacterProfile, StoredBond, StoredCharacter } from './types';

type StoreData = {
  characters: StoredCharacter[];
  bonds: StoredBond[];
};

const STORE_FILE = 'bazi-store.json';

let writeQueue: Promise<unknown> = Promise.resolve();

function getDataDir() {
  if (process.env.BAZI_DATA_DIR) {
    return process.env.BAZI_DATA_DIR;
  }
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'bazi-novel-engine');
  }
  return path.join(process.cwd(), '.data');
}

function getStorePath() {
  return path.join(getDataDir(), STORE_FILE);
}

function createEmptyStore(): StoreData {
  return {
    characters: [],
    bonds: [],
  };
}

async function readStore(): Promise<StoreData> {
  try {
    const raw = await readFile(getStorePath(), 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      characters: Array.isArray(parsed.characters) ? parsed.characters : [],
      bonds: Array.isArray(parsed.bonds) ? parsed.bonds : [],
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return createEmptyStore();
    }
    throw error;
  }
}

async function writeStore(data: StoreData) {
  const dataDir = getDataDir();
  await mkdir(dataDir, { recursive: true });
  const target = getStorePath();
  const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await rename(tmp, target);
}

async function mutateStore<T>(mutator: (data: StoreData) => T | Promise<T>) {
  const task = writeQueue.then(async () => {
    const data = await readStore();
    const result = await mutator(data);
    await writeStore(data);
    return result;
  });
  writeQueue = task.catch(() => undefined);
  return task;
}

function sortByUpdatedAt<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export async function listCharacters() {
  const data = await readStore();
  return sortByUpdatedAt(data.characters);
}

export async function createCharacter(input: {
  name: string;
  birthInput: BirthInput;
  baziChart: BaziChart;
  profile: CharacterProfile;
}) {
  return mutateStore((data) => {
    const now = new Date().toISOString();
    const character: StoredCharacter = {
      id: randomUUID(),
      name: input.name,
      birthInput: input.birthInput,
      baziChart: input.baziChart,
      profile: input.profile,
      createdAt: now,
      updatedAt: now,
    };
    data.characters.unshift(character);
    return character;
  });
}

export async function updateCharacter(
  id: string,
  input: Partial<Pick<StoredCharacter, 'name' | 'birthInput' | 'baziChart' | 'profile'>>
) {
  return mutateStore((data) => {
    const index = data.characters.findIndex((character) => character.id === id);
    if (index === -1) {
      throw new Error('Character not found');
    }
    const current = data.characters[index];
    const next: StoredCharacter = {
      ...current,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    data.characters[index] = next;
    return next;
  });
}

export async function deleteCharacter(id: string) {
  await mutateStore((data) => {
    data.characters = data.characters.filter((character) => character.id !== id);
    data.bonds = data.bonds.filter((bond) => bond.characterAId !== id && bond.characterBId !== id);
  });
}

export async function saveBond(input: {
  characterAId: string;
  characterBId: string;
  bond: CharacterBond;
}) {
  return mutateStore((data) => {
    const now = new Date().toISOString();
    const storedBond: StoredBond = {
      id: randomUUID(),
      characterAId: input.characterAId,
      characterBId: input.characterBId,
      bond: input.bond,
      createdAt: now,
      updatedAt: now,
    };
    data.bonds.unshift(storedBond);
    return storedBond;
  });
}

export async function listBonds() {
  const data = await readStore();
  return sortByUpdatedAt(data.bonds);
}

