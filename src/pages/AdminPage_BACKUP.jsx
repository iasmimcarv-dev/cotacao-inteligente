import { useState, useEffect } from 'react'

const DEFAULT_API = 'http://127.0.0.1:8000/api/v1'

export default function AdminPage() {
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
    <div className="space-y-4">
      {/* Mensagens */}
      {erro && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
          ❌ {erro}
        </div>
      )}
      {sucesso && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
          ✅ {sucesso}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('operadoras')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'operadoras'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Operadoras
        </button>
        <button
          onClick={() => setActiveTab('planos')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'planos'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Planos
        </button>
      </div>

      {/* Tab: Operadoras */}
      {activeTab === 'operadoras' && (
    if (!planoId) return
    setLoadingCarencias(true)
    try {
      const resp = await fetch(`${apiBase}/planos/${planoId}`)
      if (!resp.ok) throw new Error('Erro ao carregar plano')
      const data = await resp.json()
      setCarencias(data.carencias || [])
    } catch (e) {
      setErro('Erro ao carregar carências: ' + e.message)
    } finally {
      setLoadingCarencias(false)
    }
  }

  const adicionarNovaCarencia = async (descricao, dias) => {
    if (!planoSelecionadoCarencia) return
    setErro('')
    setSucesso('')

    const planoAtual = planos.find(
      p => p.id === parseInt(planoSelecionadoCarencia)
    )
    if (!planoAtual) return

    const novasCarencias = [
      ...(planoAtual.carencias || []).map(c => ({
        descricao: c.descricao,
        dias: c.dias
      })),
      { descricao, dias: parseInt(dias) }
    ]

    try {
      const resp = await fetch(
        `${apiBase}/planos/${planoSelecionadoCarencia}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: planoAtual.nome,
            operadora_id: planoAtual.operadora_id,
            tipo_contratacao: planoAtual.tipo_contratacao,
            acomodacao: planoAtual.acomodacao,
            abrangencia: planoAtual.abrangencia,
            coparticipacao: planoAtual.coparticipacao,
            elegibilidade: planoAtual.elegibilidade || false,
            imagem_coparticipacao_url:
              planoAtual.imagem_coparticipacao_url || '',
            faixas_preco: (planoAtual.faixas || []).map(f => ({
              faixa_etaria: f.faixa_etaria,
              valor: f.valor
            })),
            hospitais: (planoAtual.hospitais || []).map(h => ({
              nome: h.nome,
              endereco: h.endereco || ''
            })),
            carencias: novasCarencias,
            coparticipacoes: (planoAtual.coparticipacoes || []).map(c => ({
              id: c.id,
              nome: c.nome,
              tipo_plano: c.tipo_plano,
              imagem_url: c.imagem_url,
              tipo_servico: c.tipo_servico,
              percentual: c.percentual,
              valor_minimo: c.valor_minimo,
              valor_maximo: c.valor_maximo
            })),
            municipios: (planoAtual.municipios || []).map(m => ({
              nome: m.nome
            }))
          })
        }
      )
      if (!resp.ok) throw new Error('Erro ao adicionar carência')
      setSucesso('Carência adicionada com sucesso!')
      carregarCarenciasDePlano(planoSelecionadoCarencia)
    } catch (e) {
      setErro(e.message)
    }
  }

  const atualizarCarencia = async (carenciaId, descricao, dias) => {
    if (!planoSelecionadoCarencia) return
    setErro('')
    setSucesso('')

    const planoAtual = planos.find(
      p => p.id === parseInt(planoSelecionadoCarencia)
    )
    if (!planoAtual) return

    const carenciasAtualizadas = planoAtual.carencias.map(c =>
      c.id === carenciaId
        ? { descricao, dias: parseInt(dias) }
        : { descricao: c.descricao, dias: c.dias }
    )

    try {
      const resp = await fetch(
        `${apiBase}/planos/${planoSelecionadoCarencia}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: planoAtual.nome,
            operadora_id: planoAtual.operadora_id,
            tipo_contratacao: planoAtual.tipo_contratacao,
            acomodacao: planoAtual.acomodacao,
            abrangencia: planoAtual.abrangencia,
            coparticipacao: planoAtual.coparticipacao,
            elegibilidade: planoAtual.elegibilidade || false,
            imagem_coparticipacao_url:
              planoAtual.imagem_coparticipacao_url || '',
            faixas_preco: (planoAtual.faixas || []).map(f => ({
              faixa_etaria: f.faixa_etaria,
              valor: f.valor
            })),
            hospitais: (planoAtual.hospitais || []).map(h => ({
              nome: h.nome,
              endereco: h.endereco || ''
            })),
            carencias: carenciasAtualizadas,
            coparticipacoes: (planoAtual.coparticipacoes || []).map(c => ({
              id: c.id,
              nome: c.nome,
              tipo_plano: c.tipo_plano,
              imagem_url: c.imagem_url,
              tipo_servico: c.tipo_servico,
              percentual: c.percentual,
              valor_minimo: c.valor_minimo,
              valor_maximo: c.valor_maximo
            })),
            municipios: (planoAtual.municipios || []).map(m => ({
              nome: m.nome
            }))
          })
        }
      )
      if (!resp.ok) throw new Error('Erro ao atualizar carência')
      setSucesso('Carência atualizada com sucesso!')
      setEditandoCarencia(null)
      carregarCarenciasDePlano(planoSelecionadoCarencia)
    } catch (e) {
      setErro(e.message)
    }
  }

  const deletarCarencia = async carenciaId => {
    if (!confirm('Deseja realmente excluir esta carência?')) return
    if (!planoSelecionadoCarencia) return
    setErro('')
    setSucesso('')

    const planoAtual = planos.find(
      p => p.id === parseInt(planoSelecionadoCarencia)
    )
    if (!planoAtual) return

    const carenciasFiltradas = planoAtual.carencias
      .filter(c => c.id !== carenciaId)
      .map(c => ({ descricao: c.descricao, dias: c.dias }))

    try {
      const resp = await fetch(
        `${apiBase}/planos/${planoSelecionadoCarencia}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: planoAtual.nome,
            operadora_id: planoAtual.operadora_id,
            tipo_contratacao: planoAtual.tipo_contratacao,
            acomodacao: planoAtual.acomodacao,
            abrangencia: planoAtual.abrangencia,
            coparticipacao: planoAtual.coparticipacao,
            elegibilidade: planoAtual.elegibilidade || false,
            imagem_coparticipacao_url:
              planoAtual.imagem_coparticipacao_url || '',
            faixas_preco: (planoAtual.faixas || []).map(f => ({
              faixa_etaria: f.faixa_etaria,
              valor: f.valor
            })),
            hospitais: (planoAtual.hospitais || []).map(h => ({
              nome: h.nome,
              endereco: h.endereco || ''
            })),
            carencias: carenciasFiltradas,
            coparticipacoes: (planoAtual.coparticipacoes || []).map(c => ({
              id: c.id,
              nome: c.nome,
              tipo_plano: c.tipo_plano,
              imagem_url: c.imagem_url,
              tipo_servico: c.tipo_servico,
              percentual: c.percentual,
              valor_minimo: c.valor_minimo,
              valor_maximo: c.valor_maximo
            })),
            municipios: (planoAtual.municipios || []).map(m => ({
              nome: m.nome
            }))
          })
        }
      )
      if (!resp.ok) throw new Error('Erro ao deletar carência')
      setSucesso('Carência removida com sucesso!')
      carregarCarenciasDePlano(planoSelecionadoCarencia)
    } catch (e) {
      setErro(e.message)
    }
  }

  // Carregar Coparticipações de um plano específico
  const carregarCoparteDePlano = async planoId => {
    if (!planoId) return
    setLoadingCoparte(true)
    try {
      const resp = await fetch(`${apiBase}/planos/${planoId}`)
      if (!resp.ok) throw new Error('Erro ao carregar plano')
      const data = await resp.json()
      setCoparticipacoes(data.coparticipacoes || [])
    } catch (e) {
      setErro('Erro ao carregar coparticipações: ' + e.message)
    } finally {
      setLoadingCoparte(false)
    }
  }

  const adicionarNovaCoparticipacao = async dados => {
    if (!planoSelecionadoCoparte) return
    setErro('')
    setSucesso('')

    const planoAtual = planos.find(
      p => p.id === parseInt(planoSelecionadoCoparte)
    )
    if (!planoAtual) return

    const novasCoparte = [
      ...(planoAtual.coparticipacoes || []).map(c => ({
        id: c.id,
        nome: c.nome,
        tipo_plano: c.tipo_plano,
        imagem_url: c.imagem_url,
        tipo_servico: c.tipo_servico,
        percentual: c.percentual,
        valor_minimo: c.valor_minimo,
        valor_maximo: c.valor_maximo
      })),
      dados
    ]

    try {
      const resp = await fetch(`${apiBase}/planos/${planoSelecionadoCoparte}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: planoAtual.nome,
          operadora_id: planoAtual.operadora_id,
          tipo_contratacao: planoAtual.tipo_contratacao,
          acomodacao: planoAtual.acomodacao,
          abrangencia: planoAtual.abrangencia,
          coparticipacao: planoAtual.coparticipacao,
          elegibilidade: planoAtual.elegibilidade || false,
          imagem_coparticipacao_url: planoAtual.imagem_coparticipacao_url || '',
          faixas_preco: (planoAtual.faixas || []).map(f => ({
            faixa_etaria: f.faixa_etaria,
            valor: f.valor
          })),
          hospitais: (planoAtual.hospitais || []).map(h => ({
            nome: h.nome,
            endereco: h.endereco || ''
          })),
          carencias: (planoAtual.carencias || []).map(c => ({
            descricao: c.descricao,
            dias: c.dias
          })),
          coparticipacoes: novasCoparte,
          municipios: (planoAtual.municipios || []).map(m => ({ nome: m.nome }))
        })
      })
      if (!resp.ok) throw new Error('Erro ao adicionar coparticipação')
      setSucesso('Coparticipação adicionada com sucesso!')
      carregarCoparteDePlano(planoSelecionadoCoparte)
    } catch (e) {
      setErro(e.message)
    }
  }

  const atualizarCoparticipacoesItem = async (coparteId, dados) => {
    if (!planoSelecionadoCoparte) return
    setErro('')
    setSucesso('')

    const planoAtual = planos.find(
      p => p.id === parseInt(planoSelecionadoCoparte)
    )
    if (!planoAtual) return

    const coparteAtualizadas = planoAtual.coparticipacoes.map(c =>
      c.id === coparteId
        ? {
            id: c.id,
            nome: dados.nome,
            tipo_plano: c.tipo_plano,
            imagem_url: c.imagem_url,
            tipo_servico: dados.tipo_servico,
            percentual: dados.percentual,
            valor_minimo: dados.valor_minimo,
            valor_maximo: dados.valor_maximo
          }
        : {
            id: c.id,
            nome: c.nome,
            tipo_plano: c.tipo_plano,
            imagem_url: c.imagem_url,
            tipo_servico: c.tipo_servico,
            percentual: c.percentual,
            valor_minimo: c.valor_minimo,
            valor_maximo: c.valor_maximo
          }
    )

    try {
      const resp = await fetch(`${apiBase}/planos/${planoSelecionadoCoparte}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: planoAtual.nome,
          operadora_id: planoAtual.operadora_id,
          tipo_contratacao: planoAtual.tipo_contratacao,
          acomodacao: planoAtual.acomodacao,
          abrangencia: planoAtual.abrangencia,
          coparticipacao: planoAtual.coparticipacao,
          elegibilidade: planoAtual.elegibilidade || false,
          imagem_coparticipacao_url: planoAtual.imagem_coparticipacao_url || '',
          faixas_preco: (planoAtual.faixas || []).map(f => ({
            faixa_etaria: f.faixa_etaria,
            valor: f.valor
          })),
          hospitais: (planoAtual.hospitais || []).map(h => ({
            nome: h.nome,
            endereco: h.endereco || ''
          })),
          carencias: (planoAtual.carencias || []).map(c => ({
            descricao: c.descricao,
            dias: c.dias
          })),
          coparticipacoes: coparteAtualizadas,
          municipios: (planoAtual.municipios || []).map(m => ({ nome: m.nome }))
        })
      })
      if (!resp.ok) throw new Error('Erro ao atualizar coparticipação')
      setSucesso('Coparticipação atualizada com sucesso!')
      setEditandoCoparte(null)
      carregarCoparteDePlano(planoSelecionadoCoparte)
    } catch (e) {
      setErro(e.message)
    }
  }

  const deletarCoparticipacao = async coparteId => {
    if (!confirm('Deseja realmente excluir esta coparticipação?')) return
    if (!planoSelecionadoCoparte) return
    setErro('')
    setSucesso('')

    const planoAtual = planos.find(
      p => p.id === parseInt(planoSelecionadoCoparte)
    )
    if (!planoAtual) return

    const coparteFiltradas = planoAtual.coparticipacoes
      .filter(c => c.id !== coparteId)
      .map(c => ({
        id: c.id,
        nome: c.nome,
        tipo_plano: c.tipo_plano,
        imagem_url: c.imagem_url,
        tipo_servico: c.tipo_servico,
        percentual: c.percentual,
        valor_minimo: c.valor_minimo,
        valor_maximo: c.valor_maximo
      }))

    try {
      const resp = await fetch(`${apiBase}/planos/${planoSelecionadoCoparte}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: planoAtual.nome,
          operadora_id: planoAtual.operadora_id,
          tipo_contratacao: planoAtual.tipo_contratacao,
          acomodacao: planoAtual.acomodacao,
          abrangencia: planoAtual.abrangencia,
          coparticipacao: planoAtual.coparticipacao,
          elegibilidade: planoAtual.elegibilidade || false,
          imagem_coparticipacao_url: planoAtual.imagem_coparticipacao_url || '',
          faixas_preco: (planoAtual.faixas || []).map(f => ({
            faixa_etaria: f.faixa_etaria,
            valor: f.valor
          })),
          hospitais: (planoAtual.hospitais || []).map(h => ({
            nome: h.nome,
            endereco: h.endereco || ''
          })),
          carencias: (planoAtual.carencias || []).map(c => ({
            descricao: c.descricao,
            dias: c.dias
          })),
          coparticipacoes: coparteFiltradas,
          municipios: (planoAtual.municipios || []).map(m => ({ nome: m.nome }))
        })
      })
      if (!resp.ok) throw new Error('Erro ao deletar coparticipação')
      setSucesso('Coparticipação removida com sucesso!')
      carregarCoparteDePlano(planoSelecionadoCoparte)
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mensagens */}
      {erro && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
          ❌ {erro}
        </div>
      )}
      {sucesso && (
        <div className="rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
          ✅ {sucesso}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('operadoras')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'operadoras'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Operadoras
        </button>
        <button
          onClick={() => setActiveTab('planos')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'planos'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Planos
        </button>
        <button
          onClick={() => setActiveTab('carencias')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'carencias'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Carências
        </button>
        <button
          onClick={() => setActiveTab('coparticipacoes')}
          className={`px-4 py-2 font-medium transition ${
            activeTab === 'coparticipacoes'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Coparticipações
        </button>
      </div>

      {/* Tab: Operadoras */}
      {activeTab === 'operadoras' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-slate-50 p-6">
            <h3 className="text-lg font-semibold mb-4">Nova Operadora</h3>
            <form onSubmit={criarOperadora} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome *</label>
                <input
                  type="text"
                  value={novaOperadora.nome}
                  onChange={e =>
                    setNovaOperadora({ ...novaOperadora, nome: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
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
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Criar Operadora
              </button>
            </form>
          </div>

          <div className="rounded-lg bg-white shadow overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b">
              <h3 className="text-lg font-semibold">Operadoras Cadastradas</h3>
            </div>
            {loadingOperadoras ? (
              <div className="p-6 text-center">Carregando...</div>
            ) : operadoras.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                Nenhuma operadora cadastrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium">
                        Rede Credenciada
                      </th>
                      <th className="px-6 py-3 text-right text-sm font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {operadoras.map(op => (
                      <tr key={op.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm">{op.id}</td>
                        <td className="px-6 py-4">
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
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => deletarOperadora(op.id)}
                                className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Excluir
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
        <div className="space-y-6">
          <div>
            <button
              onClick={() => abrirModalPlano()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Novo Plano
            </button>
          </div>

          <div className="rounded-lg bg-white shadow overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b">
              <h3 className="text-lg font-semibold">Planos Cadastrados</h3>
            </div>
            {loadingPlanos ? (
              <div className="p-6 text-center">Carregando...</div>
            ) : planos.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                Nenhum plano cadastrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Operadora
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Acomodação
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Copart.
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {planos.map(plano => {
                      const operadora = operadoras.find(
                        o => o.id === plano.operadora_id
                      )
                      return (
                        <tr key={plano.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm">{plano.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {plano.nome}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {operadora?.nome || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {plano.tipo_contratacao}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {plano.acomodacao}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {plano.coparticipacao ? '✅' : '❌'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => abrirModalPlano(plano)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => deletarPlano(plano.id)}
                              className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              Excluir
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editandoPlano ? 'Editar Plano' : 'Novo Plano'}
              </h3>
              <button
                onClick={() => setShowModalPlano(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={salvarPlano} className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Informações Básicas</h4>

                <div className="grid grid-cols-2 gap-4">
            <>
              <div>
                <button
                  onClick={() => {
                    const descricao = prompt('Descrição da carência:')
                    const dias = prompt('Dias de carência:')
                    if (descricao && dias) {
                      adicionarNovaCarencia(descricao, dias)
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Nova Carência
                </button>
              </div>

              <div className="rounded-lg bg-white shadow overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b">
                  <h3 className="text-lg font-semibold">Carências do Plano</h3>
                </div>
                {loadingCarencias ? (
                  <div className="p-6 text-center">Carregando...</div>
                ) : carencias.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    Nenhuma carência cadastrada para este plano
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Descrição
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Dias
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {carencias.map(car => (
                          <tr key={car.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm">{car.id}</td>
                            <td className="px-4 py-3">
                              {editandoCarencia === car.id ? (
                                <input
                                  type="text"
                                  defaultValue={car.descricao}
                                  id={`desc-${car.id}`}
                                  className="w-full px-2 py-1 border rounded"
                                />
                              ) : (
                                <span>{car.descricao}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editandoCarencia === car.id ? (
                                <input
                                  type="number"
                                  defaultValue={car.dias}
                                  id={`dias-${car.id}`}
                                  className="w-24 px-2 py-1 border rounded"
                                />
                              ) : (
                                <span>{car.dias}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {editandoCarencia === car.id ? (
                                <>
                                  <button
                                    onClick={() => {
                                      const desc = document.getElementById(
                                        `desc-${car.id}`
                                      ).value
                                      const dias = document.getElementById(
                                        `dias-${car.id}`
                                      ).value
                                      atualizarCarencia(car.id, desc, dias)
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditandoCarencia(null)}
                                    className="ml-2 px-3 py-1 bg-slate-400 text-white rounded text-sm hover:bg-slate-500"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditandoCarencia(car.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => deletarCarencia(car.id)}
                                    className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                  >
                                    Excluir
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
            </>
          )}
        </div>
      )}

      {/* Tab: Coparticipações */}
      {activeTab === 'coparticipacoes' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-slate-50 p-6">
            <label className="block text-sm font-medium mb-2">
              Selecione um Plano:
            </label>
            <select
              value={planoSelecionadoCoparte}
              onChange={e => {
                setPlanoSelecionadoCoparte(e.target.value)
                carregarCoparteDePlano(e.target.value)
              }}
              className="w-full max-w-md px-3 py-2 border rounded-lg"
            >
              <option value="">Selecione um plano...</option>
              {planos.map(p => {
                const op = operadoras.find(o => o.id === p.operadora_id)
                return (
                  <option key={p.id} value={p.id}>
                    {op?.nome} - {p.nome} ({p.tipo_contratacao})
                  </option>
                )
              })}
            </select>
          </div>

          {planoSelecionadoCoparte && (
            <>
              <div>
                <button
                  onClick={() => {
                    const nome = prompt('Nome:')
                    const tipoServico = prompt('Tipo de Serviço:')
                    const percentual = prompt('Percentual:')
                    const valorMin = prompt('Valor Mínimo:')
                    const valorMax = prompt('Valor Máximo:')
                    if (nome && tipoServico) {
                      adicionarNovaCoparticipacao({
                        nome,
                        tipo_servico: tipoServico,
                        percentual: parseFloat(percentual) || 0,
                        valor_minimo: parseFloat(valorMin) || 0,
                        valor_maximo: parseFloat(valorMax) || 0
                      })
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Nova Coparticipação
                </button>
              </div>

              <div className="rounded-lg bg-white shadow overflow-hidden">
                <div className="px-6 py-4 bg-slate-50 border-b">
                  <h3 className="text-lg font-semibold">
                    Coparticipações do Plano
                  </h3>
                </div>
                {loadingCoparte ? (
                  <div className="p-6 text-center">Carregando...</div>
                ) : coparticipacoes.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    Nenhuma coparticipação cadastrada para este plano
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            ID
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Nome
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Tipo Serviço
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            %
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Mín
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium">
                            Máx
                          </th>
                          <th className="px-4 py-3 text-right text-sm font-medium">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {coparticipacoes.map(cop => (
                          <tr key={cop.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm">{cop.id}</td>
                            <td className="px-4 py-3">
                              {editandoCoparte === cop.id ? (
                                <input
                                  type="text"
                                  defaultValue={cop.nome || ''}
                                  id={`nome-cop-${cop.id}`}
                                  className="w-full px-2 py-1 border rounded"
                                />
                              ) : (
                                <span>{cop.nome || '-'}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {editandoCoparte === cop.id ? (
                                <input
                                  type="text"
                                  defaultValue={cop.tipo_servico || ''}
                                  id={`tipo-cop-${cop.id}`}
                                  className="w-full px-2 py-1 border rounded"
                                />
                              ) : (
                                <span>{cop.tipo_servico || '-'}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editandoCoparte === cop.id ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={cop.percentual}
                                  id={`perc-cop-${cop.id}`}
                                  className="w-20 px-2 py-1 border rounded"
                                />
                              ) : (
                                <span>{cop.percentual}%</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editandoCoparte === cop.id ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={cop.valor_minimo}
                                  id={`min-cop-${cop.id}`}
                                  className="w-24 px-2 py-1 border rounded"
                                />
                              ) : (
                                <span>R$ {cop.valor_minimo?.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {editandoCoparte === cop.id ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={cop.valor_maximo}
                                  id={`max-cop-${cop.id}`}
                                  className="w-24 px-2 py-1 border rounded"
                                />
                              ) : (
                                <span>R$ {cop.valor_maximo?.toFixed(2)}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {editandoCoparte === cop.id ? (
                                <>
                                  <button
                                    onClick={() => {
                                      const dados = {
                                        nome: document.getElementById(
                                          `nome-cop-${cop.id}`
                                        ).value,
                                        tipo_servico: document.getElementById(
                                          `tipo-cop-${cop.id}`
                                        ).value,
                                        percentual: parseFloat(
                                          document.getElementById(
                                            `perc-cop-${cop.id}`
                                          ).value
                                        ),
                                        valor_minimo: parseFloat(
                                          document.getElementById(
                                            `min-cop-${cop.id}`
                                          ).value
                                        ),
                                        valor_maximo: parseFloat(
                                          document.getElementById(
                                            `max-cop-${cop.id}`
                                          ).value
                                        )
                                      }
                                      atualizarCoparticipacoesItem(
                                        cop.id,
                                        dados
                                      )
                                    }}
                                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  >
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditandoCoparte(null)}
                                    className="ml-2 px-3 py-1 bg-slate-400 text-white rounded text-sm hover:bg-slate-500"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditandoCoparte(cop.id)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() =>
                                      deletarCoparticipacao(cop.id)
                                    }
                                    className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                  >
                                    Excluir
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
            </>
          )}
        </div>
      )}

      {/* Modal Plano */}
      {showModalPlano && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editandoPlano ? 'Editar Plano' : 'Novo Plano'}
              </h3>
              <button
                onClick={() => setShowModalPlano(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
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
                      className="w-full px-3 py-2 border rounded-lg"
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
                      className="w-full px-3 py-2 border rounded-lg"
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
                      className="w-full px-3 py-2 border rounded-lg"
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
                      className="w-full px-3 py-2 border rounded-lg"
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
                      className="w-full px-3 py-2 border rounded-lg"
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
                      className="w-full px-3 py-2 border rounded-lg"
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
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
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
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
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
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
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
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    + Adicionar
                  </button>
                </div>
                {planoForm.coparticipacoes.map((cop, index) => (
                  <div key={index} className="border p-4 rounded-lg space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nome"
                        value={cop.nome || ''}
                        onChange={e =>
                          atualizarCoparticipacao(index, 'nome', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Tipo Serviço"
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
                        placeholder="Percentual"
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
                        placeholder="Valor Mínimo"
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
                        placeholder="Valor Máximo"
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
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
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
