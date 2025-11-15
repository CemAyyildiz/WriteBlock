import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-2xl mb-6 shadow-lg">
            <span className="text-white font-bold text-4xl">W</span>
          </div>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
            WriteBlock
          </h1>
          <p className="text-2xl text-gray-600 dark:text-gray-300 mb-2">
            Merkeziyetsiz İçerik Yönetim Sistemi
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Sui Blockchain + Walrus Storage
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Link
            href="/viewer"
            className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:scale-105"
          >
            <div className="text-5xl mb-4">📖</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Okuma Görünümü
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Herhangi bir kullanıcı sayfa içeriğini görüntüleyebilir.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>✓ Markdown → HTML dönüşümü</li>
              <li>✓ Versiyon bilgisi görüntüleme</li>
              <li>✓ Yazar adresi doğrulama</li>
            </ul>
            <div className="mt-4 text-primary-600 group-hover:text-primary-700 font-medium">
              Görüntüle →
            </div>
          </Link>

          <Link
            href="/author"
            className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:scale-105"
          >
            <div className="text-5xl mb-4">✍️</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Yazma Görünümü
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Yetkili yazarlar için Markdown editörü.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>✓ Canlı Markdown editörü</li>
              <li>✓ Walrus BLOB ID simülasyonu</li>
              <li>✓ Sui işlem onayı</li>
            </ul>
            <div className="mt-4 text-primary-600 group-hover:text-primary-700 font-medium">
              Düzenle →
            </div>
          </Link>

          <Link
            href="/admin"
            className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:scale-105"
          >
            <div className="text-5xl mb-4">👑</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Yönetici Görünümü
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Admin yetkisi ile yazar yönetimi.
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
              <li>✓ Yazar yetkilendirme</li>
              <li>✓ Capability kontrolü</li>
              <li>✓ Yazar listesi görüntüleme</li>
            </ul>
            <div className="mt-4 text-primary-600 group-hover:text-primary-700 font-medium">
              Yönet →
            </div>
          </Link>
        </div>

        {/* Architecture Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            🏗️ Sistem Mimarisi
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-primary-100 dark:bg-primary-900 rounded-xl p-6 mb-3">
                <div className="text-3xl mb-2">⛓️</div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                  Sui Blockchain
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Metadata ve yetki yönetimi
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-xl p-6 mb-3">
                <div className="text-3xl mb-2">🐋</div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                  Walrus Storage
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kalıcı içerik depolama
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 rounded-xl p-6 mb-3">
                <div className="text-3xl mb-2">🎨</div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                  Frontend (Bu Uygulama)
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Modern kullanıcı arayüzü
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Bu demo, WriteBlock'un UI/UX akışını göstermek için mock data kullanır.
          </p>
          <p className="text-sm mt-2">
            Gerçek uygulamada Sui cüzdanı ve Walrus bağlantısı gerekir.
          </p>
        </div>
      </div>
    </div>
  );
}

