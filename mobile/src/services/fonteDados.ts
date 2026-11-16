import type { Backend } from './backend'
import { criarBackendMock } from './backendMock'
import { criarBackendSupabase } from './backendSupabase'
import { supabase, temSupabase } from './supabaseClient'

/**
 * Escolhe a fonte de dados: Supabase quando EXPO_PUBLIC_SUPABASE_URL e
 * EXPO_PUBLIC_SUPABASE_ANON_KEY existem; senão, dados mock locais.
 */
export const backend: Backend = temSupabase && supabase ? criarBackendSupabase(supabase) : criarBackendMock()

export const modoDados = backend.modo
