import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../theme/ThemeProvider'
import ResultCard from '../components/ResultCard'

const DEFAULT_API = 'http://127.0.0.1:8000/api/v1'

const tipoContratacao = [
  { value: '', label: 'Todos' },
  { value: 'PF', label: 'PF - Pessoa Física' },
  { value: 'PJ', label: 'PJ - Pessoa Jurídica' },
  { value: 'Adesão', label: 'Adesão' }
]

const acomodacoes = [
  { value: '', label: 'Todas' },
  { value: 'Enfermaria', label: 'Enfermaria' },
  { value: 'Apartamento', label: 'Apartamento' }
]

const abrangencias = [
  { value: '', label: 'Todas' },
  { value: 'Local', label: 'Local' },
  { value: 'Regional', label: 'Regional' },
  { value: 'Nacional', label: 'Nacional' }
]

const accentPresets = {
  oceano: {
    label: 'Oceano (azul)',
    emphasis: 'text-blue-400',
    focus: 'focus:border-blue-400 focus:ring-blue-100',
    button: 'bg-blue-600 hover:bg-blue-700',
    toggle: 'bg-blue-600',
    check: 'text-blue-500 focus:ring-blue-500'
  },
  floresta: {
    label: 'Floresta (esmeralda)',
    emphasis: 'text-emerald-400',
    focus: 'focus:border-emerald-400 focus:ring-emerald-100',
    button: 'bg-emerald-600 hover:bg-emerald-700',
    toggle: 'bg-emerald-600',
    check: 'text-emerald-500 focus:ring-emerald-500'
  },
  solar: {
    label: 'Solar (âmbar)',
    emphasis: 'text-amber-400',
    focus: 'focus:border-amber-400 focus:ring-amber-100',
    button: 'bg-amber-500 hover:bg-amber-600',
    toggle: 'bg-amber-500',
    check: 'text-amber-500 focus:ring-amber-500'
  }
}

