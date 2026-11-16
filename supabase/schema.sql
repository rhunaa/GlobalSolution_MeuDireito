-- =====================================================================
--  Meu Direito – schema do banco (Supabase / PostgreSQL 15+)
--  "O direito já existe. O que falta é o caminho até ele."
--
--  Serve à plataforma web (quem atende) e ao app mobile (cidadão).
--  Como rodar: Supabase → SQL Editor → cole este arquivo → Run.
--  Depois rode seed.sql. Pode rodar de novo: o script recria tudo.
--
--  Regras de negócio críticas ficam AQUI (funções e triggers), para
--  que web e app se comportem igual:
--    • emitir_senha / chamar_proxima ......... fila da UBS
--    • registrar_atendimento ................. resultado no CRAS
--    • abrir_vaga / responder_convocacao ..... lista da creche
--    • trigger de histórico .................. toda mudança de status
-- =====================================================================

-- ---------- Limpeza (permite rodar de novo) ----------
drop view if exists vw_movimento_unidades, vw_espera_por_unidade, vw_atendimentos_por_dia,
  vw_faltas_por_unidade, vw_direitos_por_bairro, vw_direitos_mais_procurados cascade;
drop table if exists historico, lista_creche, agendamentos, senhas, direitos_cidadao,
  direitos, cidadaos, unidades cascade;
drop function if exists hoje_sp, registrar_historico, tocar_updated_at, agendamento_marca_direito,
  emitir_senha, chamar_proxima, atualizar_status_senha, registrar_atendimento,
  expirar_convocacoes, abrir_vaga, responder_convocacao cascade;

-- ---------- Utilitário: data de hoje em São Paulo ----------
create or replace function hoje_sp() returns date
language sql stable as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

-- =====================================================================
--  TABELAS
-- =====================================================================

create table unidades (
  id              uuid primary key default gen_random_uuid(),
  tipo            text not null check (tipo in ('ubs', 'cras', 'creche')),
  nome            text not null,
  endereco        text not null,
  bairro          text not null,
  horario         text not null,
  latitude        double precision not null,
  longitude       double precision not null,
  acessibilidade  jsonb not null default '{"rampa": false, "banheiro_adaptado": false, "libras": false}'
);

create table cidadaos (
  id                          uuid primary key default gen_random_uuid(),
  nome                        text not null,
  data_nascimento             date not null,
  bairro                      text not null,
  perfil                      jsonb not null default '{}',
  preferencias_acessibilidade jsonb not null default '{}'
);

create table direitos (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  descricao_simples text not null,
  quem_pode         text not null,
  documentos        text[] not null default '{}',
  tipo_unidade      text not null check (tipo_unidade in ('ubs', 'cras', 'creche')),
  fonte_oficial     text not null
);

create table direitos_cidadao (
  id          uuid primary key default gen_random_uuid(),
  cidadao_id  uuid not null references cidadaos (id) on delete cascade,
  direito_id  uuid not null references direitos (id) on delete cascade,
  status      text not null default 'provavel'
              check (status in ('provavel', 'agendado', 'em_analise', 'concedido', 'negado')),
  updated_at  timestamptz not null default now(),
  unique (cidadao_id, direito_id)
);

create table senhas (
  id                      uuid primary key default gen_random_uuid(),
  unidade_id              uuid not null references unidades (id) on delete cascade,
  cidadao_id              uuid references cidadaos (id) on delete set null, -- nulo = senha de balcão
  codigo                  text not null,                                   -- ex.: C023
  motivo                  text not null check (motivo in ('consulta', 'vacina', 'remedio')),
  status                  text not null default 'aguardando'
                          check (status in ('aguardando', 'chamada', 'em_atendimento', 'concluida', 'nao_compareceu')),
  guiche                  int,
  origem                  text not null check (origem in ('app', 'balcao')),
  prioridade              boolean not null default false,
  dia                     date not null default hoje_sp(),
  created_at              timestamptz not null default now(),
  chamada_em              timestamptz,
  atendimento_iniciado_em timestamptz,
  concluida_em            timestamptz,
  unique (unidade_id, dia, codigo)
);
create index senhas_fila_idx on senhas (unidade_id, dia, status, prioridade desc, created_at);

