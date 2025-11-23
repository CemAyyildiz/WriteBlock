export default function StatsGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-navy-500 to-navy-700 shadow-lg group-hover:shadow-navy-500/50 transition-shadow">
            <span className="text-2xl">⛓️</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Blockchain</div>
            <div className="font-bold text-xl text-navy-700 dark:text-navy-300">Sui Network</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
            <span className="text-2xl">🐋</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Storage</div>
            <div className="font-bold text-xl text-navy-700 dark:text-navy-300">Walrus</div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 group hover:scale-105 transition-transform duration-300">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-neon-green to-neon-cyan shadow-lg group-hover:shadow-neon-green/50 transition-shadow">
            <span className="text-2xl">✍️</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Authors</div>
            <div className="font-bold text-xl text-navy-700 dark:text-navy-300">2 Writers</div>
          </div>
        </div>
      </div>
    </div>
  );
}

