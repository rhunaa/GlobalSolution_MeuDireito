# Movimento (animações)

Regra geral: cada animação tem uma função, dura de 200 a 300 ms, é calma e nunca alarmante.
Biblioteca: [`motion`](https://motion.dev) (Framer Motion) para entrada, saída e reordenação; CSS para trocas de cor.

## Preferência "reduzir movimento"

Com `prefers-reduced-motion: reduce` todas as animações viram troca simples de estado:

- `MotionConfig reducedMotion="user"` em `LayoutOperacional`, `Telao` e `Publico`: o `motion` desliga transformações (posição, escala) e mantém só o que não é movimento.
- `src/index.css`: regra global que zera `animation-duration` e `transition-duration` (e o giro do indicador de conexão usa `motion-safe:`).
- `TemaProvider` liga o token `motion: false` do Ant Design (sem ondas nem transições nos componentes).
- Os destaques continuam existindo, só que parados: o fundo de destaque e o selo de texto ("Nova", "Novo", "Respondeu agora", "Chamando agora") seguem aparecendo pelo mesmo tempo. A informação não se perde.

## Lista

| # | Animação | Onde | Duração | Função |
| --- | --- | --- | --- | --- |
| 1 | A senha chamada sai da lista e as demais **sobem** suavemente | `pages/ubs/Fila.tsx` (linhas da tabela e cartões "em andamento"): `AnimatePresence` + `layout="position"`, saída `opacity 0` e `x -24` | 250 ms, `easeOut` | Mostrar o efeito do clique em "Chamar próximo" |
| 2 | **Novo item vindo do app** entra com destaque por alguns segundos | `hooks/useRealtimeLista.ts` calcula `novos` (6 s). Fila, agenda e lista da creche pintam o fundo `--destaque-novo` (transição de cor 300 ms) e mostram o selo "Nova" / "Novo"; entrada `opacity 0→1`, `y 10→0` (250 ms) | 6 s de destaque | Mostrar que algo chegou |
| 3 | **Resposta da família** (creche) | `hooks/useRealtimeCreche.ts` + `pages/creche/Lista.tsx`: linha em destaque por 8 s, selo "Respondeu agora" e faixa com `aria-live` | 8 s | Mostrar que a resposta chegou do app |
| 4 | **Telão: nova senha** entra com destaque | `pages/Telao.tsx`: `scale 0.85→1` e `opacity 0→1` (300 ms), borda amarela e texto "Chamando agora" por 8 s | 300 ms + 8 s | Chamar a atenção na sala de espera |
| 5 | **Mudança de status**: o selo troca com transição curta | `components/SeloStatus.tsx`: `AnimatePresence mode="popLayout"`, `y ±6` e `opacity` | 200 ms | Mostrar mudança de estado |
| 6 | **Troca de página** | `components/layout/LayoutOperacional.tsx`: `opacity 0→1` e `y 8→0` (entrada), `opacity→0` (saída), `mode="wait"` | 200 ms | Orientar a navegação |
| 7 | **Senha emitida no balcão** | `pages/ubs/Balcao.tsx`: `scale 0.96→1` e `opacity` | 250 ms | Confirmar que a senha foi gerada |
| 8 | **Microinteração de confirmação** em botões e ações | Estado `loading` dos botões (Ant Design) enquanto a ação roda, mais a faixa verde com `role="status"` ("Senha R003 chamada no guichê 1.") | – | Confirmar a ação |
| 9 | Indicador de conexão girando | `components/IndicadorConexao.tsx`: ícone gira só em "Conectando…" e "Reconectando…" (`motion-safe:animate-spin`) | contínuo, só enquanto reconecta | Mostrar que o sistema está tentando voltar |

Na capa (`pages/Capa.tsx`) a abertura é uma sequência de entrada que termina em cerca de 2 segundos. Depois disso nada fica se mexendo (por isso não é preciso botão de pausar):

| Elemento | Animação | Tempo |
| --- | --- | --- |
| Cabeçalho | desce e aparece | 400 ms |
| Manchas de cor ao fundo | crescem e aparecem | 1,2 s |
| Título | cada palavra sobe e aparece, uma após a outra (intervalo de 70 ms) | 400 ms por palavra |
| Caixa "o caminho" | salta com mola, de `rotate -10°` para `-1°` | mola |
| Personagens | entram com mola (escala 0,3→1, sobem 40 px, giram para zero), em sequência | mola, a partir de 0,55 s |
| Cruz, aro e bolinhas | surgem com mola, depois dos personagens | mola, a partir de 0,9 s |
| Avião de papel | chega voando de baixo e da esquerda | 1 s |
| Frase de apoio | sobe e aparece | 500 ms, em 1,25 s |
| Personagens ao passar o mouse | aumentam 8% e inclinam 4° (no celular, ao tocar) | mola |

Com `prefers-reduced-motion`, o `MotionConfig` desliga as transformações (subir, escalar, girar, voar): os elementos aparecem direto e só o fade permanece. As demais seções da capa não têm animação.

## Constantes

- Curva padrão: `easeOut` (ou `cubic-bezier(0.32, 0.72, 0, 1)`, `--curva-padrao`).
- Durações em `tokens.css`: `--duracao-rapida` 200 ms, `--duracao-media` 250 ms, `--duracao-lenta` 300 ms.

## Como testar

Chrome/Edge DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". Com ela ligada, a fila não desliza, o telão não dá zoom e os selos trocam sem transição; os destaques seguem visíveis como cor e texto.