create table agendamentos (
  id                      uuid primary key default gen_random_uuid(),
  unidade_id              uuid not null references unidades (id) on delete cascade,
  cidadao_id              uuid not null references cidadaos (id) on delete cascade,
  direito_id              uuid not null references direitos (id),
  data_hora               timestamptz not null,
  motivo                  text not null,
  documentos_confirmados  text[] not null default '{}',
  documentos_faltando     text[] not null default '{}',
  status                  text not null default 'agendado'
                          check (status in ('agendado', 'atendido', 'falta_documento', 'encaminhado', 'nao_compareceu')),
  observacao              text,
  created_at              timestamptz not null default now()
);
create index agendamentos_dia_idx on agendamentos (unidade_id, data_hora);

create table lista_creche (
  id                       uuid primary key default gen_random_uuid(),
  unidade_id               uuid not null references unidades (id) on delete cascade,
  cidadao_id               uuid not null references cidadaos (id) on delete cascade,
  nome_crianca             text not null,
  data_nascimento_crianca  date not null,
  posicao                  int not null,
  documentos_pendentes     text[] not null default '{}',
  status                   text not null default 'aguardando'
                           check (status in ('aguardando', 'convocada', 'aceitou', 'recusou', 'expirou')),
  convocada_em             timestamptz,
  prazo_resposta           timestamptz,
  respondida_em            timestamptz,
  created_at               timestamptz not null default now()
);
create index lista_creche_fila_idx on lista_creche (unidade_id, status, posicao);

create table historico (
  id           uuid primary key default gen_random_uuid(),
  entidade     text not null check (entidade in ('senha', 'agendamento', 'direito', 'creche')),
  entidade_id  uuid not null,
  cidadao_id   uuid references cidadaos (id) on delete cascade, -- facilita a linha do tempo no app
  status       text not null,
  comentario   text,
  created_at   timestamptz not null default now()
);
create index historico_entidade_idx on historico (entidade, entidade_id, created_at);
create index historico_cidadao_idx on historico (cidadao_id, created_at);

-- =====================================================================
--  HISTÓRICO AUTOMÁTICO
--  Toda inserção e toda mudança de status grava uma linha em historico.
--  Assim web e app não precisam lembrar de fazer isso.
-- =====================================================================

create or replace function registrar_historico() returns trigger
language plpgsql as $$
declare
  v_entidade text := tg_argv[0];
  v_comentario text;
begin
  if tg_op = 'UPDATE' and new.status is not distinct from old.status then
    return new;
  end if;

  -- Um bloco por entidade: cada tabela só tem os próprios campos (ex.: codigo só existe em senhas)
  if v_entidade = 'senha' then
    v_comentario := case new.status
      when 'aguardando'     then 'Senha ' || new.codigo || ' emitida' ||
                                 case when new.origem = 'app' then ' pelo app' else ' no balcão' end
      when 'chamada'        then 'Senha ' || new.codigo || ' chamada no guichê ' || coalesce(new.guiche::text, '-')
      when 'em_atendimento' then 'Atendimento iniciado'
      when 'concluida'      then 'Atendimento concluído'
      when 'nao_compareceu' then 'Pessoa não compareceu ao ser chamada'
    end;
  elsif v_entidade = 'agendamento' then
    v_comentario := case new.status
      when 'agendado'        then 'Atendimento agendado'
      when 'atendido'        then 'Atendimento realizado'
      when 'falta_documento' then 'Faltou documento: ' || array_to_string(new.documentos_faltando, ', ')
      when 'encaminhado'     then 'Encaminhado para outro serviço'
      when 'nao_compareceu'  then 'Não compareceu ao agendamento'
    end;
    -- Observação do CRAS complementa o comentário
    if new.observacao is not null and new.observacao <> '' then
      v_comentario := v_comentario || '. ' || new.observacao;
    end if;
  elsif v_entidade = 'creche' then
    v_comentario := case new.status
      when 'aguardando' then 'Entrou na lista de espera'
      when 'convocada'  then 'Vaga aberta: família convocada'
      when 'aceitou'    then 'Família aceitou a vaga'
      when 'recusou'    then 'Família recusou a vaga'
      when 'expirou'    then 'Prazo de resposta expirou'
    end;
  else
    v_comentario := case new.status
      when 'provavel'   then 'Direito provável identificado'
      when 'agendado'   then 'Atendimento agendado para este direito'
      when 'em_analise' then 'Pedido em análise'
      when 'concedido'  then 'Direito concedido'
      when 'negado'     then 'Pedido negado'
    end;
  end if;

  insert into historico (entidade, entidade_id, cidadao_id, status, comentario)
  values (v_entidade, new.id, new.cidadao_id, new.status, v_comentario);

  return new;
