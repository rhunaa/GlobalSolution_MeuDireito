# Tema do Meu Direito

Valores exatos, para a web e para o app mobile usarem os mesmos tokens.
Fonte da verdade na web: [`web/src/theme/tokens.css`](../web/src/theme/tokens.css) (variáveis CSS) e
[`web/src/theme/antd.ts`](../web/src/theme/antd.ts) (tokens do Ant Design). Se mudar uma cor, mude nos dois.

Biblioteca de UI da web: **Ant Design 6** (`antd`), com Tailwind CSS v4 para layout.
(O briefing inicial pedia HeroUI v3; a troca para Ant Design foi decisão da equipe durante a Fase 7.)

## Tipografia

| Item | Valor |
| --- | --- |
| Família | **Montserrat** (`@fontsource/montserrat`), com fallback `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| Pesos usados | 400 (texto), 500 (apoio), 600 (rótulos e botões), 700 (títulos), 800 (números grandes e códigos de senha) |
| Tamanho base | `1rem` = 16 px (nunca fixar em px; respeita o ajuste do navegador) |
| Altura de linha | 1.5 no texto; 1.25 em títulos |
| h1 | `1.5rem` (24 px) no celular, `1.875rem` (30 px) em telas ≥ 640 px |
| h2 | `1.25rem` (20 px), peso 700 |
| Texto de apoio | `0.875rem` (14 px), cor `muted` |
| Códigos de senha | 2.25rem (36 px) a 8 rem; peso 800; `tabular-nums` |
| Telão | senha: `clamp(4rem, 26vw, 26rem)`; guichê: `clamp(2rem, 9vw, 9rem)` |

## Espaçamento, raios e bordas

| Token | Valor |
| --- | --- |
| Escala de espaço | múltiplos de `0.25rem` (4 px) – utilitários `1`, `2`, `3`, `4`, `6`, `8` do Tailwind |
| Margem lateral das páginas | `1rem` (16 px); `2rem` (32 px) em telas ≥ 1024 px |
| `--radius` (base) | `0.625rem` = **10 px** (botões, campos) |
| Cartões e faixas | `1rem` = 16 px (`rounded-2xl`) |
| Cartão de senha emitida / telão | 24 px a 48 px (`rounded-3xl`, `rounded-[3rem]`) |
| Selos de status | totalmente arredondado (`rounded-full`) |
| Borda | 1 px (`--border-width`); campos 1 px |
| Alvo de toque mínimo | 44 px de altura (`controlHeight` do Ant Design) |

## Cores

### Neutras e institucional

| Token CSS | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--background` | `#F2F4FB` | `#0E171B` | fundo de todas as páginas (azulzinho) |
| `--surface` | `#FFFFFF` | `#16232A` | cartões, cabeçalho, menu |
| `--surface-secondary` | `#ECEFF9` | `#1D2D35` | áreas internas, teclas, linhas das tabelas alternativas |
| `--surface-tertiary` | `#E7E2D8` | `#24363F` | reservado |
| `--foreground` | `#1A2328` | `#ECF1F3` | texto principal |
| `--muted` | `#4F5D63` | `#A7B5BB` | texto de apoio |
| `--accent` (institucional, azul-marinho da logo) | `#1B2A4A` | `#9DB4E8` | botão principal, links, item de menu ativo |
| `--accent-foreground` | `#FFFFFF` | `#0F1A30` | texto sobre o accent |
| `--link` | `#1B2A4A` | `#9DB4E8` | links |
| `--success` | `#1E6B3A` | `#7FD69B` | confirmação |
| `--warning` | `#F2B544` | `#F5C065` | preenchimentos de aviso |
| `--danger` | `#A3201B` | `#FF9B94` | erros |
| `--border` | `#E1E6F2` | `#33454E` | bordas leves (quase não aparecem) |
| `--separator` | `#E8ECF6` | `#2A3B43` | linhas entre itens |
| `--field-border` | `#7C8A90` | `#6E838C` | borda de campos (≥ 3:1) |
| `--field-placeholder` | `#5F6B70` | `#93A3AA` | texto de exemplo |
| `--focus` | `#1F4FD1` | `#FFD24D` | contorno de foco |
| `--destaque-novo` | `#FFF3C4` | `#3D3410` | fundo de item que acabou de chegar |

