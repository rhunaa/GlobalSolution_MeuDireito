import { Select } from 'antd'
import { useId } from 'react'

export interface Opcao {
  id: string
  texto: string
}

interface Props {
  rotulo: string
  opcoes: Opcao[]
  valor: string | null
  aoMudar: (id: string | null) => void
  placeholder?: string
  descricao?: string
  desabilitado?: boolean
}

/** Select do Ant Design com rótulo visível ligado ao campo. */
export function CampoSelecao({ rotulo, opcoes, valor, aoMudar, placeholder = 'Escolha uma opção', descricao, desabilitado }: Props) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-semibold">
        {rotulo}
      </label>
      <Select
      getPopupContainer={(no) => no.parentElement ?? document.body}
        id={id}
        size="large"
        className="w-full"
        showSearch={{ optionFilterProp: 'label' }}
        placeholder={placeholder}
        value={valor ?? undefined}
        onChange={(v) => aoMudar((v as string | undefined) ?? null)}
        disabled={desabilitado}
        options={opcoes.map((o) => ({ value: o.id, label: o.texto }))}
        notFoundContent="Nada encontrado"
      />
      {descricao && <p className="text-sm text-muted">{descricao}</p>}
    </div>
  )
}
