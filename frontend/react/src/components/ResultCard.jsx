import { useState } from 'react'

export default function ResultCard({
  plano,
  onDownload,
  darkMode = false,
  accentTheme
}) {
  const [expanded, setExpanded] = useState(false)
  const [aplicarDesconto, setAplicarDesconto] = useState(false)
  const [percentualDesconto, setPercentualDesconto] = useState(0)

  const calcularDesconto = valor => {
    const pct = Number(percentualDesconto) || 0
    if (!aplicarDesconto || pct <= 0) return valor
    const desconto = (valor * pct) / 100
    return Math.max(0, valor - desconto)
  }

  const totalComDesconto = (() => {
    if (!plano?.beneficiarios || plano.beneficiarios.length === 0) {
      return Number(plano.preco_total) || 0
    }
    return plano.beneficiarios.reduce(
      (acc, ben) => acc + calcularDesconto(Number(ben.valor) || 0),
      0
    )
  })()

  return (
    <div
      className={`rounded-2xl p-6 border transition-smooth hover:shadow-lg-refined ${
        darkMode
          ? 'border-slate-700 bg-slate-800 shadow-soft'
          : 'border-slate-200 bg-white shadow-soft'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div
            className={`inline-block text-white text-xs font-bold px-4 py-1.5 rounded-full mb-3 transition-smooth ${
              accentTheme?.button || 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {plano.operadora}
          </div>
          <h4
            className={`text-xl font-bold mb-2 leading-tight ${
              darkMode ? 'text-slate-100' : 'text-gray-900'
            }`}
          >
            {plano.plano}
          </h4>
          <p
            className={`text-sm leading-relaxed ${
              darkMode ? 'text-slate-400' : 'text-gray-600'
            }`}
          >
            Plano de Saúde
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div
            className={`text-right text-white rounded-2xl p-5 shadow-md-refined transition-smooth ${
              accentTheme?.button || 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">
              Valor total
            </p>
            <p className="text-3xl font-bold mt-2 leading-none">
              {Number(plano.preco_total).toFixed(2).replace('.', ',')}
            </p>
            <p className="text-xs opacity-90 mt-1">por mês</p>
          </div>
          {onDownload && (
            <button
              onClick={() =>
                onDownload({
                  descontoPercentual: aplicarDesconto
                    ? Number(percentualDesconto) || 0
                    : 0
                })
              }
              className={
                'inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white rounded-full transition-smooth shadow-md-refined bg-red-600 hover:bg-red-700 hover:shadow-lg focus-ring active:scale-95 btn-shine hover:scale-110'
              }
            >
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Baixar PDF
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div
          className={`pt-6 mt-4 space-y-6 border-t-2 transition-smooth ${
            darkMode ? 'border-slate-700' : 'border-blue-100'
          }`}
        >
          <div
            className={`rounded-xl p-4 border transition-smooth ${
              darkMode
                ? 'bg-slate-700/50 border-slate-600 hover:bg-slate-700/70'
                : 'bg-blue-50 border-blue-200 hover:bg-blue-100/50'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className={`h-5 w-5 rounded border-slate-400 ${
                    accentTheme?.check || 'text-blue-500 focus:ring-blue-500'
                  }`}
                  checked={aplicarDesconto}
                  onChange={e => setAplicarDesconto(e.target.checked)}
                />
                <span
                  className={darkMode ? 'text-slate-200' : 'text-slate-800'}
                >
                  Aplicar desconto por porcentagem
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={!aplicarDesconto}
                  value={percentualDesconto}
                  onChange={e => setPercentualDesconto(e.target.value)}
                  className={`w-24 px-3 py-2 rounded-xl text-sm border transition-smooth focus-ring ${
                    darkMode
                      ? 'bg-slate-900 text-slate-100 border-slate-700 hover:border-slate-500'
                      : 'bg-white text-slate-800 border-slate-300 hover:border-slate-400'
                  }`}
                  placeholder="%"
                />
                <span
                  className={`text-sm font-medium ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  por vida
                </span>
              </div>
            </div>
            <p
              className={`mt-3 text-xs leading-relaxed ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Informe o percentual para aplicar sobre cada vida. Ex.: 10%.
            </p>
          </div>
          {plano.beneficiarios?.length > 0 && (
            <div className="space-y-3">
              <h5
                className={`text-sm font-bold flex items-center gap-2 ${
                  darkMode ? 'text-slate-200' : 'text-gray-800'
                }`}
              >
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    darkMode
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  👥 {plano.beneficiarios.length} Beneficiário(s)
                </span>
              </h5>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                {plano.beneficiarios.map((ben, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 text-center transition-smooth border ${
                      darkMode
                        ? 'bg-slate-900/50 border-slate-700 hover:border-slate-500 hover:shadow-soft'
                        : 'bg-white border-blue-100 hover:border-blue-300 hover:shadow-soft'
                    }`}
                  >
                    <p
                      className={`text-xs font-bold uppercase tracking-wide ${
                        darkMode ? 'text-slate-300' : 'text-gray-700'
                      }`}
                    >
                      {ben.idade} anos
                    </p>
                    <div className="mt-2">
                      {aplicarDesconto && Number(percentualDesconto) > 0 ? (
                        <>
                          <p
                            className={`text-[11px] line-through ${
                              darkMode ? 'text-slate-500' : 'text-slate-500'
                            }`}
                          >
                            R$ {Number(ben.valor).toFixed(2).replace('.', ',')}
                          </p>
                          <p
                            className={`text-sm font-bold ${
                              accentTheme?.emphasis || 'text-blue-600'
                            }`}
                          >
                            R${' '}
                            {calcularDesconto(Number(ben.valor))
                              .toFixed(2)
                              .replace('.', ',')}
                          </p>
                        </>
                      ) : (
                        <p
                          className={`text-sm font-bold ${
                            accentTheme?.emphasis || 'text-blue-600'
                          }`}
                        >
                          R$ {Number(ben.valor).toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plano.hospitais?.length > 0 && (
            <div className="space-y-3">
              <h5
                className={`text-sm font-bold flex items-center gap-2 ${
                  darkMode ? 'text-slate-100' : 'text-gray-800'
                }`}
              >
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    darkMode
                      ? 'bg-cyan-900/30 text-cyan-200'
                      : 'bg-cyan-100 text-cyan-700'
                  }`}
                >
                  🏥 Hospitais
                </span>
              </h5>
              <div className="grid gap-2 sm:grid-cols-2">
                {plano.hospitais.map((hosp, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-4 border-2 transition-smooth shadow-soft ${
                      darkMode
                        ? 'bg-cyan-900/20 border-cyan-700/50 hover:border-cyan-600 hover:shadow-md-refined'
                        : 'bg-cyan-50 border-cyan-200 hover:border-cyan-400 hover:shadow-md-refined'
                    }`}
                  >
                    <p
                      className={`font-semibold text-sm leading-tight ${
                        darkMode ? 'text-cyan-200' : 'text-cyan-900'
                      }`}
                    >
                      {hosp.nome}
                    </p>
                    {hosp.endereco && (
                      <p
                        className={`text-xs mt-2 leading-relaxed ${
                          darkMode ? 'text-cyan-300/70' : 'text-cyan-700'
                        }`}
                      >
                        📍 {hosp.endereco}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {plano.carencias?.length > 0 && (
            <div>
              <h5
                className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                  darkMode ? 'text-slate-300' : 'text-gray-600'
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    darkMode
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  ⏱️ Carências
                </span>
              </h5>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {plano.carencias.map((car, idx) => (
                  <div
                    key={idx}
                    className={`rounded-md p-2 flex items-center gap-2 ${
                      darkMode
                        ? 'bg-slate-900 border border-slate-700'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200'
                    }`}
                  >
                    <div
                      className={`text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                        accentTheme?.button || 'bg-blue-600'
                      }`}
                    >
                      {car.dias}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs ${
                          darkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}
                      >
                        dias
                      </p>
                      <p
                        className={`font-semibold text-xs truncate ${
                          darkMode ? 'text-slate-100' : 'text-gray-900'
                        }`}
                      >
                        {car.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plano.coparticipacoes?.length > 0 && (
            <div>
              <h5
                className={`text-xs font-bold mb-2 flex items-center gap-2 ${
                  darkMode ? 'text-slate-300' : 'text-gray-600'
                }`}
              >
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    darkMode
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  💰 Coparticipações
                </span>
              </h5>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {plano.coparticipacoes.map((cop, idx) => (
                  <div
                    key={idx}
                    className={`rounded-md p-2 ${
                      darkMode
                        ? 'bg-slate-900 border border-slate-700'
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1 gap-1">
                      <p
                        className={`font-semibold text-xs leading-tight flex-1 ${
                          darkMode ? 'text-slate-100' : 'text-gray-900'
                        }`}
                      >
                        {cop.nome}
                      </p>
                      {cop.percentual && (
                        <span
                          className={`text-white text-xs font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                            accentTheme?.button || 'bg-blue-600'
                          }`}
                        >
                          {cop.percentual}%
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs mb-1 ${
                        darkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}
                    >
                      {cop.tipo_servico}
                    </p>
                    <div className="flex flex-wrap gap-1 text-xs">
                      {cop.valor_minimo && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            darkMode
                              ? 'bg-slate-900 border border-slate-700'
                              : 'bg-white border border-purple-200'
                          }`}
                        >
                          Mín: R$ {Number(cop.valor_minimo).toFixed(2)}
                        </span>
                      )}
                      {cop.valor_maximo && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            darkMode
                              ? 'bg-slate-900 border border-slate-700'
                              : 'bg-white border border-purple-200'
                          }`}
                        >
                          Máx: R$ {Number(cop.valor_maximo).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plano.municipios?.length > 0 && (
            <div>
              <h5
                className={`text-sm font-bold mb-3 flex items-center gap-2 ${
                  darkMode ? 'text-slate-100' : 'text-gray-700'
                }`}
              >
                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    darkMode
                      ? 'bg-slate-800 text-slate-200'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  📍 Municípios
                </span>
              </h5>
              <div className="flex flex-wrap gap-2">
                {plano.municipios.map((mun, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      darkMode
                        ? 'bg-slate-900 border border-slate-700 text-slate-300'
                        : 'bg-white border border-blue-200 text-gray-700'
                    }`}
                  >
                    {mun.nome}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <div
              className={`flex items-center justify-between rounded-lg p-3 ${
                darkMode
                  ? 'bg-slate-800/70 border border-slate-700'
                  : 'bg-slate-100 border border-slate-200'
              }`}
            >
              <span
                className={`${
                  darkMode ? 'text-slate-200' : 'text-slate-800'
                } text-sm font-medium`}
              >
                Total com desconto
              </span>
              <span
                className={`text-lg font-bold ${
                  accentTheme?.emphasis || 'text-blue-600'
                }`}
              >
                R$ {totalComDesconto.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full mt-6 py-3 text-white font-bold rounded-xl transition-smooth flex items-center justify-center gap-2 shadow-md-refined hover:shadow-lg-refined active:scale-95 focus-ring uppercase tracking-wide btn-shine hover:scale-105 ${
          accentTheme?.button || 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {expanded ? (
          <>
            <span>Ver Menos</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                expanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </>
        ) : (
          <>
            <span>Ver Detalhes</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                expanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>
    </div>
  )
}