export default function QuotePage() {
  const [apiBase, setApiBase] = useState(
    () => localStorage.getItem('apiUrl') || DEFAULT_API
  )
  const [showConfig, setShowConfig] = useState(false)
  const [operadoras, setOperadoras] = useState([])
  const [loadingOperadoras, setLoadingOperadoras] = useState(false)

  const [idadesTexto, setIdadesTexto] = useState('')
  const [operadoraId, setOperadoraId] = useState('')
  const [tipo, setTipo] = useState('')
  const [acomodacao, setAcomodacao] = useState('')
  const [abrangencia, setAbrangencia] = useState('')
  const [coparticipacao, setCoparticipacao] = useState(false)
  const [elegibilidade, setElegibilidade] = useState(false)

  const { darkMode, setDarkMode } = useTheme()
  const [accent, setAccent] = useState(
    () => localStorage.getItem('accentTone') || 'oceano'
  )

  const [resultados, setResultados] = useState([])
  const [loadingCotacao, setLoadingCotacao] = useState(false)
  const [erro, setErro] = useState('')

  const accentTheme = accentPresets[accent] || accentPresets.oceano

  const theme = {
    page: darkMode ? 'text-slate-100' : 'text-slate-900',
    // Painel de filtros (mais escuro no dark, mais claro no light)
    card: darkMode
      ? 'border-slate-700 bg-slate-800/70'
      : 'border-slate-200 bg-slate-100',
    // Painel "Atenção ao cotar" (ainda mais escuro no dark, branco no light)
    panel: darkMode
      ? 'border-slate-700 bg-slate-800/70'
      : 'border-slate-200 bg-slate-100',
    title: darkMode ? 'text-slate-100' : 'text-slate-900',
    text: darkMode ? 'text-slate-200' : 'text-slate-700',
    label: darkMode ? 'text-slate-200' : 'text-slate-800',
    hint: darkMode ? 'text-slate-400' : 'text-slate-500',
    border: darkMode ? 'border-slate-700' : 'border-slate-200',
    subtle: darkMode ? 'text-slate-300' : 'text-slate-600',
    surface: darkMode
      ? 'bg-slate-900/70 border-slate-800'
      : 'bg-slate-50 border-slate-200'
  }

  const idadesNumeros = useMemo(
    () =>
      idadesTexto
        .split(',')
        .map(v => parseInt(v.trim(), 10))
        .filter(n => !Number.isNaN(n)),
    [idadesTexto]
  )

  // darkMode is now handled globally by ThemeProvider

  useEffect(() => {
    localStorage.setItem('accentTone', accent)
  }, [accent])

  useEffect(() => {
    const carregarOperadoras = async () => {
      setLoadingOperadoras(true)
      try {
        const resp = await fetch(`${apiBase}/operadoras/`)
        if (!resp.ok) throw new Error('Não foi possível carregar operadoras')
        const data = await resp.json()
        setOperadoras(data)
      } catch (e) {
        console.error(e)
        setErro('Erro ao carregar operadoras. Confira a URL do backend.')
      } finally {
        setLoadingOperadoras(false)
      }
    }

    carregarOperadoras()
  }, [apiBase])

  const fazerCotacao = async e => {
    e.preventDefault()
    setErro('')

    if (idadesNumeros.length === 0) {
      setErro('Informe pelo menos uma idade válida.')
      return
    }

    setLoadingCotacao(true)
    setResultados([])

    const payload = {
      idades: idadesNumeros,
      operadora_id: operadoraId ? parseInt(operadoraId, 10) : null,
      tipo_contratacao: tipo || null,
      acomodacao: acomodacao || null,
      abrangencia: abrangencia || null,
      coparticipacao: coparticipacao ? true : null,
      elegibilidade: elegibilidade ? true : null
    }

    try {
      const resp = await fetch(`${apiBase}/cotacao/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!resp.ok) throw new Error('Erro na cotação')
      const data = await resp.json()
      setResultados(data)
    } catch (e) {
      console.error(e)
      setErro('Erro ao calcular cotação. Verifique filtros ou o backend.')
    } finally {
      setLoadingCotacao(false)
    }
  }

  const montarPayloadBase = () => ({
    idades: idadesNumeros,
    operadora_id: operadoraId ? parseInt(operadoraId, 10) : null,
    tipo_contratacao: tipo || null,
    acomodacao: acomodacao || null,
    abrangencia: abrangencia || null,
    coparticipacao: coparticipacao ? true : null,
    elegibilidade: elegibilidade ? true : null
  })

  const baixarPDFDoPlano = async (planoId, opts = {}) => {
    if (idadesNumeros.length === 0) {
      setErro('Informe pelo menos uma idade válida.')
      return
    }

    const payload = { ...montarPayloadBase(), plano_id: planoId }
    if (opts && typeof opts.descontoPercentual === 'number') {
      payload.desconto_percentual = opts.descontoPercentual
    }

    try {
      const resp = await fetch(`${apiBase}/cotacao/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!resp.ok) throw new Error('Erro ao gerar PDF')

      const blob = await resp.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cotacao_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      setErro('Erro ao gerar PDF. Tente novamente.')
    }
  }

  return (
    <div
      className={`space-y-8 min-h-screen transition-colors duration-300 ${theme.page}`}
    >
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start sm:gap-8">
        <div className="flex-1 space-y-2">
          <p
            className={`text-xs font-bold uppercase tracking-widest ${accentTheme.emphasis}`}
          >
            Dados para Cotação
          </p>
          <h2 className={`font-bold text-3xl leading-tight ${theme.title}`}>
            Monte o cenário ideal
          </h2>
          <p className={`text-sm leading-relaxed max-w-2xl ${theme.subtle}`}>
            Combine filtros de contratação, coparticipação e acomodação para
            obter as melhores ofertas personalizadas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowConfig(true)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold uppercase tracking-wide shadow-md-refined hover:shadow-lg transition-smooth focus-ring whitespace-nowrap ${
            darkMode
              ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          ⚙️ Configurações
        </button>
      </div>

      <form
        onSubmit={fazerCotacao}
        className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className={`space-y-4 rounded-2xl border ${theme.card} p-5`}>
          <div>
            <label className={`text-sm font-semibold ${theme.label}`}>
              Idades dos beneficiários
            </label>
            <p className={`text-xs leading-relaxed mt-1 ${theme.hint}`}>
              Separe por vírgula, ex: 35, 10, 5
            </p>
            <input
              className={`mt-3 w-full rounded-xl border transition-smooth ${
                theme.border
              } ${
                darkMode
                  ? 'bg-slate-900 text-slate-100 placeholder-slate-500 hover:border-slate-600 focus:border-slate-500'
                  : 'bg-white text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-slate-500'
              } px-4 py-3 text-sm shadow-sm ${
                accentTheme.focus
              } focus:ring-2 focus:shadow-lg`}
              value={idadesTexto}
              onChange={e => setIdadesTexto(e.target.value)}
              placeholder="Ex: 35, 10, 5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
            <div>
              <label className={`text-sm font-bold ${theme.label}`}>
                Operadora
              </label>
              <select
                className={`mt-3 w-full rounded-xl border transition-smooth ${
                  theme.border
                } ${
                  darkMode
                    ? 'bg-slate-900 text-slate-100 hover:border-slate-600 focus:border-slate-500'
                    : 'bg-white text-slate-800 hover:border-slate-300 focus:border-slate-500'
                } px-4 py-3 text-sm shadow-sm ${
                  accentTheme.focus
                } focus:ring-2 focus:shadow-lg appearance-none cursor-pointer`}
                value={operadoraId}
                onChange={e => setOperadoraId(e.target.value)}
              >
                <option value="">Todas</option>
                {operadoras.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-sm font-bold ${theme.label}`}>
                Tipo de contratação
              </label>
              <select
                className={`mt-3 w-full rounded-xl border transition-smooth ${
                  theme.border
                } ${
                  darkMode
                    ? 'bg-slate-900 text-slate-100 hover:border-slate-600 focus:border-slate-500'
                    : 'bg-white text-slate-800 hover:border-slate-300 focus:border-slate-500'
                } px-4 py-3 text-sm shadow-sm ${
                  accentTheme.focus
                } focus:ring-2 focus:shadow-lg appearance-none cursor-pointer`}
                value={tipo}
                onChange={e => setTipo(e.target.value)}
              >
                {tipoContratacao.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:gap-6">
            <div>
              <label className={`text-sm font-bold ${theme.label}`}>
                Acomodação
              </label>
              <select
                className={`mt-3 w-full rounded-xl border transition-smooth ${
                  theme.border
                } ${
                  darkMode
                    ? 'bg-slate-900 text-slate-100 hover:border-slate-600 focus:border-slate-500'
                    : 'bg-white text-slate-800 hover:border-slate-300 focus:border-slate-500'
                } px-4 py-3 text-sm shadow-sm ${
                  accentTheme.focus
                } focus:ring-2 focus:shadow-lg appearance-none cursor-pointer`}
                value={acomodacao}
                onChange={e => setAcomodacao(e.target.value)}
              >
                {acomodacoes.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`text-sm font-bold ${theme.label}`}>
                Abrangência
              </label>
              <select
                className={`mt-3 w-full rounded-xl border transition-smooth ${
                  theme.border
                } ${
                  darkMode
                    ? 'bg-slate-900 text-slate-100 hover:border-slate-600 focus:border-slate-500'
                    : 'bg-white text-slate-800 hover:border-slate-300 focus:border-slate-500'
                } px-4 py-3 text-sm shadow-sm ${
                  accentTheme.focus
                } focus:ring-2 focus:shadow-lg appearance-none cursor-pointer`}
                value={abrangencia}
                onChange={e => setAbrangencia(e.target.value)}
              >
                {abrangencias.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div
              className={`flex flex-col gap-4 rounded-xl border transition-smooth ${
                theme.border
              } ${
                darkMode
                  ? 'bg-slate-900/50 text-slate-100 hover:border-slate-600'
                  : 'bg-blue-50 text-slate-800 hover:border-slate-300'
              } px-4 py-3 shadow-soft`}
            >
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold group-hover:text-blue-600 transition-colors">
                  Coparticipação
                </span>
                <input
                  type="checkbox"
                  className={`h-5 w-5 rounded border-slate-400 cursor-pointer transition-smooth ${accentTheme.check}`}
                  checked={coparticipacao}
                  onChange={e => setCoparticipacao(e.target.checked)}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-bold group-hover:text-blue-600 transition-colors">
                  Elegibilidade
                </span>
                <input
                  type="checkbox"
                  className={`h-5 w-5 rounded border-slate-400 cursor-pointer transition-smooth ${accentTheme.check}`}
                  checked={elegibilidade}
                  onChange={e => setElegibilidade(e.target.checked)}
                />
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loadingCotacao}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white uppercase tracking-wide transition-smooth focus-ring btn-gradient-animate btn-shine btn-pulse hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:opacity-50 disabled:animate-none disabled:hover:scale-100`}
            >
              {loadingCotacao ? '⏳ Calculando…' : '🔍 Pesquisar Planos'}
            </button>
            {erro && (
              <span className="text-sm font-semibold text-red-600">{erro}</span>
            )}
          </div>
        </div>

        <div
          className={`rounded-2xl border-2 transition-smooth ${theme.panel} p-6 shadow-soft space-y-4`}
        >
          <h3
            className={`text-sm font-bold uppercase tracking-wide ${theme.title}`}
          >
            📋 Atenção ao cotar
          </h3>
          <div className={`text-sm leading-relaxed ${theme.text} space-y-3`}>
            <div>
              <p className="font-bold text-base">Informações ao cotar</p>
              <ul className="space-y-2 pl-0 mt-2">
                <li>
                  <span className="text-green-500">✅</span> Solicitar a idade e
                  quantas pessoas
                </li>
                <li>
                  <span className="text-green-500">✅</span> Abrangência:{' '}
                  {abrangencia || 'Todas'}
                </li>
                <li>
                  <span className="text-green-500">✅</span> Valor por pessoa
                  PJ: confirme tabela por faixa etária
                </li>
                <li>
                  <span className="text-green-500">✅</span> Vigência e
                  vencimento da fatura
                </li>
                <li>
                  <span className="text-green-500">✅</span> Taxa de adesão (há
                  cobrança)
                </li>
                <li>
                  <span className="text-green-500">✅</span> Carência: padrão,
                  reduzida ou isenção
                </li>
                <li>
                  <span className="text-green-500">✅</span> Elegibilidade:
                  exige vínculo ou declaração?
                </li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-600">
              <p className="font-bold text-base">Perguntas para não esquecer</p>
              <ul className="space-y-2 pl-0 mt-2">
                <li>✅ Explicar sobre a coparticipação e carência</li>
                <li>✅ Planos PJ acimade 03 vidas valores diferentes</li>
                <li>✅ Há carência reduzida por portabilidade/migração?</li>
                <li>✅ Início de cobertura (vigência)?</li>
                <li>
                  ✅ Existe taxa de adesão ou cobrança inicial pagamento a
                  corretora
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className={`font-display text-xl font-semibold ${theme.title}`}>
            Resultados
          </h3>
          {loadingCotacao && (
            <span className={`text-sm ${theme.hint}`}>Calculando...</span>
          )}
        </div>

        {!loadingCotacao && resultados.length === 0 && (
          <div
            className={`rounded-2xl border border-dashed p-6 text-center text-sm ${
              theme.card
            } ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
          >
            Nenhum resultado ainda. Execute uma cotação para visualizar.
          </div>
        )}

        <div className="grid gap-4 sm:gap-6">
          {resultados && resultados.length > 0 ? (
            resultados.map(plano => (
              <ResultCard
                key={`${plano.operadora}-${plano.plano}-${plano.preco_total}`}
                plano={plano}
                onDownload={({ descontoPercentual }) =>
                  baixarPDFDoPlano(plano.plano_id, { descontoPercentual })
                }
                darkMode={darkMode}
                accentTheme={accentTheme}
              />
            ))
          ) : (
            <div
              className={`rounded-xl border-2 p-8 text-center transition-smooth ${
                darkMode
                  ? 'border-slate-700 bg-slate-800/50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <p
                className={`text-lg font-semibold ${
                  darkMode ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                Pesquise planos para ver resultados
              </p>
              <p
                className={`text-sm mt-2 ${
                  darkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Preencha os filtros e clique em "Pesquisar Planos"
              </p>
            </div>
          )}
        </div>
      </div>

      {showConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border-2 transition-smooth ${theme.panel} p-7 shadow-2xl`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p
                  className={`text-xs uppercase tracking-widest font-bold ${accentTheme.emphasis}`}
                >
                  Aparência
                </p>
                <h4
                  className={`font-bold text-2xl leading-tight ${theme.title}`}
                >
                  Configurações
                </h4>
                <p className={`text-sm leading-relaxed mt-2 ${theme.subtle}`}>
                  Ajuste o modo escuro e o tema de cores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className={`rounded-full px-3 py-2 text-xs font-bold uppercase tracking-wide shadow-md-refined hover:shadow-lg transition-smooth focus-ring ${
                  darkMode
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ✕
              </button>
            </div>

            <div
              className={`mt-5 rounded-xl border ${theme.border} ${
                darkMode ? 'bg-slate-900/70' : 'bg-slate-50'
              } p-5 flex items-center justify-between group hover:shadow-soft transition-smooth cursor-pointer rounded-xl`}
            >
              <div>
                <p
                  className={`text-sm font-bold ${theme.title} group-hover:${accentTheme.emphasis}`}
                >
                  Modo escuro
                </p>
                <p className={`text-xs leading-relaxed mt-1 ${theme.hint}`}>
                  Alterna entre tema claro e escuro.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(prev => !prev)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full border-2 shadow-md-refined hover:shadow-lg transition-smooth focus-ring ${
                  darkMode
                    ? `${accentTheme.toggle} border-transparent`
                    : 'bg-slate-200 border-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                    darkMode ? 'translate-x-7' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfig(false)}
                className={`rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide shadow-md-refined hover:shadow-lg transition-smooth focus-ring ${
                  darkMode
                    ? 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                    : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                }`}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {loadingOperadoras && (
        <div
          className={`fixed bottom-4 right-4 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ring-1 ${
            darkMode
              ? 'bg-slate-900 text-slate-100 ring-slate-700'
              : 'bg-white text-slate-700 ring-slate-200'
          }`}
        >
          Carregando operadoras…
        </div>
      )}
    </div>
  )
}