end;
$$;

create trigger senhas_historico after insert or update of status on senhas
  for each row execute function registrar_historico('senha');
create trigger agendamentos_historico after insert or update of status on agendamentos
  for each row execute function registrar_historico('agendamento');
create trigger lista_creche_historico after insert or update of status on lista_creche
  for each row execute function registrar_historico('creche');
create trigger direitos_cidadao_historico after insert or update of status on direitos_cidadao
  for each row execute function registrar_historico('direito');

-- Mantém updated_at de direitos_cidadao
create or replace function tocar_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
create trigger direitos_cidadao_updated before update on direitos_cidadao
  for each row execute function tocar_updated_at();

-- Agendamento novo (feito no app) marca o direito do cidadão como "agendado"
create or replace function agendamento_marca_direito() returns trigger
language plpgsql as $$
begin
  insert into direitos_cidadao (cidadao_id, direito_id, status)
  values (new.cidadao_id, new.direito_id, 'agendado')
  on conflict (cidadao_id, direito_id)
  do update set status = 'agendado'
  where direitos_cidadao.status in ('provavel', 'negado');
  return new;
end;
$$;
create trigger agendamentos_marca_direito after insert on agendamentos
  for each row execute function agendamento_marca_direito();

-- =====================================================================
--  FILA DA UBS
-- =====================================================================

-- Emite uma senha com código sequencial do dia, por unidade e por motivo.
-- Prefixo: C = consulta, V = vacina, R = remédio. Ex.: C023.
create or replace function emitir_senha(
  p_unidade_id uuid,
  p_motivo     text,
  p_prioridade boolean default false,
  p_origem     text default 'balcao',
  p_cidadao_id uuid default null
) returns senhas
language plpgsql as $$
declare
  v_prefixo text := case p_motivo when 'consulta' then 'C' when 'vacina' then 'V' else 'R' end;
  v_numero  int;
  v_senha   senhas;
begin
  -- Trava por unidade+dia para dois pedidos simultâneos não gerarem o mesmo código
  perform pg_advisory_xact_lock(hashtext(p_unidade_id::text || hoje_sp()::text));

  select coalesce(max(substring(codigo from 2)::int), 0) + 1 into v_numero
  from senhas
  where unidade_id = p_unidade_id and dia = hoje_sp() and left(codigo, 1) = v_prefixo;

  insert into senhas (unidade_id, cidadao_id, codigo, motivo, origem, prioridade)
  values (p_unidade_id, p_cidadao_id, v_prefixo || lpad(v_numero::text, 3, '0'), p_motivo, p_origem, p_prioridade)
  returning * into v_senha;

  return v_senha;
end;
$$;

-- Chama a próxima senha: primeiro as prioritárias, depois por ordem de chegada.
-- "for update skip locked" impede que dois guichês chamem a mesma pessoa.
create or replace function chamar_proxima(p_unidade_id uuid, p_guiche int)
returns senhas
language plpgsql as $$
declare
  v_senha senhas;
begin
  select * into v_senha
  from senhas
  where unidade_id = p_unidade_id and dia = hoje_sp() and status = 'aguardando'
  order by prioridade desc, created_at
  limit 1
  for update skip locked;

  if not found then
    return null;
  end if;

  update senhas
  set status = 'chamada', guiche = p_guiche, chamada_em = now()
  where id = v_senha.id
  returning * into v_senha;

  return v_senha;
end;
$$;

-- Muda o status de uma senha registrando os horários de cada etapa.
create or replace function atualizar_status_senha(p_senha_id uuid, p_status text)
returns senhas
language plpgsql as $$
declare
  v_senha senhas;
begin
  update senhas
  set status = p_status,
      atendimento_iniciado_em = case when p_status = 'em_atendimento' then now() else atendimento_iniciado_em end,
      concluida_em = case when p_status in ('concluida', 'nao_compareceu') then now() else concluida_em end
  where id = p_senha_id
  returning * into v_senha;
  return v_senha;
end;
$$;

-- =====================================================================
--  CRAS
-- =====================================================================

