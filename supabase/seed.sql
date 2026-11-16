-- =====================================================================
--  Meu Direito – dados de demonstração (São Paulo)
--  Rode DEPOIS do schema.sql. Pode rodar de novo: limpa e recria.
--
--  • Nomes de pessoas são fictícios. Endereços são ilustrativos.
--  • Datas são relativas a "agora", então a demo sempre tem dados de hoje.
--  • As regras dos direitos estão simplificadas para linguagem cidadã.
-- =====================================================================

truncate historico, lista_creche, agendamentos, senhas, direitos_cidadao,
  direitos, cidadaos, unidades restart identity cascade;

-- ---------- Unidades (IDs fixos para facilitar links como /telao/:id) ----------
insert into unidades (id, tipo, nome, endereco, bairro, horario, latitude, longitude, acessibilidade) values
  ('00000000-0000-4000-a000-000000000101', 'ubs', 'UBS Capão Redondo', 'Rua das Acácias, 120', 'Capão Redondo',
   'Seg a sex, 7h às 19h', -23.6672, -46.7795, '{"rampa": true, "banheiro_adaptado": true, "libras": true}'),
  ('00000000-0000-4000-a000-000000000102', 'ubs', 'UBS Vila Brasilândia', 'Avenida Esperança, 850', 'Brasilândia',
   'Seg a sex, 7h às 19h; sáb, 8h às 12h', -23.4612, -46.6877, '{"rampa": true, "banheiro_adaptado": false, "libras": false}'),
  ('00000000-0000-4000-a000-000000000201', 'cras', 'CRAS Capão Redondo', 'Rua dos Ipês, 45', 'Capão Redondo',
   'Seg a sex, 8h às 17h', -23.6640, -46.7760, '{"rampa": true, "banheiro_adaptado": true, "libras": false}'),
  ('00000000-0000-4000-a000-000000000202', 'cras', 'CRAS Itaquera', 'Rua Paz e Bem, 300', 'Itaquera',
   'Seg a sex, 8h às 17h', -23.5410, -46.4570, '{"rampa": true, "banheiro_adaptado": true, "libras": true}'),
  ('00000000-0000-4000-a000-000000000301', 'creche', 'CEI Jardim São Luís', 'Rua Girassol, 77', 'Jardim São Luís',
   'Seg a sex, 7h às 17h', -23.6550, -46.7470, '{"rampa": true, "banheiro_adaptado": true, "libras": false}'),
  ('00000000-0000-4000-a000-000000000302', 'creche', 'CEI Brasilândia', 'Rua Arco-Íris, 510', 'Brasilândia',
   'Seg a sex, 7h às 17h', -23.4650, -46.6900, '{"rampa": false, "banheiro_adaptado": false, "libras": false}'),
  ('00000000-0000-4000-a000-000000000303', 'creche', 'CEI Itaquera', 'Avenida Primavera, 1500', 'Itaquera',
   'Seg a sex, 7h às 17h', -23.5380, -46.4600, '{"rampa": true, "banheiro_adaptado": true, "libras": true}');

