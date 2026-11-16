import type { Cidadao, Direito, Unidade } from '../../types'

/**
 * Dados fixos do modo mock – os mesmos de supabase/seed.sql.
 * Nomes de pessoas são fictícios; endereços são ilustrativos.
 */

const id = (n: number) => `00000000-0000-4000-a000-${String(n).padStart(12, '0')}`

export const IDS = {
  ubsCapao: id(101),
  ubsBrasilandia: id(102),
  crasCapao: id(201),
  crasItaquera: id(202),
  cheiSaoLuis: id(301),
  cheiBrasilandia: id(302),
  cheiItaquera: id(303),
  cadUnico: id(401),
  tarifaSocial: id(402),
  bpc: id(403),
  remedios: id(404),
  creche: id(405),
  cidadao: (n: number) => id(500 + n),
}

export const UNIDADES: Unidade[] = [
  {
    id: IDS.ubsCapao, tipo: 'ubs', nome: 'UBS Capão Redondo', endereco: 'Rua das Acácias, 120', bairro: 'Capão Redondo',
    horario: 'Seg a sex, 7h às 19h', latitude: -23.6672, longitude: -46.7795,
    acessibilidade: { rampa: true, banheiro_adaptado: true, libras: true },
  },
  {
    id: IDS.ubsBrasilandia, tipo: 'ubs', nome: 'UBS Vila Brasilândia', endereco: 'Avenida Esperança, 850', bairro: 'Brasilândia',
    horario: 'Seg a sex, 7h às 19h; sáb, 8h às 12h', latitude: -23.4612, longitude: -46.6877,
    acessibilidade: { rampa: true, banheiro_adaptado: false, libras: false },
  },
  {
    id: IDS.crasCapao, tipo: 'cras', nome: 'CRAS Capão Redondo', endereco: 'Rua dos Ipês, 45', bairro: 'Capão Redondo',
    horario: 'Seg a sex, 8h às 17h', latitude: -23.664, longitude: -46.776,
    acessibilidade: { rampa: true, banheiro_adaptado: true, libras: false },
  },
  {
    id: IDS.crasItaquera, tipo: 'cras', nome: 'CRAS Itaquera', endereco: 'Rua Paz e Bem, 300', bairro: 'Itaquera',
    horario: 'Seg a sex, 8h às 17h', latitude: -23.541, longitude: -46.457,
    acessibilidade: { rampa: true, banheiro_adaptado: true, libras: true },
  },
  {
    id: IDS.cheiSaoLuis, tipo: 'creche', nome: 'CEI Jardim São Luís', endereco: 'Rua Girassol, 77', bairro: 'Jardim São Luís',
    horario: 'Seg a sex, 7h às 17h', latitude: -23.655, longitude: -46.747,
    acessibilidade: { rampa: true, banheiro_adaptado: true, libras: false },
  },
  {
    id: IDS.cheiBrasilandia, tipo: 'creche', nome: 'CEI Brasilândia', endereco: 'Rua Arco-Íris, 510', bairro: 'Brasilândia',
    horario: 'Seg a sex, 7h às 17h', latitude: -23.465, longitude: -46.69,
    acessibilidade: { rampa: false, banheiro_adaptado: false, libras: false },
  },
  {
    id: IDS.cheiItaquera, tipo: 'creche', nome: 'CEI Itaquera', endereco: 'Avenida Primavera, 1500', bairro: 'Itaquera',
    horario: 'Seg a sex, 7h às 17h', latitude: -23.538, longitude: -46.46,
    acessibilidade: { rampa: true, banheiro_adaptado: true, libras: true },
  },
]