-- Registra o resultado de um atendimento e atualiza o direito do cidadão.
-- p_status_direito é opcional; se vier nulo, usa a regra padrão:
--   atendido → em_analise | encaminhado → em_analise
--   falta_documento → agendado (precisa voltar) | nao_compareceu → provavel
create or replace function registrar_atendimento(
  p_agendamento_id      uuid,
  p_status              text,
  p_documentos_faltando text[] default '{}',
  p_observacao          text default null,
  p_status_direito      text default null
) returns agendamentos
language plpgsql as $$
declare
  v_ag agendamentos;
  v_status_direito text;
begin
  update agendamentos
  set status = p_status,
      documentos_faltando = coalesce(p_documentos_faltando, '{}'),
      observacao = p_observacao
  where id = p_agendamento_id
  returning * into v_ag;

  if not found then
    raise exception 'Agendamento % não encontrado', p_agendamento_id;
  end if;

  v_status_direito := coalesce(p_status_direito, case p_status
    when 'atendido'        then 'em_analise'
    when 'encaminhado'     then 'em_analise'
    when 'falta_documento' then 'agendado'
    when 'nao_compareceu'  then 'provavel'
    else 'agendado'
  end);

  insert into direitos_cidadao (cidadao_id, direito_id, status)
  values (v_ag.cidadao_id, v_ag.direito_id, v_status_direito)
  on conflict (cidadao_id, direito_id) do update set status = excluded.status;

  return v_ag;
end;
$$;

-- =====================================================================
--  CRECHE
-- =====================================================================

-- Prazo para a família responder a uma convocação.
-- TODO: conferir prazo real usado pela Secretaria Municipal de Educação.
create or replace function expirar_convocacoes(p_unidade_id uuid default null)
returns int
language plpgsql as $$
declare
  v_qtd int;
begin
  update lista_creche
  set status = 'expirou'
  where status = 'convocada'
    and prazo_resposta < now()
    and (p_unidade_id is null or unidade_id = p_unidade_id);
  get diagnostics v_qtd = row_count;
  return v_qtd;
end;
$$;

-- Abre uma vaga: convoca a próxima família da lista (menor posição aguardando).
create or replace function abrir_vaga(p_unidade_id uuid, p_prazo_horas int default 48)
returns lista_creche
language plpgsql as $$
declare
  v_item lista_creche;
begin
  perform expirar_convocacoes(p_unidade_id);

  select * into v_item
  from lista_creche
  where unidade_id = p_unidade_id and status = 'aguardando'
  order by posicao
  limit 1
  for update skip locked;

  if not found then
    return null;
  end if;

  update lista_creche
  set status = 'convocada',
      convocada_em = now(),
      prazo_resposta = now() + make_interval(hours => p_prazo_horas)
  where id = v_item.id
  returning * into v_item;

  return v_item;
end;
$$;

-- Resposta da família (feita pelo app).
create or replace function responder_convocacao(p_item_id uuid, p_aceita boolean)
returns lista_creche
language plpgsql as $$
declare
  v_item lista_creche;
begin
  update lista_creche
  set status = case when p_aceita then 'aceitou' else 'recusou' end,
      respondida_em = now()
  where id = p_item_id
    and status = 'convocada'
    and (prazo_resposta is null or prazo_resposta >= now())
  returning * into v_item;

  if not found then
    raise exception 'Convocação não está mais aberta para resposta';
  end if;

  return v_item;
end;
$$;

-- =====================================================================
--  INDICADORES (views agregadas – sem dados pessoais)
-- =====================================================================

-- Movimento atual: pessoas aguardando e tempo estimado (página pública)
create view vw_movimento_unidades as
with espera_hoje as (
  select unidade_id,
         avg(extract(epoch from (chamada_em - created_at)) / 60) as media_min
  from senhas
  where dia = hoje_sp() and chamada_em is not null
  group by unidade_id
)
select u.id as unidade_id, u.nome, u.tipo, u.bairro,
       case u.tipo
         when 'ubs'    then (select count(*) from senhas s where s.unidade_id = u.id and s.dia = hoje_sp() and s.status = 'aguardando')
         when 'cras'   then (select count(*) from agendamentos a where a.unidade_id = u.id and a.status = 'agendado'
                               and (a.data_hora at time zone 'America/Sao_Paulo')::date = hoje_sp())
         when 'creche' then (select count(*) from lista_creche l where l.unidade_id = u.id and l.status = 'aguardando')
       end::int as aguardando,
       case when u.tipo = 'ubs' then
         round(coalesce(e.media_min, 15))::int  -- sem histórico no dia, estima 15 min
       end as tempo_estimado_min