-- ---------- Direitos ----------
insert into direitos (id, nome, descricao_simples, quem_pode, documentos, tipo_unidade, fonte_oficial) values
  -- TODO: conferir regra atual em fonte oficial
  ('00000000-0000-4000-a000-000000000401', 'Cadastro Único',
   'É o cadastro do governo que mostra quem precisa de apoio. Estar nele abre a porta para vários benefícios, como Bolsa Família e Tarifa Social.',
   'Famílias com renda de até meio salário mínimo por pessoa.',
   array['CPF ou título de eleitor de quem responde pela família', 'Documento de todas as pessoas da casa (certidão de nascimento ou CPF)', 'Comprovante de endereço', 'Carteira de trabalho, se tiver'],
   'cras', 'https://www.gov.br/mds/pt-br/acoes-e-programas/cadastro-unico'),
  -- TODO: conferir regra atual em fonte oficial
  ('00000000-0000-4000-a000-000000000402', 'Tarifa Social de Energia Elétrica',
   'Desconto na conta de luz para famílias de baixa renda. O desconto aparece direto na conta.',
   'Famílias no Cadastro Único com renda de até meio salário mínimo por pessoa, ou com alguém que recebe o BPC.',
   array['Número do NIS (do Cadastro Único)', 'CPF de quem está na conta de luz', 'Conta de luz recente'],
   'cras', 'https://www.gov.br/aneel/pt-br/assuntos/tarifas/tarifa-social'),
  -- TODO: conferir regra atual em fonte oficial
  ('00000000-0000-4000-a000-000000000403', 'BPC – Benefício de Prestação Continuada',
   'Um salário mínimo por mês para pessoa idosa ou com deficiência que não tem como se sustentar. Não precisa ter contribuído com o INSS.',
   'Pessoas com 65 anos ou mais, ou pessoas com deficiência, com renda de até um quarto de salário mínimo por pessoa da família e inscritas no Cadastro Único.',
   array['CPF de todas as pessoas da casa', 'Documento com foto', 'Cadastro Único atualizado', 'Laudo médico (para pessoa com deficiência)'],
   'cras', 'https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/beneficio-assistencial-ao-idoso-e-a-pessoa-com-deficiencia-bpc'),
  -- TODO: conferir regra atual em fonte oficial
  ('00000000-0000-4000-a000-000000000404', 'Remédios gratuitos pelo SUS',
   'Muitos remédios de uso contínuo, como os de pressão e diabetes, são de graça na farmácia da UBS ou no Farmácia Popular.',
   'Qualquer pessoa com receita médica dentro da validade.',
   array['Receita médica dentro da validade', 'Documento com foto', 'Cartão SUS'],
   'ubs', 'https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular'),
  -- TODO: conferir regra atual em fonte oficial
  ('00000000-0000-4000-a000-000000000405', 'Vaga em creche pública',
   'Toda criança pequena tem direito a creche gratuita perto de casa. A inscrição entra numa lista por ordem e critérios da prefeitura.',
   'Crianças de 0 a 3 anos que moram na cidade.',
   array['Certidão de nascimento da criança', 'CPF de quem é responsável', 'Comprovante de endereço', 'Carteira de vacinação da criança'],
   'creche', 'https://educacao.sme.prefeitura.sp.gov.br/');

