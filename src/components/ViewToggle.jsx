export default function ViewToggle({ view, onChange }) {
    return (
      <div className="flex justify-end mb-4 gap-2">
        <button
          onClick={() => onChange('grid')}
          className={`px-3 py-1 rounded ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          🟦 Grilla
        </button>
        <button
          onClick={() => onChange('list')}
          className={`px-3 py-1 rounded ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
        >
          📄 Lista
        </button>
      </div>
    );
  }
  