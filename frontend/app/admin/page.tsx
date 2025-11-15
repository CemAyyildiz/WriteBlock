'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { MOCK_AUTHORS, MOCK_ADDRESSES, simulateSuiTransaction } from '@/lib/mockData';
import { Author } from '@/types';

export default function AdminPage() {
  const [authors, setAuthors] = useState<Author[]>(MOCK_AUTHORS);
  const [newAuthorAddress, setNewAuthorAddress] = useState('');
  const [newAuthorName, setNewAuthorName] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [grantSuccess, setGrantSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const validateAddress = (address: string) => {
    return address.startsWith('0x') && address.length === 66;
  };

  const handleGrantCapability = async () => {
    if (!newAuthorAddress || !newAuthorName) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    if (!validateAddress(newAuthorAddress)) {
      alert('Geçersiz Sui adresi formatı. Adres 0x ile başlamalı ve 66 karakter uzunluğunda olmalıdır.');
      return;
    }

    // Check if already exists
    if (authors.some(a => a.address.toLowerCase() === newAuthorAddress.toLowerCase())) {
      alert('Bu adres zaten yazar yetkisine sahip');
      return;
    }

    setIsGranting(true);
    setGrantSuccess(false);

    try {
      // Simulate Sui transaction
      const txResult = await simulateSuiTransaction('grant_author_capability', 1200);
      
      // Add new author to list
      const newAuthor: Author = {
        address: newAuthorAddress,
        name: newAuthorName,
        granted_at: Date.now(),
      };
      
      setAuthors([...authors, newAuthor]);
      setTxHash(txResult.txHash);
      setGrantSuccess(true);
      
      // Clear form
      setNewAuthorAddress('');
      setNewAuthorName('');
      
      // Auto-hide success message
      setTimeout(() => setGrantSuccess(false), 5000);
    } catch (error) {
      console.error('Grant error:', error);
    } finally {
      setIsGranting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>👑</span>
            <span>Yönetici Görünümü</span>
            <span className="mx-2">•</span>
            <span>Admin Capability Gerekli</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Yazar Yönetimi
            </h1>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                ✓ Admin
              </div>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl shadow-md border border-purple-200 dark:border-purple-800 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
              <div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Admin Adresi
                </div>
                <div className="font-mono text-sm text-gray-900 dark:text-white font-medium">
                  {formatAddress(MOCK_ADDRESSES.admin)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-600 dark:text-purple-400">
                Yetki Durumu
              </div>
              <div className="font-semibold text-purple-700 dark:text-purple-300">
                Admin_Capability ✓
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Grant Author Capability Form */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-5 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Yeni Yazar Ekle
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Author_Capability yetkisi ver
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yazar İsmi
                </label>
                <input
                  type="text"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="Örn: Alice Writer"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sui Wallet Adresi
                </label>
                <input
                  type="text"
                  value={newAuthorAddress}
                  onChange={(e) => setNewAuthorAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm dark:bg-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  66 karakter uzunluğunda, 0x ile başlayan geçerli bir Sui adresi
                </p>
              </div>

              <button
                onClick={handleGrantCapability}
                disabled={isGranting || !newAuthorAddress || !newAuthorName}
                className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {isGranting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Yetkilendiriliyor...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Yazar Yetkisi Ver</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Nasıl Çalışır?
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span>1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Admin Capability Kontrolü
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sadece Admin_Capability sahibi bu işlemi yapabilir
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span>2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Author_Capability Mint
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Yeni bir Author_Capability nesnesi oluşturulur
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span>3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Transfer İşlemi
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Capability, belirtilen adrese transfer edilir
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  <strong>Önemli:</strong> Author_Capability kopyalanamaz ve yok edilemez (non-copyable, non-droppable). Bu, yetki sisteminin güvenliğini sağlar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {grantSuccess && txHash && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 dark:text-green-300 mb-2">
                  Yazar Yetkisi Başarıyla Verildi!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                  Author_Capability oluşturuldu ve belirlenen adrese transfer edildi.
                </p>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Sui Transaction Hash
                  </div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
                    {txHash}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Authors List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Yetkili Yazarlar
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Author_Capability sahibi kullanıcılar
                </p>
              </div>
              <div className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                {authors.length} Yazar
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {authors.map((author, index) => (
              <div key={author.address} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-xl">✍️</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {author.name}
                      </h3>
                      <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {formatAddress(author.address)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Yetki Verilme Tarihi
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(author.granted_at)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