-- ---------- Cidadãos (fictícios) ----------
insert into cidadaos (id, nome, data_nascimento, bairro, perfil, preferencias_acessibilidade) values
  ('00000000-0000-4000-a000-000000000501', 'Maria Aparecida dos Santos', '1958-03-12', 'Capão Redondo', '{"renda_familiar": 1400, "pessoas_na_casa": 2, "idade_65_mais": true, "cadastro_unico": true}', '{"fonte_grande": true}'),
  ('00000000-0000-4000-a000-000000000502', 'José Carlos Ferreira', '1949-11-02', 'Capão Redondo', '{"renda_familiar": 1412, "pessoas_na_casa": 1, "idade_65_mais": true, "cadastro_unico": false}', '{}'),
  ('00000000-0000-4000-a000-000000000503', 'Ana Paula Oliveira', '1994-07-21', 'Jardim São Luís', '{"renda_familiar": 1800, "pessoas_na_casa": 4, "tem_filhos_pequenos": true, "cadastro_unico": true}', '{}'),
  ('00000000-0000-4000-a000-000000000504', 'Francisca Lima', '1987-01-30', 'Brasilândia', '{"renda_familiar": 900, "pessoas_na_casa": 3, "tem_filhos_pequenos": true, "cadastro_unico": true}', '{"leitor_de_tela": true}'),
  ('00000000-0000-4000-a000-000000000505', 'Antônio Pereira da Silva', '1962-09-08', 'Brasilândia', '{"renda_familiar": 2100, "pessoas_na_casa": 3, "pessoa_com_deficiencia": true}', '{}'),
  ('00000000-0000-4000-a000-000000000506', 'Juliana Souza', '1999-12-15', 'Itaquera', '{"renda_familiar": 1300, "pessoas_na_casa": 3, "tem_filhos_pequenos": true}', '{}'),
  ('00000000-0000-4000-a000-000000000507', 'Raimundo Nonato Alves', '1955-05-19', 'Itaquera', '{"renda_familiar": 1000, "pessoas_na_casa": 2, "idade_65_mais": true, "cadastro_unico": true}', '{"fonte_grande": true, "alto_contraste": true}'),
  ('00000000-0000-4000-a000-000000000508', 'Luciana Rodrigues', '1990-04-03', 'Capão Redondo', '{"renda_familiar": 2500, "pessoas_na_casa": 5, "tem_filhos_pequenos": true}', '{}'),
  ('00000000-0000-4000-a000-000000000509', 'Pedro Henrique Costa', '2001-08-27', 'Brasilândia', '{"renda_familiar": 1600, "pessoas_na_casa": 2}', '{"libras": true}'),
  ('00000000-0000-4000-a000-000000000510', 'Sebastiana Gomes', '1946-02-14', 'Capão Redondo', '{"renda_familiar": 1412, "pessoas_na_casa": 2, "idade_65_mais": true, "cadastro_unico": true}', '{"fonte_grande": true}'),
  ('00000000-0000-4000-a000-000000000511', 'Thiago Martins', '1985-10-10', 'Itaquera', '{"renda_familiar": 3000, "pessoas_na_casa": 4, "tem_filhos_pequenos": true}', '{}'),
  ('00000000-0000-4000-a000-000000000512', 'Edilene Barbosa', '1978-06-06', 'Jardim São Luís', '{"renda_familiar": 1100, "pessoas_na_casa": 4, "cadastro_unico": true}', '{}'),
  ('00000000-0000-4000-a000-000000000513', 'Cláudio Ribeiro', '1970-03-25', 'Brasilândia', '{"renda_familiar": 800, "pessoas_na_casa": 3, "pessoa_com_deficiencia": true, "cadastro_unico": true}', '{"leitor_de_tela": true}'),
  ('00000000-0000-4000-a000-000000000514', 'Patrícia Nascimento', '1996-11-11', 'Capão Redondo', '{"renda_familiar": 1500, "pessoas_na_casa": 3, "tem_filhos_pequenos": true, "cadastro_unico": true}', '{}'),
  ('00000000-0000-4000-a000-000000000515', 'Benedito Araújo', '1952-12-01', 'Itaquera', '{"renda_familiar": 1412, "pessoas_na_casa": 1, "idade_65_mais": true}', '{}'),
  ('00000000-0000-4000-a000-000000000516', 'Daniela Carvalho', '1992-02-29', 'Itaquera', '{"renda_familiar": 1900, "pessoas_na_casa": 4, "tem_filhos_pequenos": true}', '{}'),
  ('00000000-0000-4000-a000-000000000517', 'Marcos Vinícius Teixeira', '1988-09-17', 'Jardim São Luís', '{"renda_familiar": 2200, "pessoas_na_casa": 3, "tem_filhos_pequenos": true}', '{}'),
  ('00000000-0000-4000-a000-000000000518', 'Rosângela Moreira', '1965-07-07', 'Brasilândia', '{"renda_familiar": 1000, "pessoas_na_casa": 2, "cadastro_unico": true}', '{}'),
  ('00000000-0000-4000-a000-000000000519', 'Kauã Batista', '2003-01-20', 'Capão Redondo', '{"renda_familiar": 1412, "pessoas_na_casa": 4}', '{}'),
  ('00000000-0000-4000-a000-000000000520', 'Vera Lúcia Mendes', '1960-10-30', 'Jardim São Luís', '{"renda_familiar": 1200, "pessoas_na_casa": 2, "cadastro_unico": true}', '{"fonte_grande": true}');

