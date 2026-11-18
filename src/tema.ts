import { useEffect, useState } from 'react'

const QUERY_SCURO = '(prefers-color-scheme: dark)'

// Segue la preferenza chiaro/scuro del sistema e si aggiorna se l'utente la cambia.
// Nota: il nome deve iniziare con "use" perché React lo riconosca come hook.
export function useTemaScuro(): boolean {
  const [scuro, setScuro] = useState(() => window.matchMedia(QUERY_SCURO).matches)

  useEffect(() => {
    const query = window.matchMedia(QUERY_SCURO)

    function cambia(evento: MediaQueryListEvent): void {
      setScuro(evento.matches)
    }

    query.addEventListener('change', cambia)
    return () => query.removeEventListener('change', cambia)
  }, [])

  return scuro
}
