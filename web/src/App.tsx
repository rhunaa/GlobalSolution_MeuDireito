import { RouterProvider } from 'react-router'
import { SessaoProvider } from './hooks/useSessao'
import { TemaProvider } from './theme/TemaProvider'
import { router } from './routes/router'

export default function App() {
  return (
    <TemaProvider>
      <SessaoProvider>
        <RouterProvider router={router} />
      </SessaoProvider>
    </TemaProvider>
  )
}