-- ---------- Senhas de HOJE ----------
-- UBS Capão Redondo: fila movimentada, com todos os estados
insert into senhas (unidade_id, cidadao_id, codigo, motivo, status, guiche, origem, prioridade, created_at, chamada_em, atendimento_iniciado_em, concluida_em) values
  ('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000501', 'C001', 'consulta', 'concluida',      1, 'app',    true,  now() - interval '150 min', now() - interval '138 min', now() - interval '136 min', now() - interval '120 min'),
  ('00000000-0000-4000-a000-000000000101', null,                                   'V001', 'vacina',   'concluida',      2, 'balcao', false, now() - interval '140 min', now() - interval '118 min', now() - interval '117 min', now() - interval '110 min'),
  ('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000508', 'C002', 'consulta', 'concluida',      1, 'app',    false, now() - interval '130 min', now() - interval '105 min', now() - interval '104 min', now() - interval '85 min'),
  ('00000000-0000-4000-a000-000000000101', null,                                   'R001', 'remedio',  'nao_compareceu', 2, 'balcao', false, now() - interval '115 min', now() - interval '90 min',  null,                      now() - interval '86 min'),
  ('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000510', 'R002', 'remedio',  'concluida',      2, 'app',    true,  now() - interval '100 min', now() - interval '80 min',  now() - interval '79 min',  now() - interval '70 min'),
  ('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000514', 'C003', 'consulta', 'em_atendimento', 1, 'app',    false, now() - interval '70 min',  now() - interval '30 min',  now() - interval '28 min',  null),
  ('00000000-0000-4000-a000-000000000101', null,                                   'V002', 'vacina',   'chamada',        2, 'balcao', false, now() - interval '55 min',  now() - interval '3 min',   null,                      null),
  ('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000519', 'C004', 'consulta', 'aguardando',     null, 'app',  false, now() - interval '40 min',  null, null, null),
  ('00000000-0000-4000-a000-000000000101', null,                                   'R003', 'remedio',  'aguardando',     null, 'balcao', true, now() - interval '32 min', null, null, null),
  ('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000502', 'C005', 'consulta', 'aguardando',     null, 'app',  true,  now() - interval '25 min',  null, null, null),
  ('00000000-0000-4000-a000-000000000101', null,                                   'V003', 'vacina',   'aguardando',     null, 'balcao', false, now() - interval '18 min', null, null, null),
  ('00000000-0000-4000-a000-000000000101', '00000000-0000-4000-a000-000000000503', 'C006', 'consulta', 'aguardando',     null, 'app',  false, now() - interval '9 min',   null, null, null);

-- UBS Vila Brasilândia: fila mais tranquila
insert into senhas (unidade_id, cidadao_id, codigo, motivo, status, guiche, origem, prioridade, created_at, chamada_em, atendimento_iniciado_em, concluida_em) values
  ('00000000-0000-4000-a000-000000000102', '00000000-0000-4000-a000-000000000505', 'C001', 'consulta', 'concluida',  1, 'app',    true,  now() - interval '90 min', now() - interval '80 min', now() - interval '79 min', now() - interval '60 min'),
  ('00000000-0000-4000-a000-000000000102', null,                                   'R001', 'remedio',  'chamada',    1, 'balcao', false, now() - interval '35 min', now() - interval '5 min',  null, null),
  ('00000000-0000-4000-a000-000000000102', '00000000-0000-4000-a000-000000000509', 'V001', 'vacina',   'aguardando', null, 'app',  false, now() - interval '20 min', null, null, null),
  ('00000000-0000-4000-a000-000000000102', '00000000-0000-4000-a000-000000000518', 'C002', 'consulta', 'aguardando', null, 'app',  false, now() - interval '12 min', null, null, null);