export const DIREITOS: Direito[] = [
  // TODO: conferir regra atual em fonte oficial
  {
    id: IDS.cadUnico,
    nome: 'Cadastro Único',
    descricao_simples:
      'É o cadastro do governo que mostra quem precisa de apoio. Estar nele abre a porta para vários benefícios, como Bolsa Família e Tarifa Social.',
    quem_pode: 'Famílias com renda de até meio salário mínimo por pessoa.',
    documentos: [
      'CPF ou título de eleitor de quem responde pela família',
      'Documento de todas as pessoas da casa (certidão de nascimento ou CPF)',
      'Comprovante de endereço',
      'Carteira de trabalho, se tiver',
    ],
    tipo_unidade: 'cras',
    fonte_oficial: 'https://www.gov.br/mds/pt-br/acoes-e-programas/cadastro-unico',
  },
  // TODO: conferir regra atual em fonte oficial
  {
    id: IDS.tarifaSocial,
    nome: 'Tarifa Social de Energia Elétrica',
    descricao_simples: 'Desconto na conta de luz para famílias de baixa renda. O desconto aparece direto na conta.',
    quem_pode:
      'Famílias no Cadastro Único com renda de até meio salário mínimo por pessoa, ou com alguém que recebe o BPC.',
    documentos: ['Número do NIS (do Cadastro Único)', 'CPF de quem está na conta de luz', 'Conta de luz recente'],
    tipo_unidade: 'cras',
    fonte_oficial: 'https://www.gov.br/aneel/pt-br/assuntos/tarifas/tarifa-social',
  },
  // TODO: conferir regra atual em fonte oficial
  {
    id: IDS.bpc,
    nome: 'BPC – Benefício de Prestação Continuada',
    descricao_simples:
      'Um salário mínimo por mês para pessoa idosa ou com deficiência que não tem como se sustentar. Não precisa ter contribuído com o INSS.',
    quem_pode:
      'Pessoas com 65 anos ou mais, ou pessoas com deficiência, com renda de até um quarto de salário mínimo por pessoa da família e inscritas no Cadastro Único.',
    documentos: [
      'CPF de todas as pessoas da casa',
      'Documento com foto',
      'Cadastro Único atualizado',
      'Laudo médico (para pessoa com deficiência)',
    ],
    tipo_unidade: 'cras',
    fonte_oficial:
      'https://www.gov.br/inss/pt-br/direitos-e-deveres/beneficios-assistenciais/beneficio-assistencial-ao-idoso-e-a-pessoa-com-deficiencia-bpc',
  },
  // TODO: conferir regra atual em fonte oficial
  {
    id: IDS.remedios,
    nome: 'Remédios gratuitos pelo SUS',
    descricao_simples:
      'Muitos remédios de uso contínuo, como os de pressão e diabetes, são de graça na farmácia da UBS ou no Farmácia Popular.',
    quem_pode: 'Qualquer pessoa com receita médica dentro da validade.',
    documentos: ['Receita médica dentro da validade', 'Documento com foto', 'Cartão SUS'],
    tipo_unidade: 'ubs',
    fonte_oficial: 'https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular',
  },
  // TODO: conferir regra atual em fonte oficial
  {
    id: IDS.creche,
    nome: 'Vaga em creche pública',
    descricao_simples:
      'Toda criança pequena tem direito a creche gratuita perto de casa. A inscrição entra numa lista por ordem e critérios da prefeitura.',
    quem_pode: 'Crianças de 0 a 3 anos que moram na cidade.',
    documentos: [
      'Certidão de nascimento da criança',
      'CPF de quem é responsável',
      'Comprovante de endereço',
      'Carteira de vacinação da criança',
    ],
    tipo_unidade: 'creche',
    fonte_oficial: 'https://educacao.sme.prefeitura.sp.gov.br/',
  },
]

type LinhaCidadao = [string, string, string, Cidadao['perfil'], Cidadao['preferencias_acessibilidade']]

