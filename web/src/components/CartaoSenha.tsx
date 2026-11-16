import type { ReactNode } from 'react'
import { MOTIVOS, ORIGENS, ICONE_PRIORIDADE } from '../theme/rotulos'
import { STATUS_SENHA } from '../theme/status'
import type { Senha } from '../types'
import { SeloStatus } from './SeloStatus'

/** Cartão de uma senha em atendimento: código grande, origem, prioridade, status e ações. */
export function CartaoSenha({ senha, acoes, destaque = false }: { senha: Senha; acoes?: ReactNode; destaque?: boolean }) {
  const motivo = MOTIVOS[senha.motivo]
  const origem = ORIGENS[senha.origem]
  return (
    <div
      className={`cartao-fofo flex flex-wrap items-center gap-x-6 gap-y-3 p-5 transition-colors duration-300 ${destaque ? 'ring-2 ring-accent' : ''}`}
      style={destaque ? { background: 'var(--destaque-novo)' } : undefined}
    >
      <p className="min-w-[5.5rem] text-4xl font-semibold tabular-nums tracking-tight" aria-label={`Senha ${senha.codigo}`}>
        {senha.codigo}
      </p>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <motivo.Icone aria-hidden="true" size={18} />
            {motivo.rotulo}
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted">
            <origem.Icone aria-hidden="true" size={18} />
            {origem.rotulo}
          </span>
          {senha.prioridade && (
            <span className="inline-flex items-center gap-1.5 text-[var(--status-chamada)]">
              <ICONE_PRIORIDADE aria-hidden="true" size={18} />
              Prioridade
            </span>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <SeloStatus status={STATUS_SENHA[senha.status]} />
          {senha.guiche && <span className="font-semibold">Guichê {senha.guiche}</span>}
        </div>
      </div>
      {acoes && <div className="flex flex-wrap gap-2">{acoes}</div>}
    </div>
  )
}