No Ant Design, `colorWarning` usa `#7A4A00` (claro) e `#F5C065` (escuro) para manter o texto dos avisos com contraste ≥ 4,5:1.

### Cor por serviço

| Serviço | Forte (claro) | Suave (claro) | Forte (escuro) | Suave (escuro) |
| --- | --- | --- | --- | --- |
| UBS (saúde) | `#1C7445` | `#E1F1E7` | `#6FCF97` | `#173323` |
| CRAS (assistência social) | `#A1431A` | `#FBE8DD` | `#F0A07A` | `#3A2418` |
| Creche | `#A3305F` | `#F9E3EC` | `#F28DB7` | `#3A1D2A` |

### Status (sempre cor + ícone + texto)

| Status | Texto no selo | Ícone (lucide) | Forte (claro) | Suave (claro) | Forte (escuro) | Suave (escuro) |
| --- | --- | --- | --- | --- | --- | --- |
| Aguardando | Aguardando | `Clock` | `#7A4A00` | `#FCEFD6` | `#F5C065` | `#3A2E14` |
| Chamada | Chamada | `Megaphone` | `#1E4FBF` | `#E3EAFB` | `#8DB0FF` | `#1C2A4D` |
| Em atendimento | Em atendimento | `UserRound` | `#5B3FA0` | `#EEE8F8` | `#C1A8F5` | `#2C2347` |
| Concluída | Concluída | `CircleCheck` | `#1E6B3A` | `#E2F2E6` | `#7FD69B` | `#173823` |
| Falta documento | Falta documento | `FileWarning` | `#A13C0E` | `#FBE6DA` | `#F7A877` | `#3F2516` |
| Não compareceu | Não compareceu | `UserX` | `#A3201B` | `#F9E0DE` | `#FF9B94` | `#431D1B` |
| Neutro (provável, expirou) | – | `CircleHelp`, `Hourglass` | `#4F5D63` | `#ECEAE5` | `#B4C0C5` | `#26333A` |

Outros textos de status usados: *Convocada*, *Aceitou a vaga*, *Recusou a vaga*, *Prazo expirou* (creche); *Agendado*, *Atendido*, *Encaminhado* (CRAS); *Em análise*, *Concedido*, *Negado* (direitos). Todos reaproveitam os tons acima (ver `web/src/theme/status.ts`).

### Gráficos

| Token | Claro | Escuro |
| --- | --- | --- |
| `--grafico-1` (série 1, azul) | `#1D5FA8` | `#4A8AE0` |
| `--grafico-2` (série 2, laranja) | `#C2570C` | `#D06F30` |
| `--grafico-trilho` (grade e fundo das barras) | `#E3E8F4` | `#2A3B43` |

Os pares foram validados (separação para daltonismo ΔE ≥ 15, contraste ≥ 3:1 com a superfície) com o validador de paletas do guia de visualização de dados. As cores de serviço **não** servem como série de gráfico (falharam na separação para daltonismo).

### Logo e capa (`/`)

A marca é uma balança da justiça num quadrado arredondado azul-marinho, com os pratos em ouro; o nome é "Meu" (peso 500) + "Direito" (peso 800) e o lema é "Seus direitos, simples". Componente: `web/src/components/Logo.tsx`; ícone do navegador: `web/public/favicon.svg`.

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--logo-tile` | `#1B2A4A` | `#FFFFFF` | quadrado da logo (no escuro vira branco) |
| `--logo-glifo` | `#FFFFFF` | `#1B2A4A` | balança |
| `--logo-ouro` | `#C9973F` | `#D9A94E` | pratos da balança |
| `--logo-texto` | `#1B2A4A` | `#FFFFFF` | nome |
| `--logo-lema` | `#4A5878` | `#A7B5BB` | lema (7,1:1 e 8,6:1) |
| `--capa-fundo` | `#F2F4FB` | `#0E171B` | fundo da capa inteira (azulzinho) |
| `--capa-bloco` | `#F2F4FB` | `#16232A` | mesmo azulzinho da capa |
| `--capa-trilha` | `#C9973F` | `#E0B45C` | trilha pontilhada (decorativa) |

