'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function ContactPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 🔒 Anti-liens basique mais efficace
  const containsLink = (text: string) => {
    const linkRegex = /(https?:\/\/|www\.|<a\s|mailto:)/gi;
    return linkRegex.test(text);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData) as {
      name: string;
      email: string;
      message: string;
    };

    // 🛑 Validations simples
    if (containsLink(data.message)) {
      setStatus('error');
      setErrorMsg("Les liens ne sont pas autorisés dans le message.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) throw new Error();

      setStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error("Submission error:", err);
      setStatus('error');
      setErrorMsg("Impossible d'envoyer le message");
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4
            bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Contactez-moi
          </h1>

          <p className="text-gray-400 text-lg">
            Offre, collaboration ou simple avis — je vous répondrai rapidement.
          </p>
        </div>

        {/* Form */}
        <section className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Votre nom
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Tom"
                  className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl
                  focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Votre email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="tom@email.com"
                  className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl
                  focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Message
              </label>
              <textarea
                name="message"
                rows={6}
                required
                placeholder="Décrivez votre besoin (sans liens svp 😉)"
                className="w-full p-4 bg-slate-800/50 border border-slate-700 rounded-xl
                focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-600"
              />
            </div>

            <button
              disabled={status === 'loading'}
              className={`w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2
              ${
                status === 'loading'
                  ? 'bg-gray-700 cursor-not-allowed'
                  : status === 'success'
                  ? 'bg-green-600 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
              }`}
            >
              {status === 'loading' ? (
                <>
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi…
                </>
              ) : status === 'success' ? (
                'Message envoyé'
              ) : (
                'Envoyer le message'
              )}
            </button>

            {/* Feedback */}
            {status === 'success' && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl
              text-green-400 text-center font-medium">
                ✅ Votre message a bien été envoyé. Merci !
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl
              text-red-400 text-center font-medium">
                ❌ {errorMsg}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
