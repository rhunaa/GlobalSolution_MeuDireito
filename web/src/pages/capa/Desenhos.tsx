/**
 * Desenhos planos da capa, feitos para o Meu Direito (SVG próprio).
 * São decorativos: o texto ao lado de cada um explica a ideia.
 */

const PELE = { clara: '#f2c9a5', media: '#c68a62', escura: '#8d5a3b' }
const CABELO = { escuro: '#2b1d17', castanho: '#5a3a24', grisalho: '#d9dde0' }
const ACCENT = '#1b2a4a'
const CALCA = '#2f3e5c'
const SAPATO = '#1a2328'

function Sombra({ cx = 120, cy = 264, rx = 70 }: { cx?: number; cy?: number; rx?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="8" fill="#000000" opacity="0.12" />
}

/** Cidadã usando o app: celular na mão e a senha aparecendo na tela. */
export function CidadaComCelular({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 280" className={className} aria-hidden="true" focusable="false">
      <Sombra cx={125} />
      {/* pernas e sapatos */}
      <rect x="98" y="168" width="22" height="88" rx="9" fill={CALCA} />
      <rect x="128" y="168" width="22" height="88" rx="9" fill="#3b4c70" />
      <path d="M92 252h32a4 4 0 0 1 4 4v4H88v-4a4 4 0 0 1 4-4Z" fill={SAPATO} />
      <path d="M124 252h32a4 4 0 0 1 4 4v4h-40v-4a4 4 0 0 1 4-4Z" fill={SAPATO} />
      {/* corpo */}
      <path d="M82 104q42-18 84 0l8 76q-50 12-100 0Z" fill={ACCENT} />
      <path d="M118 96h12v84h-12Z" fill="#ffffff" opacity="0.25" />
      {/* braço esquerdo caído */}
      <path d="M86 108 70 168q-3 12 8 14t14-10l8-50Z" fill="#121d36" />
      <circle cx="82" cy="184" r="9" fill={PELE.media} />
      {/* braço direito erguido com celular */}
      <path d="M162 108l32 36q8 10-2 18t-18-4l-30-34Z" fill="#121d36" />
      <circle cx="194" cy="150" r="9" fill={PELE.media} />
      <g transform="rotate(-12 205 118)">
        <rect x="186" y="82" width="40" height="70" rx="8" fill="#1a2328" />
        <rect x="190" y="90" width="32" height="54" rx="4" fill="#e3eafb" />
        <rect x="194" y="96" width="24" height="9" rx="3" fill="#9db4e8" />
        <text x="206" y="124" textAnchor="middle" fontSize="11" fontWeight="800" fill="#1b2a4a">C023</text>
        <rect x="196" y="130" width="20" height="6" rx="3" fill="#1b2a4a" opacity="0.35" />
      </g>
      {/* cabeça */}
      <rect x="112" y="78" width="16" height="16" rx="6" fill={PELE.media} />
      <circle cx="120" cy="62" r="27" fill={PELE.media} />
      <path d="M93 62c-6-30 16-42 38-38 20 4 26 26 20 46-6-10-10-22-26-26-12 10-22 14-32 18Z" fill={CABELO.escuro} />
      <path d="M93 62c-4 24 0 44 12 56-12-4-22-24-20-44Z" fill={CABELO.escuro} />
      <circle cx="111" cy="66" r="2.4" fill="#1a2328" />
      <circle cx="131" cy="66" r="2.4" fill="#1a2328" />
      <path d="M113 77q7 6 14 0" fill="none" stroke="#1a2328" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

/** Recepcionista da UBS, atrás do balcão, com o telão chamando a senha. */
export function AtendenteNoBalcao({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 260" className={className} aria-hidden="true" focusable="false">
      <Sombra cx={150} cy={248} rx={120} />
      {/* telão */}
      <rect x="170" y="14" width="116" height="78" rx="9" fill="#04161b" />
      <rect x="177" y="21" width="102" height="64" rx="5" fill="#0b2c36" />
      <text x="228" y="62" textAnchor="middle" fontSize="30" fontWeight="800" fill="#ffd24d">C023</text>
      <text x="228" y="78" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">Guichê 2</text>
      <rect x="222" y="92" width="12" height="14" fill="#04161b" />
      <rect x="206" y="104" width="44" height="6" rx="3" fill="#04161b" />
      {/* pessoa */}
      <path d="M60 130q38-16 76 0l6 70H54Z" fill="#1c7445" />
      <path d="M92 120h12l-6 26Z" fill="#ffffff" opacity="0.5" />
      <rect x="90" y="96" width="16" height="16" rx="6" fill={PELE.clara} />
      <circle cx="98" cy="82" r="26" fill={PELE.clara} />
      <path d="M72 84c-8-34 18-46 38-40 22 6 24 30 18 42-8-14-22-18-34-18-8 8-14 14-22 16Z" fill={CABELO.castanho} />
      <path d="M72 84c-4 18-2 34 8 44-14-6-20-26-8-44Z" fill={CABELO.castanho} />
      <circle cx="90" cy="86" r="2.4" fill="#1a2328" />
      <circle cx="110" cy="86" r="2.4" fill="#1a2328" />
      <path d="M92 97q6 5 12 0" fill="none" stroke="#1a2328" strokeWidth="2.4" strokeLinecap="round" />
      {/* braço apontando para o telão */}
      <path d="M130 140l50-36q8-5 13 3t-3 14l-44 32Z" fill="#14603a" />
      <circle cx="194" cy="108" r="8" fill={PELE.clara} />
      {/* balcão */}
      <rect x="20" y="170" width="190" height="78" rx="10" fill="#2b4f5c" />
      <rect x="14" y="160" width="202" height="16" rx="8" fill="#9db4e8" />
      <rect x="38" y="136" width="46" height="26" rx="4" fill="#1a2328" />
      <rect x="42" y="140" width="38" height="18" rx="2" fill="#e3eafb" />
      <rect x="55" y="162" width="12" height="4" fill="#1a2328" />
      {/* cruz da saúde no balcão */}
      <g transform="translate(150 200)">
        <rect x="-4" y="-16" width="8" height="32" rx="2" fill="#ffffff" opacity="0.9" />
        <rect x="-16" y="-4" width="32" height="8" rx="2" fill="#ffffff" opacity="0.9" />
      </g>
    </svg>
  )
}

/** Mãe e criança: a vaga da creche chegando pelo celular. */
export function MaeComCrianca({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 280" className={className} aria-hidden="true" focusable="false">
      <Sombra cx={140} rx={100} />
      {/* mãe */}
      <rect x="86" y="170" width="20" height="86" rx="9" fill="#4a3a63" />
      <rect x="112" y="170" width="20" height="86" rx="9" fill="#5a4878" />
      <path d="M80 252h30a4 4 0 0 1 4 4v4H76v-4a4 4 0 0 1 4-4Z" fill={SAPATO} />
      <path d="M110 252h30a4 4 0 0 1 4 4v4h-38v-4a4 4 0 0 1 4-4Z" fill={SAPATO} />
      <path d="M68 108q40-18 80 0l8 74q-48 12-96 0Z" fill="#d9558c" />
      <rect x="100" y="86" width="16" height="16" rx="6" fill={PELE.escura} />
      <circle cx="108" cy="70" r="26" fill={PELE.escura} />
      <path d="M82 70c-10-32 16-46 38-40 22 6 24 28 18 44-6-12-20-18-30-18-10 6-18 12-26 14Z" fill={CABELO.escuro} />
      <circle cx="92" cy="86" r="22" fill={CABELO.escuro} opacity="0" />
      <circle cx="99" cy="73" r="2.4" fill="#1a2328" />
      <circle cx="118" cy="73" r="2.4" fill="#1a2328" />
      <path d="M101 84q7 6 14 0" fill="none" stroke="#1a2328" strokeWidth="2.4" strokeLinecap="round" />
      {/* braço dela dando a mão à criança */}
      <path d="M142 116l32 54q5 10-4 14t-15-5l-30-48Z" fill="#c24578" />
      <circle cx="170" cy="188" r="8" fill={PELE.escura} />
      {/* criança */}
      <rect x="180" y="206" width="14" height="48" rx="6" fill="#3b4c70" />
      <rect x="198" y="206" width="14" height="48" rx="6" fill="#4a5c82" />
      <path d="M176 250h22a3 3 0 0 1 3 3v5h-28v-5a3 3 0 0 1 3-3Z" fill={SAPATO} />
      <path d="M196 250h22a3 3 0 0 1 3 3v5h-28v-5a3 3 0 0 1 3-3Z" fill={SAPATO} />
      <path d="M170 168q26-12 52 0l6 44q-32 10-64 0Z" fill="#f5c065" />
      <circle cx="196" cy="150" r="20" fill={PELE.escura} />
      <circle cx="180" cy="142" r="9" fill={CABELO.escuro} />
      <circle cx="212" cy="142" r="9" fill={CABELO.escuro} />
      <path d="M178 140q18-18 36 0-6-4-18-4t-18 4Z" fill={CABELO.escuro} />
      <circle cx="190" cy="152" r="2" fill="#1a2328" />
      <circle cx="204" cy="152" r="2" fill="#1a2328" />
      <path d="M191 160q5 4 10 0" fill="none" stroke="#1a2328" strokeWidth="2" strokeLinecap="round" />
      <path d="M222 176l26 -10" stroke={PELE.escura} strokeWidth="9" strokeLinecap="round" />
      {/* balão: vaga aberta */}
      <g>
        <rect x="150" y="20" width="118" height="52" rx="14" fill="#ffffff" />
        <path d="M184 72l-8 16 22-16Z" fill="#ffffff" />
        <circle cx="172" cy="46" r="11" fill="#e1f1e7" />
        <path d="m166 46 4 4 8-9" fill="none" stroke="#1c7445" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="190" y="43" fontSize="11" fontWeight="800" fill="#1a2328">Vaga aberta!</text>
        <text x="190" y="58" fontSize="9" fontWeight="600" fill="#4f5d63">Responda em 48 h</text>
      </g>
    </svg>
  )
}

/** Pessoa chegando ao destino: segura um mapa e há uma bandeira. */
export function PessoaComMapa({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 280" className={className} aria-hidden="true" focusable="false">
      <Sombra cx={150} rx={120} />
      {/* folhas */}
      <path d="M20 262c4-34 20-52 44-56-2 26-14 46-44 56Z" fill="#6fcf97" />
      <path d="M52 262c-2-26 8-44 28-54 4 24-6 44-28 54Z" fill="#1c7445" />
      <path d="M262 262c-4-30-18-46-40-50 2 24 12 42 40 50Z" fill="#f0a07a" />
      {/* bandeira */}
      <rect x="246" y="48" width="5" height="214" rx="2.5" fill="#1a2328" />
      <path d="M251 52h34l-8 18 8 18h-34Z" fill="#f28db7" />
      <path d="M251 88h30l-7 14 7 14h-30Z" fill="#f5c065" />
      {/* pessoa */}
      <rect x="112" y="178" width="22" height="78" rx="9" fill={CALCA} />
      <rect x="140" y="178" width="22" height="78" rx="9" fill="#3b4c70" />
      <path d="M106 252h32a4 4 0 0 1 4 4v4h-40v-4a4 4 0 0 1 4-4Z" fill={SAPATO} />
      <path d="M138 252h32a4 4 0 0 1 4 4v4h-40v-4a4 4 0 0 1 4-4Z" fill={SAPATO} />
      <path d="M96 114q42-18 84 0l8 72q-50 12-100 0Z" fill="#f0a07a" />
      <rect x="130" y="92" width="16" height="16" rx="6" fill={PELE.clara} />
      <circle cx="138" cy="76" r="27" fill={PELE.clara} />
      <path d="M111 76c-6-32 16-44 38-40 22 4 28 28 20 46-6-12-12-22-28-24-12 8-20 14-30 18Z" fill={CABELO.grisalho} />
      <circle cx="129" cy="80" r="2.4" fill="#1a2328" />
      <circle cx="149" cy="80" r="2.4" fill="#1a2328" />
      <path d="M131 91q7 6 14 0" fill="none" stroke="#1a2328" strokeWidth="2.4" strokeLinecap="round" />
      {/* braços segurando o mapa */}
      <path d="M100 122 70 160q-6 12 6 16t16-8l30-36Z" fill="#d9783a" />
      <path d="M176 122l32 38q6 10-6 14t-14-6l-30-36Z" fill="#d9783a" />
      <g transform="rotate(-6 138 168)">
        <rect x="62" y="136" width="152" height="86" rx="6" fill="#ffffff" />
        <rect x="62" y="136" width="152" height="86" rx="6" fill="none" stroke="#d6cfc2" strokeWidth="2" />
        <path d="M76 204 100 176 118 192 144 160 172 196 200 168" fill="none" stroke="#1b2a4a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 8" />
        <circle cx="76" cy="204" r="6" fill="#6fcf97" />
        <path d="M200 140c-7 0-11 5-11 11 0 8 11 18 11 18s11-10 11-18c0-6-4-11-11-11Z" fill="#a3305f" />
        <circle cx="200" cy="151" r="4" fill="#ffffff" />
      </g>
      <circle cx="82" cy="170" r="8" fill={PELE.clara} />
      <circle cx="196" cy="172" r="8" fill={PELE.clara} />
    </svg>
  )
}

/** Trilha pontilhada que liga as partes da página (decorativa). */
export function TrilhaPontilhada({ className = '', d }: { className?: string; d: string }) {
  return (
    <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="var(--capa-trilha)" strokeWidth="4" strokeLinecap="round" strokeDasharray="1 14" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
