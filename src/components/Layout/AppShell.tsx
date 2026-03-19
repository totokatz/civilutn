import { TopBar } from './TopBar'
import { MapArea } from './MapArea'

export function AppShell() {
  return (
    <div className="flex flex-col h-screen bg-background bg-grid">
      <TopBar />
      <MapArea />
    </div>
  )
}
