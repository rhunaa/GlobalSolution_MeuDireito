import { AnimatePresence, motion } from 'motion/react'
import { CLASSES_TOM, type VisualStatus } from '../theme/status'

interface Props {
  status: VisualStatus
  /** "lg" para o painel; "sm" para tabelas densas. */
  tamanho?: 'sm' | 'md' | 'lg'
}

const TAMANHOS = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-1 gap-1.5',
  lg: 'text-base px-3 py-1.5 gap-2',
}
const ICONE = { sm: 14, md: 16, lg: 20 }

/**
 * Selo padronizado de status: cor + ícone + texto.
 * Ao mudar o status, o selo troca com uma transição curta (200 ms).
 */
export function SeloStatus({ status, tamanho = 'md' }: Props) {
  const { rotulo, tom, Icone } = status
  return (
    <span className="inline-flex overflow-hidden rounded-md">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={rotulo}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`inline-flex items-center whitespace-nowrap rounded-md border font-semibold ${CLASSES_TOM[tom]} ${TAMANHOS[tamanho]}`}
        >
          <Icone aria-hidden="true" size={ICONE[tamanho]} />
          {rotulo}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