const LINHAS_CIDADAOS: LinhaCidadao[] = [
  ['Maria Aparecida dos Santos', '1958-03-12', 'Capão Redondo', { renda_familiar: 1400, pessoas_na_casa: 2, idade_65_mais: true, cadastro_unico: true }, { fonte_grande: true }],
  ['José Carlos Ferreira', '1949-11-02', 'Capão Redondo', { renda_familiar: 1412, pessoas_na_casa: 1, idade_65_mais: true, cadastro_unico: false }, {}],
  ['Ana Paula Oliveira', '1994-07-21', 'Jardim São Luís', { renda_familiar: 1800, pessoas_na_casa: 4, tem_filhos_pequenos: true, cadastro_unico: true }, {}],
  ['Francisca Lima', '1987-01-30', 'Brasilândia', { renda_familiar: 900, pessoas_na_casa: 3, tem_filhos_pequenos: true, cadastro_unico: true }, { leitor_de_tela: true }],
  ['Antônio Pereira da Silva', '1962-09-08', 'Brasilândia', { renda_familiar: 2100, pessoas_na_casa: 3, pessoa_com_deficiencia: true }, {}],
  ['Juliana Souza', '1999-12-15', 'Itaquera', { renda_familiar: 1300, pessoas_na_casa: 3, tem_filhos_pequenos: true }, {}],
  ['Raimundo Nonato Alves', '1955-05-19', 'Itaquera', { renda_familiar: 1000, pessoas_na_casa: 2, idade_65_mais: true, cadastro_unico: true }, { fonte_grande: true, alto_contraste: true }],
  ['Luciana Rodrigues', '1990-04-03', 'Capão Redondo', { renda_familiar: 2500, pessoas_na_casa: 5, tem_filhos_pequenos: true }, {}],
  ['Pedro Henrique Costa', '2001-08-27', 'Brasilândia', { renda_familiar: 1600, pessoas_na_casa: 2 }, { libras: true }],
  ['Sebastiana Gomes', '1946-02-14', 'Capão Redondo', { renda_familiar: 1412, pessoas_na_casa: 2, idade_65_mais: true, cadastro_unico: true }, { fonte_grande: true }],
  ['Thiago Martins', '1985-10-10', 'Itaquera', { renda_familiar: 3000, pessoas_na_casa: 4, tem_filhos_pequenos: true }, {}],
  ['Edilene Barbosa', '1978-06-06', 'Jardim São Luís', { renda_familiar: 1100, pessoas_na_casa: 4, cadastro_unico: true }, {}],
  ['Cláudio Ribeiro', '1970-03-25', 'Brasilândia', { renda_familiar: 800, pessoas_na_casa: 3, pessoa_com_deficiencia: true, cadastro_unico: true }, { leitor_de_tela: true }],
  ['Patrícia Nascimento', '1996-11-11', 'Capão Redondo', { renda_familiar: 1500, pessoas_na_casa: 3, tem_filhos_pequenos: true, cadastro_unico: true }, {}],
  ['Benedito Araújo', '1952-12-01', 'Itaquera', { renda_familiar: 1412, pessoas_na_casa: 1, idade_65_mais: true }, {}],
  ['Daniela Carvalho', '1992-02-29', 'Itaquera', { renda_familiar: 1900, pessoas_na_casa: 4, tem_filhos_pequenos: true }, {}],
  ['Marcos Vinícius Teixeira', '1988-09-17', 'Jardim São Luís', { renda_familiar: 2200, pessoas_na_casa: 3, tem_filhos_pequenos: true }, {}],
  ['Rosângela Moreira', '1965-07-07', 'Brasilândia', { renda_familiar: 1000, pessoas_na_casa: 2, cadastro_unico: true }, {}],
  ['Kauã Batista', '2003-01-20', 'Capão Redondo', { renda_familiar: 1412, pessoas_na_casa: 4 }, {}],
  ['Vera Lúcia Mendes', '1960-10-30', 'Jardim São Luís', { renda_familiar: 1200, pessoas_na_casa: 2, cadastro_unico: true }, { fonte_grande: true }],
]

export const CIDADAOS: Cidadao[] = LINHAS_CIDADAOS.map(([nome, data_nascimento, bairro, perfil, prefs], i) => ({
  id: IDS.cidadao(i + 1),
  nome,
  data_nascimento,
  bairro,
  perfil,
  preferencias_acessibilidade: prefs,
}))