from unidades u
left join espera_hoje e on e.unidade_id = u.id;

-- Tempo médio de espera (emissão → chamada) por UBS, hoje
create view vw_espera_por_unidade as
select u.id as unidade_id, u.nome,
       coalesce(round(avg(extract(epoch from (s.chamada_em - s.created_at)) / 60)), 0)::int as tempo_medio_espera_min,
       count(*) filter (where s.status = 'concluida')::int as atendidos
from unidades u
left join senhas s on s.unidade_id = u.id and s.dia = hoje_sp() and s.chamada_em is not null
where u.tipo = 'ubs'
group by u.id, u.nome;

-- Atendimentos concluídos por dia (últimos 7 dias)
create view vw_atendimentos_por_dia as
with dias as (
  select generate_series(hoje_sp() - 6, hoje_sp(), interval '1 day')::date as dia
)
select d.dia,
       (select count(*) from senhas s where s.dia = d.dia and s.status = 'concluida')::int as ubs,
       (select count(*) from agendamentos a
         where (a.data_hora at time zone 'America/Sao_Paulo')::date = d.dia
           and a.status in ('atendido', 'encaminhado', 'falta_documento'))::int as cras
from dias d
order by d.dia;

-- Faltas (não compareceu) por unidade, hoje
create view vw_faltas_por_unidade as
select u.id as unidade_id, u.nome, u.tipo,
       case u.tipo
         when 'ubs'  then (select count(*) from senhas s where s.unidade_id = u.id and s.dia = hoje_sp() and s.status = 'nao_compareceu')
         when 'cras' then (select count(*) from agendamentos a where a.unidade_id = u.id and a.status = 'nao_compareceu'
                             and (a.data_hora at time zone 'America/Sao_Paulo')::date = hoje_sp())
       end::int as faltas,
       case u.tipo
         when 'ubs'  then (select count(*) from senhas s where s.unidade_id = u.id and s.dia = hoje_sp())
         when 'cras' then (select count(*) from agendamentos a where a.unidade_id = u.id
                             and (a.data_hora at time zone 'America/Sao_Paulo')::date = hoje_sp())
       end::int as total
from unidades u
where u.tipo in ('ubs', 'cras');

-- Direitos mais buscados por bairro (do cidadão)
create view vw_direitos_por_bairro as
select c.bairro, d.nome as direito, count(*)::int as total
from direitos_cidadao dc
join cidadaos c on c.id = dc.cidadao_id
join direitos d on d.id = dc.direito_id
group by c.bairro, d.nome
order by c.bairro, total desc;

-- Direitos mais procurados (geral) – página pública
create view vw_direitos_mais_procurados as
select d.id as direito_id, d.nome, count(dc.id)::int as total
from direitos d
left join direitos_cidadao dc on dc.direito_id = d.id
group by d.id, d.nome
order by total desc;

-- =====================================================================
--  SEGURANÇA (RLS) – MODO DEMONSTRAÇÃO
--
--  ATENÇÃO: as políticas abaixo liberam leitura e escrita para a chave
--  anon. Isso existe só para a demonstração acadêmica funcionar sem
--  login. Em produção haveria autenticação real (Supabase Auth, gov.br),
--  e cada perfil teria políticas próprias, por exemplo:
--    • cidadão só lê/escreve as próprias senhas, agendamentos e dados;
--    • recepcionista só altera senhas da própria unidade;
--    • página pública só lê as views agregadas, nunca as tabelas.
-- =====================================================================

do $$
declare
  t text;
begin
  foreach t in array array['unidades', 'cidadaos', 'direitos', 'direitos_cidadao',
                           'senhas', 'agendamentos', 'lista_creche', 'historico']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists demo_acesso_total on %I', t);
    execute format(
      'create policy demo_acesso_total on %I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end;
$$;

-- =====================================================================
--  REALTIME
--  Publica as mudanças destas tabelas para web e app.
-- =====================================================================

alter table senhas           replica identity full;
alter table agendamentos     replica identity full;
alter table lista_creche     replica identity full;
alter table direitos_cidadao replica identity full;
alter table historico        replica identity full;

do $$
declare
  t text;
begin
  foreach t in array array['senhas', 'agendamentos', 'lista_creche', 'direitos_cidadao', 'historico']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table %I', t);
    end if;
  end loop;
end;
$$;