-- ---------- Senhas dos últimos 6 dias (para os indicadores) ----------
insert into senhas (unidade_id, codigo, motivo, status, guiche, origem, prioridade, dia, created_at, chamada_em, atendimento_iniciado_em, concluida_em)
select u.id,
       'C' || lpad(n::text, 3, '0'),
       'consulta',
       case when n % 9 = 0 then 'nao_compareceu' else 'concluida' end,
       1 + n % 2,
       case when n % 3 = 0 then 'balcao' else 'app' end,
       n % 5 = 0,
       hoje_sp() - d,
       now() - make_interval(days => d, mins => 300 - n * 10),
       now() - make_interval(days => d, mins => 300 - n * 10 - (10 + (n * 7) % 25)),
       now() - make_interval(days => d, mins => 300 - n * 10 - (12 + (n * 7) % 25)),
       now() - make_interval(days => d, mins => 300 - n * 10 - (25 + (n * 7) % 25))
from unidades u
cross join generate_series(1, 6) as d
cross join lateral generate_series(1, 14 + (d * 3) % 8 - case when u.nome like '%Brasil%' then 5 else 0 end) as n
where u.tipo = 'ubs';

-- ---------- Agendamentos de HOJE no CRAS ----------
insert into agendamentos (unidade_id, cidadao_id, direito_id, data_hora, motivo, documentos_confirmados, status, observacao) values
  ('00000000-0000-4000-a000-000000000201', '00000000-0000-4000-a000-000000000510', '00000000-0000-4000-a000-000000000403',
   (hoje_sp() + time '08:00') at time zone 'America/Sao_Paulo', 'Pedido de BPC para pessoa idosa',
   array['CPF de todas as pessoas da casa', 'Documento com foto', 'Cadastro Único atualizado'], 'atendido', 'Pedido encaminhado ao INSS.'),
  ('00000000-0000-4000-a000-000000000201', '00000000-0000-4000-a000-000000000514', '00000000-0000-4000-a000-000000000401',
   (hoje_sp() + time '08:45') at time zone 'America/Sao_Paulo', 'Atualizar Cadastro Único',
   array['CPF ou título de eleitor de quem responde pela família', 'Comprovante de endereço'], 'atendido', null),
  ('00000000-0000-4000-a000-000000000201', '00000000-0000-4000-a000-000000000508', '00000000-0000-4000-a000-000000000401',
   (hoje_sp() + time '09:30') at time zone 'America/Sao_Paulo', 'Primeira inscrição no Cadastro Único',
   array['CPF ou título de eleitor de quem responde pela família'], 'agendado', null),
  ('00000000-0000-4000-a000-000000000201', '00000000-0000-4000-a000-000000000501', '00000000-0000-4000-a000-000000000402',
   (hoje_sp() + time '10:15') at time zone 'America/Sao_Paulo', 'Tarifa Social de energia',
   array['Número do NIS (do Cadastro Único)', 'CPF de quem está na conta de luz', 'Conta de luz recente'], 'agendado', null),
  ('00000000-0000-4000-a000-000000000201', '00000000-0000-4000-a000-000000000502', '00000000-0000-4000-a000-000000000403',
   (hoje_sp() + time '11:00') at time zone 'America/Sao_Paulo', 'Informações sobre BPC',
   array['Documento com foto'], 'agendado', null),
  ('00000000-0000-4000-a000-000000000201', '00000000-0000-4000-a000-000000000519', '00000000-0000-4000-a000-000000000401',
   (hoje_sp() + time '13:30') at time zone 'America/Sao_Paulo', 'Inscrição no Cadastro Único',
   array['CPF ou título de eleitor de quem responde pela família', 'Documento de todas as pessoas da casa (certidão de nascimento ou CPF)', 'Comprovante de endereço'], 'agendado', null),
  ('00000000-0000-4000-a000-000000000201', '00000000-0000-4000-a000-000000000503', '00000000-0000-4000-a000-000000000402',
   (hoje_sp() + time '15:00') at time zone 'America/Sao_Paulo', 'Tarifa Social de energia',
   array['Conta de luz recente'], 'agendado', null),
  ('00000000-0000-4000-a000-000000000202', '00000000-0000-4000-a000-000000000507', '00000000-0000-4000-a000-000000000403',
   (hoje_sp() + time '09:00') at time zone 'America/Sao_Paulo', 'Pedido de BPC para pessoa idosa',
   array['Documento com foto'], 'falta_documento', 'Trazer CPF de todas as pessoas da casa.'),
  ('00000000-0000-4000-a000-000000000202', '00000000-0000-4000-a000-000000000516', '00000000-0000-4000-a000-000000000401',
   (hoje_sp() + time '10:30') at time zone 'America/Sao_Paulo', 'Atualizar Cadastro Único',
   array['CPF ou título de eleitor de quem responde pela família', 'Comprovante de endereço'], 'agendado', null),
  ('00000000-0000-4000-a000-000000000202', '00000000-0000-4000-a000-000000000515', '00000000-0000-4000-a000-000000000402',
   (hoje_sp() + time '14:00') at time zone 'America/Sao_Paulo', 'Tarifa Social de energia',
   array['CPF de quem está na conta de luz'], 'agendado', null);

