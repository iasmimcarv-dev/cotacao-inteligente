import { useState, useEffect } from 'react'
import { useTheme } from '../theme/ThemeProvider'

const DEFAULT_API = 'http://127.0.0.1:8000/api/v1'

export default function AdminPage() {
  const { darkMode } = useTheme()
  const theme = {
    page: darkMode ? 'text-slate-100' : 'text-slate-900',
    border: darkMode ? 'border-slate-700' : 'border-slate-200',
    panel: darkMode
      ? 'bg-slate-900 border-slate-800'
      : 'bg-white border-slate-200',
    successBg: darkMode
      ? 'bg-emerald-900/20 text-emerald-300 border-emerald-800'
      : 'bg-green-50 text-green-800 border-green-200',
    errorBg: darkMode
      ? 'bg-red-900/20 text-red-300 border-red-800'
      : 'bg-red-50 text-red-800 border-red-200',
    tabActive: darkMode
      ? 'border-b-2 border-blue-400 text-blue-300'
      : 'border-b-2 border-blue-600 text-blue-600',
    tabInactive: darkMode
      ? 'text-slate-300 hover:text-slate-100'
      : 'text-slate-600 hover:text-slate-900'
  }
  const [apiBase] = useState(
    () => localStorage.getItem('apiUrl') || DEFAULT_API
  )
  const [activeTab, setActiveTab] = useState('operadoras')

  // Estados para Operadoras
  const [operadoras, setOperadoras] = useState([])
  const [loadingOperadoras, setLoadingOperadoras] = useState(false)
  const [novaOperadora, setNovaOperadora] = useState({
    nome: '',
    rede_credenciada_url: ''
  })
  const [editandoOperadora, setEditandoOperadora] = useState(null)

  // Estados para Planos
  const [planos, setPlanos] = useState([])
  const [loadingPlanos, setLoadingPlanos] = useState(false)
  const [showModalPlano, setShowModalPlano] = useState(false)
  const [planoForm, setPlanoForm] = useState({
    nome: '',
    operadora_id: '',
    tipo_contratacao: 'PF',
    acomodacao: 'Enfermaria',
    abrangencia: 'Nacional',
    coparticipacao: false,
    elegibilidade: false,
    imagem_coparticipacao_url: '',
    faixas_preco: [{ faixa_etaria: '00-18', valor: 0 }],
    hospitais: [],
    carencias: [],
    coparticipacoes: [],
    municipios: []
  })
  const [editandoPlano, setEditandoPlano] = useState(null)

  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Carregar Operadoras
  useEffect(() => {
    if (activeTab === 'operadoras') {
      carregarOperadoras()
    } else if (activeTab === 'planos') {
      carregarOperadoras()
      carregarPlanos()
    }
  }, [activeTab])

  const carregarOperadoras = async () => {
    setLoadingOperadoras(true)
    try {
      const resp = await fetch(`${apiBase}/operadoras/`)
      if (!resp.ok) throw new Error('Erro ao carregar operadoras')
      const data = await resp.json()
      setOperadoras(data)
    } catch (e) {
      setErro('Erro ao carregar operadoras: ' + e.message)
    } finally {
      setLoadingOperadoras(false)
    }
  }

  const carregarPlanos = async () => {
    setLoadingPlanos(true)
    try {
      const resp = await fetch(`${apiBase}/planos/`)
      if (!resp.ok) throw new Error('Erro ao carregar planos')
      const data = await resp.json()
      setPlanos(data)
    } catch (e) {
      setErro('Erro ao carregar planos: ' + e.message)
    } finally {
      setLoadingPlanos(false)
    }
  }

  // CRUD Operadoras
  const criarOperadora = async e => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    try {
      const resp = await fetch(`${apiBase}/operadoras/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaOperadora)
      })
      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.detail || 'Erro ao criar operadora')
      }
      setSucesso('Operadora criada com sucesso!')
      setNovaOperadora({ nome: '', rede_credenciada_url: '' })
      carregarOperadoras()
    } catch (e) {
      setErro(e.message)
    }
  }

  const atualizarOperadora = async (id, dados) => {
    setErro('')
    setSucesso('')
    try {
      const resp = await fetch(`${apiBase}/operadoras/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })
      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.detail || 'Erro ao atualizar operadora')
      }
      setSucesso('Operadora atualizada com sucesso!')
      setEditandoOperadora(null)
      carregarOperadoras()
    } catch (e) {
      setErro(e.message)
    }
  }

  const deletarOperadora = async id => {
    if (!confirm('Deseja realmente excluir esta operadora?')) return
    setErro('')
    setSucesso('')
    try {
      const resp = await fetch(`${apiBase}/operadoras/${id}`, {
        method: 'DELETE'
      })
      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.detail || 'Erro ao deletar operadora')
      }
      setSucesso('Operadora removida com sucesso!')
      carregarOperadoras()
    } catch (e) {
      setErro(e.message)
    }
  }

  // CRUD Planos
  const abrirModalPlano = (plano = null) => {
    if (plano) {
      setEditandoPlano(plano.id)
      setPlanoForm({
        nome: plano.nome,
        operadora_id: plano.operadora_id,
        tipo_contratacao: plano.tipo_contratacao,
        acomodacao: plano.acomodacao,
        abrangencia: plano.abrangencia,
        coparticipacao: plano.coparticipacao,
        elegibilidade: plano.elegibilidade || false,
        imagem_coparticipacao_url: plano.imagem_coparticipacao_url || '',
        faixas_preco:
          plano.faixas?.length > 0
            ? plano.faixas.map(f => ({
                faixa_etaria: f.faixa_etaria,
                valor: f.valor
              }))
            : [{ faixa_etaria: '00-18', valor: 0 }],
        hospitais: plano.hospitais || [],
        carencias: plano.carencias || [],
        coparticipacoes: plano.coparticipacoes || [],
        municipios: plano.municipios || []
      })
    } else {
      setEditandoPlano(null)
      setPlanoForm({
        nome: '',
        operadora_id: '',
        tipo_contratacao: 'PF',
        acomodacao: 'Enfermaria',
        abrangencia: 'Nacional',
        coparticipacao: false,
        elegibilidade: false,
        imagem_coparticipacao_url: '',
        faixas_preco: [{ faixa_etaria: '00-18', valor: 0 }],
        hospitais: [],
        carencias: [],
        coparticipacoes: [],
        municipios: []
      })
    }
    setShowModalPlano(true)
  }

  const salvarPlano = async e => {
    e.preventDefault()
    setErro('')
    setSucesso('')
    try {
      const url = editandoPlano
        ? `${apiBase}/planos/${editandoPlano}`
        : `${apiBase}/planos/`
      const method = editandoPlano ? 'PUT' : 'POST'

      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planoForm)
      })

      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.detail || 'Erro ao salvar plano')
      }

      setSucesso(editandoPlano ? 'Plano atualizado!' : 'Plano criado!')
      setShowModalPlano(false)
      carregarPlanos()
    } catch (e) {
      setErro(e.message)
    }
  }

  const deletarPlano = async id => {
    if (!confirm('Deseja realmente excluir este plano?')) return
    setErro('')
    setSucesso('')
    try {
      const resp = await fetch(`${apiBase}/planos/${id}`, {
        method: 'DELETE'
      })
      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.detail || 'Erro ao deletar plano')
      }
      setSucesso('Plano removido com sucesso!')
      carregarPlanos()
    } catch (e) {
      setErro(e.message)
    }
  }

  // Helpers para Faixas de Preço
  const adicionarFaixa = () => {
    setPlanoForm({
      ...planoForm,
      faixas_preco: [...planoForm.faixas_preco, { faixa_etaria: '', valor: 0 }]
    })
  }

  const removerFaixa = index => {
    setPlanoForm({
      ...planoForm,
      faixas_preco: planoForm.faixas_preco.filter((_, i) => i !== index)
    })
  }

  const atualizarFaixa = (index, campo, valor) => {
    const novasFaixas = [...planoForm.faixas_preco]
    novasFaixas[index][campo] =
      campo === 'valor' ? parseFloat(valor) || 0 : valor
    setPlanoForm({ ...planoForm, faixas_preco: novasFaixas })
  }

  // Helpers para Hospitais
  const adicionarHospital = () => {
    setPlanoForm({
      ...planoForm,
      hospitais: [...planoForm.hospitais, { nome: '', endereco: '' }]
    })
  }

  const removerHospital = index => {
    setPlanoForm({
      ...planoForm,
      hospitais: planoForm.hospitais.filter((_, i) => i !== index)
    })
  }

  const atualizarHospital = (index, campo, valor) => {
    const novosHospitais = [...planoForm.hospitais]
    novosHospitais[index][campo] = valor
    setPlanoForm({ ...planoForm, hospitais: novosHospitais })
  }

  // Helpers para Carências
  const adicionarCarencia = () => {
    setPlanoForm({
      ...planoForm,
      carencias: [...planoForm.carencias, { descricao: '', dias: 0 }]
    })
  }

  const removerCarencia = index => {
    setPlanoForm({
      ...planoForm,
      carencias: planoForm.carencias.filter((_, i) => i !== index)
    })
  }

  const atualizarCarenciaForm = (index, campo, valor) => {
    const novasCarencias = [...planoForm.carencias]
    novasCarencias[index][campo] =
      campo === 'dias' ? parseInt(valor) || 0 : valor
    setPlanoForm({ ...planoForm, carencias: novasCarencias })
  }

  // Helpers para Coparticipações
  const adicionarCoparticipacao = () => {
    setPlanoForm({
      ...planoForm,
      coparticipacoes: [
        ...planoForm.coparticipacoes,
        {
          nome: '',
          tipo_servico: '',
          percentual: 0,
          valor_minimo: 0,
          valor_maximo: 0
        }
      ]
    })
  }

  const removerCoparticipacao = index => {
    setPlanoForm({
      ...planoForm,
      coparticipacoes: planoForm.coparticipacoes.filter((_, i) => i !== index)
    })
  }

  const atualizarCoparticipacao = (index, campo, valor) => {
    const novasCopart = [...planoForm.coparticipacoes]
    novasCopart[index][campo] = [
      'percentual',
      'valor_minimo',
      'valor_maximo'
    ].includes(campo)
      ? parseFloat(valor) || 0
      : valor
    setPlanoForm({ ...planoForm, coparticipacoes: novasCopart })
  }

  // Helpers para Municípios
  const adicionarMunicipio = () => {
    setPlanoForm({
      ...planoForm,
      municipios: [...planoForm.municipios, { nome: '' }]
    })
  }

  const removerMunicipio = index => {
    setPlanoForm({
      ...planoForm,
      municipios: planoForm.municipios.filter((_, i) => i !== index)
    })
  }

  const atualizarMunicipio = (index, valor) => {
    const novosMunicipios = [...planoForm.municipios]
    novosMunicipios[index].nome = valor
    setPlanoForm({ ...planoForm, municipios: novosMunicipios })
  }

  return (
    <div className={`space-y-4 ${theme.page}`}>
      {/* Mensagens */}
      {erro && (
        <div className={`rounded-lg p-4 border ${theme.errorBg}`}>
          ❌ {erro}
        </div>
      )}
      {sucesso && (
        <div className={`rounded-lg p-4 border ${theme.successBg}`}>
          ✅ {sucesso}
        </div>
      )}

      {/* Tabs */}
      <div className={`flex gap-2 border-b ${theme.border}`}>
        <button
          onClick={() => setActiveTab('operadoras')}
          className={`px-5 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-smooth cursor-pointer ${
            activeTab === 'operadoras'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          Operadoras
        </button>
        <button
          onClick={() => setActiveTab('planos')}
          className={`px-5 py-3 text-sm font-bold uppercase tracking-wide border-b-2 transition-smooth cursor-pointer ${
            activeTab === 'planos'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          Planos
        </button>
      </div>

      {/* Tab: Operadoras */}
      {activeTab === 'operadoras' && (
        <div className="space-y-8">
          <div
            className={`rounded-2xl p-7 border-2 shadow-soft transition-smooth ${
              darkMode
                ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <h3
              className={`text-lg font-bold mb-6 uppercase tracking-wide ${
                darkMode ? 'text-slate-100' : 'text-slate-900'
              }`}
            >
              ➕ Nova Operadora
            </h3>
            <form onSubmit={criarOperadora} className="space-y-5">
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    darkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  Nome da Operadora *
                </label>
                <input
                  type="text"
                  value={novaOperadora.nome}
                  onChange={e =>
                    setNovaOperadora({ ...novaOperadora, nome: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl transition-smooth ${
                    darkMode
                      ? 'bg-slate-800 border-slate-600 text-slate-100 focus:border-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-slate-500'
                  } focus:ring-2 focus:shadow-lg`}
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-bold mb-2 ${
                    darkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  URL Rede Credenciada
                </label>
                <input
                  type="text"
                  value={novaOperadora.rede_credenciada_url}
                  onChange={e =>
                    setNovaOperadora({
                      ...novaOperadora,
                      rede_credenciada_url: e.target.value
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-xl transition-smooth ${
                    darkMode
                      ? 'bg-slate-800 border-slate-600 text-slate-100 focus:border-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-slate-500'
                  } focus:ring-2 focus:shadow-lg`}
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 text-white rounded-full transition-smooth font-bold uppercase tracking-wide focus-ring btn-gradient-animate btn-shine btn-pulse hover:scale-105 active:scale-95 shadow-md-refined hover:shadow-lg-refined"
              >
                ➕ Criar Operadora
              </button>
            </form>
          </div>

          <div
            className={`rounded-2xl shadow-soft overflow-hidden border-2 transition-smooth ${
              darkMode
                ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`px-7 py-5 border-b-2 ${
                darkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h3
                className={`text-lg font-bold uppercase tracking-wide ${
                  darkMode ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                📋 Operadoras Cadastradas
              </h3>
            </div>
            {loadingOperadoras ? (
              <div
                className={`p-12 text-center ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <p>Carregando operadoras...</p>
              </div>
            ) : operadoras.length === 0 ? (
              <div
                className={`p-12 text-center ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <p>Nenhuma operadora cadastrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${
                      darkMode
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-slate-50 border-b-2'
                    }`}
                  >
                    <tr className="border-b-2 border-slate-700">
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        ID
                      </th>
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Nome
                      </th>
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Rede Credenciada
                      </th>
                      <th
                        className={`px-7 py-4 text-right text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`${
                      darkMode
                        ? 'divide-slate-700'
                        : 'divide-y divide-slate-200'
                    }`}
                  >
                    {operadoras.map(op => (
                      <tr
                        key={op.id}
                        className={`transition-smooth ${
                          darkMode
                            ? 'hover:bg-slate-800/50 border-slate-700'
                            : 'hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <td
                          className={`px-7 py-4 text-sm font-medium ${
                            darkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {op.id}
                        </td>
                        <td
                          className={`px-7 py-4 ${
                            darkMode ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {editandoOperadora === op.id ? (
                            <input
                              type="text"
                              defaultValue={op.nome}
                              id={`nome-${op.id}`}
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            <span>{op.nome}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {editandoOperadora === op.id ? (
                            <input
                              type="text"
                              defaultValue={op.rede_credenciada_url || ''}
                              id={`url-${op.id}`}
                              className="w-full px-2 py-1 border rounded"
                            />
                          ) : (
                            <span className="text-xs truncate block max-w-xs">
                              {op.rede_credenciada_url || '-'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {editandoOperadora === op.id ? (
                            <>
                              <button
                                onClick={() => {
                                  const nome = document.getElementById(
                                    `nome-${op.id}`
                                  ).value
                                  const url = document.getElementById(
                                    `url-${op.id}`
                                  ).value
                                  atualizarOperadora(op.id, {
                                    nome,
                                    rede_credenciada_url: url
                                  })
                                }}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditandoOperadora(null)}
                                className="ml-2 px-3 py-1 bg-slate-400 text-white rounded text-sm hover:bg-slate-500"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => setEditandoOperadora(op.id)}
                                className="p-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition-transform duration-150 hover:scale-[1.05]"
                                aria-label="Editar operadora"
                                title="Editar"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deletarOperadora(op.id)}
                                className="ml-2 p-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 transition-transform duration-150 hover:scale-[1.05]"
                                aria-label="Excluir operadora"
                                title="Excluir"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Planos */}
      {activeTab === 'planos' && (
        <div className="space-y-8">
          <div>
            <button
              onClick={() => abrirModalPlano()}
              className="px-6 py-3 text-white rounded-full transition-smooth font-bold uppercase tracking-wide focus-ring btn-gradient-animate btn-shine btn-pulse hover:scale-105 active:scale-95 shadow-md-refined hover:shadow-lg-refined"
            >
              ➕ Novo Plano
            </button>
          </div>

          <div
            className={`rounded-2xl shadow-soft overflow-hidden border-2 transition-smooth ${
              darkMode
                ? 'bg-slate-900/50 border-slate-700 hover:border-slate-600'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div
              className={`px-7 py-5 border-b-2 ${
                darkMode
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <h3
                className={`text-lg font-bold uppercase tracking-wide ${
                  darkMode ? 'text-slate-100' : 'text-slate-900'
                }`}
              >
                📋 Planos Cadastrados
              </h3>
            </div>
            {loadingPlanos ? (
              <div
                className={`p-12 text-center ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <p>Carregando planos...</p>
              </div>
            ) : planos.length === 0 ? (
              <div
                className={`p-12 text-center ${
                  darkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <p>Nenhum plano cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead
                    className={`${
                      darkMode
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-slate-50 border-b-2'
                    }`}
                  >
                    <tr className="border-b-2 border-slate-700">
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        ID
                      </th>
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Nome
                      </th>
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Operadora
                      </th>
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Tipo
                      </th>
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Acomodação
                      </th>
                      <th
                        className={`px-7 py-4 text-left text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Copart.
                      </th>
                      <th
                        className={`px-7 py-4 text-right text-xs font-bold uppercase tracking-wide ${
                          darkMode ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`${
                      darkMode
                        ? 'divide-slate-700'
                        : 'divide-y divide-slate-200'
                    }`}
                  >
                    {planos.map(plano => {
                      const operadora = operadoras.find(
                        o => o.id === plano.operadora_id
                      )
                      return (
                        <tr
                          key={plano.id}
                          className={`transition-smooth ${
                            darkMode
                              ? 'hover:bg-slate-800/50 border-slate-700'
                              : 'hover:bg-slate-50 border-slate-200'
                          }`}
                        >
                          <td
                            className={`px-7 py-4 text-sm font-medium ${
                              darkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            {plano.id}
                          </td>
                          <td
                            className={`px-7 py-4 text-sm font-medium ${
                              darkMode ? 'text-slate-100' : 'text-slate-900'
                            }`}
                          >
                            {plano.nome}
                          </td>
                          <td
                            className={`px-7 py-4 text-sm ${
                              darkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            {operadora?.nome || '-'}
                          </td>
                          <td
                            className={`px-7 py-4 text-sm ${
                              darkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            {plano.tipo_contratacao}
                          </td>
                          <td
                            className={`px-7 py-4 text-sm ${
                              darkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            {plano.acomodacao}
                          </td>
                          <td
                            className={`px-7 py-4 text-sm ${
                              darkMode ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            {plano.coparticipacao ? '✅' : '❌'}
                          </td>
                          <td className="px-7 py-4 text-right">
                            <button
                              onClick={() => abrirModalPlano(plano)}
                              className="p-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition-transform duration-150 hover:scale-[1.05]"
                              aria-label="Editar plano"
                              title="Editar"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deletarPlano(plano.id)}
                              className="ml-2 p-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-300 transition-transform duration-150 hover:scale-[1.05]"
                              aria-label="Excluir plano"
                              title="Excluir"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Plano */}
      {showModalPlano && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`${
              darkMode ? 'bg-slate-900 text-slate-100' : 'bg-white'
            } rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}
          >
            <div
              className={`sticky top-0 px-6 py-4 flex justify-between items-center border-b ${
                darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white'
              }`}
            >
              <h3 className="text-xl font-semibold">
                {editandoPlano ? 'Editar Plano' : 'Novo Plano'}
              </h3>
              <button
                onClick={() => setShowModalPlano(false)}
                className={`text-2xl ${
                  darkMode
                    ? 'text-slate-300 hover:text-slate-100'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarPlano} className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Informações Básicas</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={planoForm.nome}
                      onChange={e =>
                        setPlanoForm({ ...planoForm, nome: e.target.value })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode
                          ? 'bg-slate-900 text-slate-100 border-slate-700'
                          : ''
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Operadora *
                    </label>
                    <select
                      value={planoForm.operadora_id}
                      onChange={e =>
                        setPlanoForm({
                          ...planoForm,
                          operadora_id: parseInt(e.target.value)
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode
                          ? 'bg-slate-900 text-slate-100 border-slate-700'
                          : ''
                      }`}
                      required
                    >
                      <option value="">Selecione...</option>
                      {operadoras.map(op => (
                        <option key={op.id} value={op.id}>
                          {op.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tipo Contratação *
                    </label>
                    <select
                      value={planoForm.tipo_contratacao}
                      onChange={e =>
                        setPlanoForm({
                          ...planoForm,
                          tipo_contratacao: e.target.value
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode
                          ? 'bg-slate-900 text-slate-100 border-slate-700'
                          : ''
                      }`}
                      required
                    >
                      <option value="PF">PF - Pessoa Física</option>
                      <option value="PJ">PJ - Pessoa Jurídica</option>
                      <option value="Adesão">Adesão</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Acomodação *
                    </label>
                    <select
                      value={planoForm.acomodacao}
                      onChange={e =>
                        setPlanoForm({
                          ...planoForm,
                          acomodacao: e.target.value
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode
                          ? 'bg-slate-900 text-slate-100 border-slate-700'
                          : ''
                      }`}
                      required
                    >
                      <option value="Enfermaria">Enfermaria</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Semi-privativo">Semi-privativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Abrangência *
                    </label>
                    <select
                      value={planoForm.abrangencia}
                      onChange={e =>
                        setPlanoForm({
                          ...planoForm,
                          abrangencia: e.target.value
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode
                          ? 'bg-slate-900 text-slate-100 border-slate-700'
                          : ''
                      }`}
                      required
                    >
                      <option value="Nacional">Nacional</option>
                      <option value="Regional">Regional</option>
                      <option value="Local">Local</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Imagem Coparticipação (URL)
                    </label>
                    <input
                      type="text"
                      value={planoForm.imagem_coparticipacao_url}
                      onChange={e =>
                        setPlanoForm({
                          ...planoForm,
                          imagem_coparticipacao_url: e.target.value
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${
                        darkMode
                          ? 'bg-slate-900 text-slate-100 border-slate-700'
                          : ''
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planoForm.coparticipacao}
                      onChange={e =>
                        setPlanoForm({
                          ...planoForm,
                          coparticipacao: e.target.checked
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Coparticipação</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={planoForm.elegibilidade}
                      onChange={e =>
                        setPlanoForm({
                          ...planoForm,
                          elegibilidade: e.target.checked
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">Elegibilidade</span>
                  </label>
                </div>
              </div>

              {/* Faixas de Preço */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Faixas de Preço *</h4>
                  <button
                    type="button"
                    onClick={adicionarFaixa}
                    className="px-3 py-1 bg-green-600 text-white rounded-2xl text-sm hover:bg-green-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    + Adicionar
                  </button>
                </div>
                {planoForm.faixas_preco.map((faixa, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Ex: 00-18"
                      value={faixa.faixa_etaria}
                      onChange={e =>
                        atualizarFaixa(index, 'faixa_etaria', e.target.value)
                      }
                      className="flex-1 px-3 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Valor"
                      value={faixa.valor}
                      onChange={e =>
                        atualizarFaixa(index, 'valor', e.target.value)
                      }
                      className="flex-1 px-3 py-2 border rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removerFaixa(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Hospitais */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Hospitais</h4>
                  <button
                    type="button"
                    onClick={adicionarHospital}
                    className="px-3 py-1 bg-green-600 text-white rounded-2xl text-sm hover:bg-green-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    + Adicionar
                  </button>
                </div>
                {planoForm.hospitais.map((hosp, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nome do Hospital"
                      value={hosp.nome}
                      onChange={e =>
                        atualizarHospital(index, 'nome', e.target.value)
                      }
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Endereço"
                      value={hosp.endereco || ''}
                      onChange={e =>
                        atualizarHospital(index, 'endereco', e.target.value)
                      }
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removerHospital(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Carências */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Carências</h4>
                  <button
                    type="button"
                    onClick={adicionarCarencia}
                    className="px-3 py-1 bg-green-600 text-white rounded-2xl text-sm hover:bg-green-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    + Adicionar
                  </button>
                </div>
                {planoForm.carencias.map((car, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Descrição"
                      value={car.descricao}
                      onChange={e =>
                        atualizarCarenciaForm(
                          index,
                          'descricao',
                          e.target.value
                        )
                      }
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Dias"
                      value={car.dias}
                      onChange={e =>
                        atualizarCarenciaForm(index, 'dias', e.target.value)
                      }
                      className="w-24 px-3 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removerCarencia(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Coparticipações */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Coparticipações</h4>
                  <button
                    type="button"
                    onClick={adicionarCoparticipacao}
                    className="px-3 py-1 bg-green-600 text-white rounded-2xl text-sm hover:bg-green-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    + Adicionar
                  </button>
                </div>
                {planoForm.coparticipacoes.map((cop, index) => (
                  <div key={index} className="border p-4 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nome (ex: Consulta, Exame, Internação)"
                        value={cop.nome || ''}
                        onChange={e =>
                          atualizarCoparticipacao(index, 'nome', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Tipo Serviço (ex: Ambulatorial, Hospitalar)"
                        value={cop.tipo_servico || ''}
                        onChange={e =>
                          atualizarCoparticipacao(
                            index,
                            'tipo_servico',
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Percentual % (ex: 30 para 30%)"
                        value={cop.percentual}
                        onChange={e =>
                          atualizarCoparticipacao(
                            index,
                            'percentual',
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Valor Mínimo em R$ (ex: 15.00)"
                        value={cop.valor_minimo}
                        onChange={e =>
                          atualizarCoparticipacao(
                            index,
                            'valor_minimo',
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Valor Máximo em R$ (ex: 150.00)"
                        value={cop.valor_maximo}
                        onChange={e =>
                          atualizarCoparticipacao(
                            index,
                            'valor_maximo',
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removerCoparticipacao(index)}
                        className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Municípios */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Municípios</h4>
                  <button
                    type="button"
                    onClick={adicionarMunicipio}
                    className="px-3 py-1 bg-green-600 text-white rounded-2xl text-sm hover:bg-green-700 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-300"
                  >
                    + Adicionar
                  </button>
                </div>
                {planoForm.municipios.map((mun, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nome do Município"
                      value={mun.nome}
                      onChange={e => atualizarMunicipio(index, e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removerMunicipio(index)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Botões do Modal */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModalPlano(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editandoPlano ? 'Atualizar' : 'Criar'} Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
