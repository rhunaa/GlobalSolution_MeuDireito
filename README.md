# Meu Direito

_Seus direitos, simples._

> **O direito já existe. O que falta é o caminho até ele.**

Projeto da Global Solution FIAP, tema CitizenTech.

- **Vídeo-pitch:** https://youtu.be/o2VoWSJshE0
- **Documento da solução (PDF):** [`docs/Meu-Direito-Documento.pdf`](docs/Meu-Direito-Documento.pdf)

## Integrantes

| Nome (ordem alfabética) | RM |
| --- | --- |
| _(nome 1)_ | _(RM)_ |
| _(nome 2)_ | _(RM)_ |
| _(nome 3)_ | _(RM)_ |

## A solução

O **Meu Direito** une a descoberta de direitos sociais e as filas de serviços públicos numa jornada só.

- **App mobile** (`mobile/`, Expo / React Native): é do cidadão. Descobre direitos, pega senha na UBS, agenda no CRAS, entra na lista da creche e acompanha tudo em tempo real.
- **Plataforma web** (`web/`, esta entrega): é de quem atende. Recepcionista da UBS, assistente social do CRAS e gestora de vagas de creche, mais um telão para a sala de espera, um painel de indicadores e uma página pública.

Toda a interface é em português do Brasil, com linguagem simples.

### Telas da plataforma web

| Rota | Quem usa | O que faz |
| --- | --- | --- |
| `/` | qualquer pessoa | **Capa**: explica o projeto com desenhos e leva para a plataforma |
| `/entrar` | equipe | Escolher perfil e unidade (acesso de demonstração) |
| `/ubs/fila` | recepcionista | Fila em tempo real, "Chamar próximo" (atalho **N**), iniciar, concluir, não compareceu |
| `/ubs/balcao` | recepcionista | Emitir senha para quem não tem celular, com impressão |
| `/telao/:unidadeId` | sala de espera | Senha chamada em tamanho gigante, últimas 4 chamadas e voz |
| `/cras/agenda` | assistente social | Agenda do dia com documentos confirmados |
| `/cras/atendimento/:id` | assistente social | Registrar o resultado (atendido, falta documento, encaminhado, não compareceu) |
| `/creche/lista` | gestora | Lista de espera, "Abrir vaga" e resposta da família |
| `/indicadores` | gestores | Espera por unidade, atendimentos por dia, faltas e direitos por bairro |
| `/publico` | qualquer pessoa | Movimento atual das unidades em lista compacta, com seletor de lugar (todos, por tipo ou uma unidade), sem nenhum dado pessoal |
| `/simulador` | equipe (demonstração) | Simula o app: pegar senha, agendar, aceitar ou recusar vaga |

## Como a integração funciona

App e web usam o **mesmo banco Supabase**. Cada mudança numa tabela é publicada pelo Supabase Realtime (`senhas`, `agendamentos`, `lista_creche`, `direitos_cidadao`, `historico`) e as duas pontas recebem na hora, sem recarregar.

| Ação | Quem faz | Quem vê |
| --- | --- | --- |
| Pegar senha | app (ou simulador) | fila da recepcionista |
| "Chamar próximo" | web | telão e app |
| Agendar no CRAS | app (ou simulador) | agenda do CRAS |
| Registrar resultado | web | status do direito no app |
| Abrir vaga de creche | web | convocação no app |
| Responder à convocação | app (ou simulador) | lista da creche |

As regras de negócio ficam **no banco** ([`supabase/schema.sql`](supabase/schema.sql)), para web e app se comportarem igual:

- `emitir_senha`, `chamar_proxima` (prioridade primeiro; sem chamar a mesma pessoa em dois guichês), `atualizar_status_senha`
- `registrar_atendimento` (atualiza o agendamento e o direito do cidadão)
- `abrir_vaga` (prazo de 48 h), `responder_convocacao`, `expirar_convocacoes`
- triggers que gravam a tabela `historico` a cada mudança de status (alimenta a linha do tempo do app)
- views agregadas para indicadores e página pública, sem dados pessoais

Na web, nenhuma página fala com o banco: tudo passa por `src/services/`, e os hooks (`useRealtimeFila`, `useRealtimeAgenda`, `useRealtimeCreche`) mantêm as listas atualizadas. O indicador "Ao vivo" / "Reconectando…" mostra o estado da conexão.

## Tecnologias

Vite · React 19 · TypeScript · Tailwind CSS v4 · **Ant Design 6** · React Router · Supabase (`@supabase/supabase-js`, Realtime) · `motion` · lucide-react · Montserrat (`@fontsource/montserrat`).

> O briefing inicial pedia HeroUI v3. A biblioteca de UI foi trocada por Ant Design a pedido da equipe durante a Fase 7.

## Como rodar a web localmente

Requer Node 20 ou mais novo.

```bash
cd web
npm install
npm run dev
```

Abra http://localhost:5173.

Sem configurar o Supabase, a plataforma roda com **dados de demonstração locais** (modo mock): o banco fica no `localStorage` e as abas do mesmo navegador conversam entre si. Para testar o tempo real, abra a fila e o telão em duas abas e use o simulador em uma terceira. O botão "Restaurar dados de exemplo" (no simulador) volta tudo ao início.

Outros comandos: `npm run build` (compila), `npm run preview` (serve o build), `npm run lint`.

### Baixar site (instalar como app)

