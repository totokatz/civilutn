import { useCarreraStore } from '../../store/useCarreraStore'
import { Sidebar } from './Sidebar'
import { MapArea } from './MapArea'

export function AppShell() {
  const darkMode = useCarreraStore((s) => s.darkMode)
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex h-screen bg-gray-50 dark:bg-[#1a1a2e] transition-colors duration-300">
        <Sidebar />
        <MapArea />
      </div>
    </div>
  )
}
