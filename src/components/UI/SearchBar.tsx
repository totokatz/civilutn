import { useCarreraStore } from '../../store/useCarreraStore'

export function SearchBar() {
  const searchQuery = useCarreraStore((s) => s.searchQuery)
  const setSearchQuery = useCarreraStore((s) => s.setSearchQuery)

  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Buscar materia..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-9 pr-8 py-2 text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-200 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
      />
      {searchQuery && (
        <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          ✕
        </button>
      )}
    </div>
  )
}
