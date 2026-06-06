'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [tab, setTab] = useState<'login' | 'signup'>(
    params.get('tab') === 'signup' ? 'signup' : 'login'
  )
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/dashboard')
    })
  }, [])

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (tab === 'login') {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email, password: form.password
      })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setError('Confirme seu e-mail para ativar a conta!')
      setLoading(false)
    }
  }

  const field = (icon: React.ReactNode, placeholder: string, key: keyof typeof form, type = 'text') => (
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>
      <input
        type={key === 'password' ? (showPass ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        required
        className="w-full glass rounded-xl pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-500 border border-white/10 transition-colors"
      />
      {key === 'password' && (
        <button type="button" onClick={() => setShowPass(!showPass)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  )

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(61,110,245,0.1),transparent)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-xl mb-6">
            <BookOpen className="w-6 h-6 text-brand-400" strokeWidth={1.5} />
            <span className="text-gradient">LearnHub</span>
          </Link>
          <h1 className="font-display font-bold text-2xl text-white">
            {tab === 'login' ? 'Boas-vindas de volta' : 'Crie sua conta'}
          </h1>
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex glass rounded-xl p-1 mb-6">
            {(['login', 'signup'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 text-sm rounded-lg font-medium transition-all duration-200 ${
                  tab === t ? 'bg-brand-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                }`}>
                {t === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            {tab === 'signup' && field(<User className="w-4 h-4" />, 'Seu nome completo', 'name')}
            {field(<Mail className="w-4 h-4" />, 'Seu e-mail', 'email', 'email')}
            {field(<Lock className="w-4 h-4" />, 'Sua senha', 'password', 'password')}

            {error && (
              <p className={`text-sm text-center px-4 py-3 rounded-lg ${
                error.includes('Confirme') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl transition-colors mt-2">
              {loading ? 'Aguarde...' : tab === 'login' ? 'Entrar na conta' : 'Criar conta grátis'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/30 mt-6">
          <Link href="/" className="hover:text-white transition-colors">← Voltar para o início</Link>
        </p>
      </div>
    </main>
  )
}