update agendamentos set documentos_faltando = array['CPF de todas as pessoas da casa']
where status = 'falta_documento';

-- ---------- Agendamentos dos últimos 6 dias (para os indicadores) ----------
insert into agendamentos (unidade_id, cidadao_id, direito_id, data_hora, motivo, status)
select u.id,
       (select id from cidadaos order by nome offset ((d * 3 + n) % 20) limit 1),
       (array['00000000-0000-4000-a000-000000000401', '00000000-0000-4000-a000-000000000402',
              '00000000-0000-4000-a000-000000000403']::uuid[])[1 + (d + n) % 3],
       ((hoje_sp() - d) + make_time(8 + n, 0, 0)) at time zone 'America/Sao_Paulo',
       'Atendimento',
       case when n % 4 = 0 then 'nao_compareceu' when n % 5 = 0 then 'falta_documento' else 'atendido' end
from unidades u
cross join generate_series(1, 6) as d
cross join lateral generate_series(1, 5 + d % 3) as n
where u.tipo = 'cras';

-- ---------- Direitos dos cidadãos ----------
-- (agendamentos já criaram linhas "agendado"; aqui ajustamos e completamos)
insert into direitos_cidadao (cidadao_id, direito_id, status) values
  ('00000000-0000-4000-a000-000000000510', '00000000-0000-4000-a000-000000000403', 'em_analise'),
  ('00000000-0000-4000-a000-000000000514', '00000000-0000-4000-a000-000000000401', 'concedido'),
  ('00000000-0000-4000-a000-000000000504', '00000000-0000-4000-a000-000000000405', 'agendado'),
  ('00000000-0000-4000-a000-000000000504', '00000000-0000-4000-a000-000000000401', 'concedido'),
  ('00000000-0000-4000-a000-000000000504', '00000000-0000-4000-a000-000000000402', 'provavel'),
  ('00000000-0000-4000-a000-000000000505', '00000000-0000-4000-a000-000000000403', 'provavel'),
  ('00000000-0000-4000-a000-000000000505', '00000000-0000-4000-a000-000000000404', 'concedido'),
  ('00000000-0000-4000-a000-000000000513', '00000000-0000-4000-a000-000000000403', 'em_analise'),
  ('00000000-0000-4000-a000-000000000513', '00000000-0000-4000-a000-000000000402', 'concedido'),
  ('00000000-0000-4000-a000-000000000501', '00000000-0000-4000-a000-000000000404', 'concedido'),
  ('00000000-0000-4000-a000-000000000506', '00000000-0000-4000-a000-000000000405', 'agendado'),
  ('00000000-0000-4000-a000-000000000506', '00000000-0000-4000-a000-000000000401', 'provavel'),
  ('00000000-0000-4000-a000-000000000512', '00000000-0000-4000-a000-000000000401', 'concedido'),
  ('00000000-0000-4000-a000-000000000512', '00000000-0000-4000-a000-000000000402', 'provavel'),
  ('00000000-0000-4000-a000-000000000518', '00000000-0000-4000-a000-000000000402', 'em_analise'),
  ('00000000-0000-4000-a000-000000000520', '00000000-0000-4000-a000-000000000404', 'concedido'),
  ('00000000-0000-4000-a000-000000000503', '00000000-0000-4000-a000-000000000405', 'agendado'),
  ('00000000-0000-4000-a000-000000000508', '00000000-0000-4000-a000-000000000405', 'agendado'),
  ('00000000-0000-4000-a000-000000000511', '00000000-0000-4000-a000-000000000405', 'agendado'),
  ('00000000-0000-4000-a000-000000000516', '00000000-0000-4000-a000-000000000405', 'agendado'),
  ('00000000-0000-4000-a000-000000000517', '00000000-0000-4000-a000-000000000405', 'agendado')
