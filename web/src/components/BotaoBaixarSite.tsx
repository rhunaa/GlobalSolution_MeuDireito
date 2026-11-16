import { Button, Modal } from 'antd'
import { Download } from 'lucide-react'
import { useState } from 'react'
import { detectarPlataforma, useInstalarSite, type Plataforma } from '../hooks/useInstalarSite'

const PASSOS: Record<Plataforma, { titulo: string; passos: string[] }> = {
  ios: {
    titulo: 'No iPhone ou iPad (Safari)',
    passos: ['Toque no botão Compartilhar (o quadrado com uma seta para cima).', 'Escolha “Adicionar à Tela de Início”.', 'Toque em “Adicionar”.'],
  },
  android: {
    titulo: 'No Android (Chrome)',
    passos: ['Toque no menu ⋮ do navegador.', 'Escolha “Instalar app” ou “Adicionar à tela inicial”.', 'Confirme.'],
  },
  'safari-mac': {
    titulo: 'No Safari do Mac',
    passos: ['No menu Arquivo, escolha “Adicionar ao Dock”.', 'Confirme o nome “Meu Direito”.'],
  },
  firefox: {
    titulo: 'No Firefox',
    passos: ['O Firefox no computador não instala sites como app.', 'Abra esta página no Chrome ou no Edge e use o botão de novo.'],
  },
  desktop: {
    titulo: 'No Chrome ou no Edge',
    passos: ['Clique no ícone de instalar, no fim da barra de endereço.', 'Se não aparecer, abra o menu ⋮ e escolha “Instalar Meu Direito”.', 'Confirme.'],
  },
}

/** Botão "Baixar site": instala o site como app. Sem suporte direto, mostra o passo a passo do navegador. */
export function BotaoBaixarSite() {
  const { instalado, instalar } = useInstalarSite()
  const [aberto, setAberto] = useState(false)
  if (instalado) return null // dentro do app instalado o botão não faz sentido

  const { titulo, passos } = PASSOS[detectarPlataforma()]

  async function aoClicar() {
    const resultado = await instalar()
    if (resultado === 'indisponivel') setAberto(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={aoClicar}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border-2 border-[var(--field-border)] px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-[var(--surface-secondary)]"
      >
        <Download aria-hidden="true" size={16} />
        Baixar site
      </button>

      <Modal
        open={aberto}
        onCancel={() => setAberto(false)}
        title="Baixar o site no seu aparelho"
        centered
        footer={
          <Button type="primary" onClick={() => setAberto(false)}>
            Entendi
          </Button>
        }
      >
        <p className="mb-3 text-muted">Assim o Meu Direito abre como um app, direto da tela do seu aparelho.</p>
        <h3 className="mb-2 font-semibold">{titulo}</h3>
        <ol className="list-decimal space-y-2 ps-5">
          {passos.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      </Modal>
    </>
  )
}