O botão **Baixar site** da capa instala o Meu Direito no aparelho (PWA): `web/public/manifest.webmanifest`, ícones `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` e um service worker mínimo (`web/public/sw.js`, registrado só em produção e sem cache). Em navegadores que não oferecem a instalação direta, o botão mostra o passo a passo (iPhone, Android, Chrome/Edge, Safari do Mac). A instalação só funciona em HTTPS, por exemplo no deploy da Vercel.

## Como configurar o Supabase

1. Crie um projeto em https://supabase.com.
2. No **SQL Editor**, rode [`supabase/schema.sql`](supabase/schema.sql) e depois [`supabase/seed.sql`](supabase/seed.sql). Os dois podem ser rodados de novo para recomeçar.
3. Copie `web/.env.example` para `web/.env.local` e preencha:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (Project Settings → API)
4. Reinicie `npm run dev`. O Realtime já vem habilitado pelo `schema.sql`.

> As políticas de segurança (RLS) são **permissivas de propósito**, só para a demonstração com a chave anon. Em produção haveria autenticação real e políticas por perfil (o cidadão só vê os próprios dados, a recepcionista só altera a própria unidade, a página pública só lê as views agregadas).

## Deploy na Vercel

- **Link do deploy:** _(colar aqui)_
- Importe o repositório e defina o **Root Directory** como `web`.
- Framework: Vite (detectado). Build: `npm run build`. Saída: `dist`.
- Em *Environment Variables*, crie `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- [`web/vercel.json`](web/vercel.json) já faz o redirecionamento de todas as rotas para `index.html` (SPA).

## Acessibilidade

Pensada desde o início e conferida na Fase 7:

- HTML semântico, títulos em ordem, link "Pular para o conteúdo", foco sempre visível (contorno de 3 px) e navegação completa por teclado.
- Contraste WCAG AA no tema claro, que é o único do site (cálculos em [`docs/THEME.md`](docs/THEME.md)).
- Nada depende só de cor: status sempre com cor, ícone e texto.
- Texto em `rem`; todas as telas cabem em 320 px de largura (zoom de 400%) sem rolagem lateral; tabelas largas rolam dentro de uma região com foco.
- `aria-live="polite"` para mudanças de fila, agenda e lista; `aria-live="assertive"` para a senha chamada no telão.
- Gráficos com tabela equivalente; formulários com rótulo visível e erro ligado ao campo.
- `prefers-reduced-motion` respeitado em todas as animações ([`docs/MOTION.md`](docs/MOTION.md)).
- Auditoria automática (axe-core, WCAG 2.2 AA e boas práticas): zero violações em todas as rotas.

## Roteiro da demonstração (vídeo)

1. Abra `/telao/<id da UBS>` numa janela e `/ubs/fila` (perfil Recepcionista) em outra.
2. No `/simulador`, escolha um cidadão e pegue uma senha na UBS: ela aparece na fila com o selo "Nova".
3. Na fila, clique em **Chamar próximo**: o telão mostra a senha com destaque e anuncia em voz alta (clique antes em "Ativar som").
4. No simulador, agende no CRAS; na agenda do CRAS (perfil Assistente social) o horário aparece. Registre "Falta documento" e veja o direito mudar no simulador.
5. Na lista da creche (perfil Gestora), clique em **Abrir vaga**; no simulador, aceite a vaga e veja a resposta chegar.
6. Abra `/indicadores` e `/publico` para mostrar os números.

## Estrutura

```
meu-direito/
├─ web/           plataforma web (Vite + React + TypeScript)
│  └─ src/        pages, components, services, hooks, types, theme, routes, utils
├─ mobile/        app do cidadão (em desenvolvimento)
├─ supabase/      schema.sql e seed.sql (usados por web e app)
└─ docs/          THEME.md e MOTION.md
```

## App mobile

App do cidadão em **Expo (React Native + TypeScript)**, com a mesma estética da web (Montserrat, azul-marinho e ouro, cartões arredondados e os mesmos personagens em SVG).

Fluxo: **capa** → **entrar** (escolha de uma pessoa de demonstração) → **passo a passo** (4 telas com os personagens) → **app**.

| Aba / tela | O que faz |
| --- | --- |
| Início | O que está acontecendo agora: senha da UBS (com quantas pessoas estão na frente), agendamento no CRAS, vaga da creche (aceitar ou recusar) e atalhos |
| Direitos | Lista de direitos com o seu status; cada um mostra o que é, quem pode e uma lista de documentos para marcar |
| Lugares | UBS, CRAS e creches com o movimento atual, endereço, horário e acessibilidade |
| Perfil | Letras grandes, rever o passo a passo, restaurar dados de exemplo e sair |
| Pegar senha / Agendar | Emitem a senha ou criam o agendamento, que aparecem na hora na plataforma web. A senha só vale para quem está a até **5 km** da UBS, conferido pelo GPS (`mobile/src/utils/distancia.ts`, constante `LIMITE_KM_SENHA`); a regra é aplicada no app, não no banco |

```bash
cd mobile
npm install
npm run web      # versão no navegador (http://localhost:8081)
npm start        # Expo Go no celular (leia o QR code)
```

A camada de dados é a mesma da web (`mobile/src/services`): com `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` definidas, usa o mesmo Supabase e conversa com a web em tempo real; sem elas, usa dados de demonstração locais (que **não** são compartilhados com a web).