on conflict (cidadao_id, direito_id) do update set status = excluded.status;

-- ---------- Lista de espera das creches ----------
insert into lista_creche (unidade_id, cidadao_id, nome_crianca, data_nascimento_crianca, posicao, documentos_pendentes, status, convocada_em, prazo_resposta, respondida_em) values
  -- CEI Jardim São Luís
  ('00000000-0000-4000-a000-000000000301', '00000000-0000-4000-a000-000000000503', 'Helena Oliveira',    hoje_sp() - 420, 1, '{}', 'convocada', now() - interval '8 hours', now() + interval '40 hours', null),
  ('00000000-0000-4000-a000-000000000301', '00000000-0000-4000-a000-000000000517', 'Miguel Teixeira',    hoje_sp() - 610, 2, '{}', 'aguardando', null, null, null),
  ('00000000-0000-4000-a000-000000000301', '00000000-0000-4000-a000-000000000508', 'Laura Rodrigues',    hoje_sp() - 300, 3, array['Carteira de vacinação da criança'], 'aguardando', null, null, null),
  ('00000000-0000-4000-a000-000000000301', '00000000-0000-4000-a000-000000000512', 'Davi Barbosa',       hoje_sp() - 820, 4, '{}', 'aguardando', null, null, null),
  ('00000000-0000-4000-a000-000000000301', '00000000-0000-4000-a000-000000000514', 'Alice Nascimento',   hoje_sp() - 200, 5, array['Comprovante de endereço'], 'aguardando', null, null, null),
  -- CEI Brasilândia
  ('00000000-0000-4000-a000-000000000302', '00000000-0000-4000-a000-000000000504', 'Arthur Lima',        hoje_sp() - 500, 1, '{}', 'aceitou', now() - interval '2 days', now() - interval '1 day', now() - interval '30 hours'),
  ('00000000-0000-4000-a000-000000000302', '00000000-0000-4000-a000-000000000513', 'Valentina Ribeiro',  hoje_sp() - 380, 2, '{}', 'aguardando', null, null, null),
  ('00000000-0000-4000-a000-000000000302', '00000000-0000-4000-a000-000000000509', 'Heitor Costa',       hoje_sp() - 150, 3, array['Certidão de nascimento da criança'], 'aguardando', null, null, null),
  ('00000000-0000-4000-a000-000000000302', '00000000-0000-4000-a000-000000000518', 'Sophia Moreira',     hoje_sp() - 700, 4, '{}', 'aguardando', null, null, null),
  -- CEI Itaquera
  ('00000000-0000-4000-a000-000000000303', '00000000-0000-4000-a000-000000000506', 'Bernardo Souza',     hoje_sp() - 450, 1, '{}', 'aguardando', null, null, null),
  ('00000000-0000-4000-a000-000000000303', '00000000-0000-4000-a000-000000000516', 'Manuela Carvalho',   hoje_sp() - 260, 2, array['CPF de quem é responsável'], 'aguardando', null, null, null),
  ('00000000-0000-4000-a000-000000000303', '00000000-0000-4000-a000-000000000511', 'Théo Martins',       hoje_sp() - 900, 3, '{}', 'aguardando', null, null, null);