A primeira tela tem uma frase de impacto no centro e seis personagens em formas coloridas (`web/src/pages/capa/Personagens.tsx`); as ilustrações das seções ficam em `web/src/pages/capa/Desenhos.tsx`. Tudo é SVG próprio.

### Telão (fixo, não muda com o tema)

| Token | Valor |
| --- | --- |
| Fundo | `#000000` |
| Texto | `#FFFFFF` |
| Destaque (senha e borda) | `#FFD24D` |

## Contraste (WCAG AA)

Calculado em todas as combinações de texto e fundo da tabela acima. Resultado:

- texto principal sobre fundo/superfície: 14,1:1 a 16:1;
- texto de apoio (`muted`): 5,7:1 a 8,6:1;
- botão principal (`accent-foreground` sobre `accent`): 8,4:1 (escuro) a 14,2:1 (claro);
- `accent` como texto: 14,2:1 sobre branco e 7,7:1 a 8,8:1 no escuro;
- status (forte sobre suave e sobre a superfície): 5,5:1 a 9,6:1;
- foco (`--focus`) sobre fundo e superfície: ≥ 6,1:1;
- bordas de campos: ≥ 3,5:1.

Além do cálculo, a auditoria automática com axe-core (regras WCAG 2.0/2.1/2.2 A e AA e boas práticas) deu **zero violações** em todas as rotas, nos modos claro e escuro.

## Cartões e listas

Estilo "macio", o mesmo da capa: cartões brancos com `border-radius` de 24 px, sem borda e com sombra suave (`0 8px 28px rgba(27,42,74,0.07)`), sobre o fundo azulzinho. A classe `.cartao-fofo` (em `src/index.css`) aplica isso. As tabelas de fila, agenda e lista da creche usam `.lista-fofa`: cada linha é um cartão arredondado (20 px) separado por 12 px, mas continuam sendo `<table>` para leitores de tela. Os números de resumo ficam em cartões com ícone em círculo pastel, e a matriz de direitos por bairro usa células arredondadas em azul claro.

## Foco

Contorno de 3 px sólido na cor `--focus`, com 2 px de afastamento, em todo elemento focável (nativo ou do Ant Design). Nunca só mudança de cor.

## Modo claro (único)

O site usa **somente o tema claro**: não há botão nem preferência para modo escuro. `TemaProvider` (`src/theme/TemaProvider.tsx`) fixa o tema claro, configura o Ant Design e respeita `prefers-reduced-motion`; um script no `index.html` marca `html.light` antes da primeira pintura.

As colunas "Escuro" das tabelas acima ficam registradas porque os tokens do modo escuro continuam em `tokens.css` (bloco `.dark`), mas nada os ativa. Para reativar no futuro, volte a aplicar a classe `dark` no `<html>` e o algoritmo escuro do Ant Design (`temaAntd('dark', …)`).

## Reaproveitar no app mobile

Os tokens são agnósticos de plataforma: copie os valores hexadecimais, o raio base (10 px), a escala de 4 px, a família Montserrat, os pesos e os tons de status (com os mesmos ícones e textos). Em React Native, mapear `colorPrimary` ↔ `--accent`, `colorBgContainer` ↔ `--surface`, `colorBgBase` ↔ `--background`.

## Tom sóbrio (web e app)

- **Cantos:** pouco arredondados (6 px nos controles do Ant Design, 12 px em cartões e listas). Sem pílulas.
- **Sem sombras:** cartões e linhas de lista usam só uma borda fina (`--border`).
- **Tipografia:** Montserrat em vários pesos. Light (300) em textos de apoio maiores e em "Meu" na logo; Regular (400) no texto corrido; Semibold (600) em títulos; Bold (700) em "Direito" na logo, selos e rótulos pequenos. Texto pequeno nunca usa Light, por legibilidade.
