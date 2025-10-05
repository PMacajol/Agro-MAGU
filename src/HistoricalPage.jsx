import { useState, useEffect } from "react";

export default function HistoricalPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("3meses");
  const [isLoading, setIsLoading] = useState(true);
  const [historicalData, setHistoricalData] = useState(null);
  const [error, setError] = useState(null);

  // Función para obtener datos de la API
  const fetchHistoricalData = async (periodo) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/lecturas/historico/1/${periodo}`
      );

      if (!response.ok) {
        throw new Error(`Error en API: ${response.status}`);
      }

      const data = await response.json();

      // Transformar los datos recibidos al formato esperado
      const transformedData = transformApiData(data);
      setHistoricalData(transformedData);
    } catch (err) {
      console.error("Error obteniendo datos históricos:", err);
      setError(`Error al cargar los datos históricos: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para transformar los datos de la API al formato esperado
  const transformApiData = (apiData) => {
    if (!apiData || apiData.length === 0) return null;

    // Extraer fechas y datos para cada parámetro
    const fechas = apiData.map((item) => item.fecha);

    const resumen = {
      nitrogeno: {
        nombre: "Nitrógeno",
        unidad: "mg/kg",
        icono: "🌱",
        color: "#4A6B2A",
        valor_actual: apiData[apiData.length - 1].nitrogeno,
        valor_anterior:
          apiData.length > 1
            ? apiData[apiData.length - 2].nitrogeno
            : apiData[0].nitrogeno,
        datos_grafica: apiData.map((item) => item.nitrogeno),
        descripcion: "Niveles de nitrógeno en el suelo",
      },
      fosforo: {
        nombre: "Fósforo",
        unidad: "mg/kg",
        icono: "⚡",
        color: "#6B9EBF",
        valor_actual: apiData[apiData.length - 1].fosforo,
        valor_anterior:
          apiData.length > 1
            ? apiData[apiData.length - 2].fosforo
            : apiData[0].fosforo,
        datos_grafica: apiData.map((item) => item.fosforo),
        descripcion: "Niveles de fósforo en el suelo",
      },
      potasio: {
        nombre: "Potasio",
        unidad: "mg/kg",
        icono: "⚖️",
        color: "#E8C662",
        valor_actual: apiData[apiData.length - 1].potasio,
        valor_anterior:
          apiData.length > 1
            ? apiData[apiData.length - 2].potasio
            : apiData[0].potasio,
        datos_grafica: apiData.map((item) => item.potasio),
        descripcion: "Niveles de potasio en el suelo",
      },
      ph: {
        nombre: "pH",
        unidad: "",
        icono: "🧪",
        color: "#8B7BD8",
        valor_actual: apiData[apiData.length - 1].ph,
        valor_anterior:
          apiData.length > 1 ? apiData[apiData.length - 2].ph : apiData[0].ph,
        datos_grafica: apiData.map((item) => item.ph),
        descripcion: "Nivel de pH del suelo",
      },
      humedad: {
        nombre: "Humedad",
        unidad: "%",
        icono: "💧",
        color: "#5DADE2",
        valor_actual: apiData[apiData.length - 1].humedad,
        valor_anterior:
          apiData.length > 1
            ? apiData[apiData.length - 2].humedad
            : apiData[0].humedad,
        datos_grafica: apiData.map((item) => item.humedad),
        descripcion: "Humedad del suelo",
      },
      temperatura: {
        nombre: "Temperatura",
        unidad: "°C",
        icono: "🌡️",
        color: "#F1948A",
        valor_actual: apiData[apiData.length - 1].temperatura,
        valor_anterior:
          apiData.length > 1
            ? apiData[apiData.length - 2].temperatura
            : apiData[0].temperatura,
        datos_grafica: apiData.map((item) => item.temperatura),
        descripcion: "Temperatura del suelo",
      },
    };

    return {
      resumen,
      fechas,
      analisis: generateAnalysis(apiData),
    };
  };

  // Función para generar análisis básico
  const generateAnalysis = (data) => {
    if (!data || data.length === 0) {
      return {
        tendencias_positivas: [
          "Datos insuficientes para determinar tendencias",
        ],
        recomendaciones: ["Continuar monitoreando los niveles"],
      };
    }

    // Lógica simple de análisis - puedes mejorarla según tus necesidades
    const lastItem = data[data.length - 1];
    const firstItem = data[0];

    const tendencias = [];
    const recomendaciones = [];

    // Análisis de nitrógeno
    if (lastItem.nitrogeno > firstItem.nitrogeno) {
      tendencias.push("Nitrógeno en aumento");
    } else if (lastItem.nitrogeno < firstItem.nitrogeno) {
      tendencias.push("Nitrógeno en disminución");
      recomendaciones.push("Considerar fertilización nitrogenada");
    }

    // Análisis de pH
    if (lastItem.ph < 6.0) {
      recomendaciones.push("El pH está bajo, considerar encalado");
    } else if (lastItem.ph > 7.5) {
      recomendaciones.push("El pH está alto, considerar acidificación");
    }

    // Asegurar que haya al menos una tendencia y recomendación
    if (tendencias.length === 0) {
      tendencias.push("Tendencias estables en la mayoría de parámetros");
    }

    if (recomendaciones.length === 0) {
      recomendaciones.push("Mantener el programa de fertilización actual");
    }

    return {
      tendencias_positivas: tendencias,
      recomendaciones: recomendaciones,
    };
  };

  // Función para generar URLs de gráficas con codificación correcta
  const generateChartUrl = (parameter, data, labels, color) => {
    const chartConfig = {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: parameter,
            data: data,
            borderColor: color,
            backgroundColor: color + "20",
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: color,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: "rgba(0,0,0,0.05)",
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    };

    // Codificar correctamente la configuración para la URL
    const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig));
    return `https://quickchart.io/chart?c=${encodedConfig}&width=500&height=200`;
  };

  // Función para formatear fechas para las etiquetas de las gráficas
  const formatLabels = (fechas) => {
    return fechas.map((fecha) => {
      const date = new Date(fecha);
      return date.toLocaleDateString("es-ES", {
        month: "short",
        day: "2-digit",
      });
    });
  };

  // Función para determinar la tendencia
  const getTrendDirection = (current, previous) => {
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "stable";
  };

  // Cargar datos cuando cambie el período
  useEffect(() => {
    fetchHistoricalData(selectedPeriod);
  }, [selectedPeriod]);

  // Renderizar loading state
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg min-h-screen">
        {/* Header con selector de período siempre visible */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#4A6B2A]">
            📈 Análisis Histórico
          </h2>
          <p className="text-sm text-gray-500 mt-1 md:mt-0">
            Análisis de datos históricos y tendencias
          </p>

          <div className="mt-4 md:mt-0">
            <label htmlFor="period" className="mr-2 text-gray-700">
              Período:
            </label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6B2A]"
              disabled={isLoading}
            >
              <option value="1mes">Último mes</option>
              <option value="3meses">Últimos 3 meses</option>
              <option value="6meses">Últimos 6 meses</option>
            </select>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#4A6B2A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-[#4A6B2A]">
              Cargando datos históricos...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar error state
  if (error) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        {/* Header con selector de período */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#4A6B2A]">
            📈 Análisis Histórico
          </h2>
          <p className="text-sm text-gray-500 mt-1 md:mt-0">
            Análisis de datos históricos y tendencias
          </p>

          <div className="mt-4 md:mt-0">
            <label htmlFor="period" className="mr-2 text-gray-700">
              Período:
            </label>
            <select
              id="period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6B2A]"
            >
              <option value="1mes">Último mes</option>
              <option value="3meses">Últimos 3 meses</option>
              <option value="6meses">Últimos 6 meses</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        <div className="text-center">
          <div className="text-6xl text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">{error}</h2>
          <button
            onClick={() => fetchHistoricalData(selectedPeriod)}
            className="px-4 py-2 bg-[#4A6B2A] text-white rounded-lg hover:bg-[#6B9EBF] transition"
          >
            Reintentar
          </button>

          {/* Debug info */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-semibold mb-2">Información de debug:</h3>
            <p className="text-sm text-gray-600">
              Período seleccionado: {selectedPeriod}
            </p>
            <p className="text-sm text-gray-600">
              URL:
              https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/lecturas/historico/1/
              {selectedPeriod}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Validación más específica de datos
  if (!historicalData || !historicalData.resumen) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">📊</div>
          <h2 className="text-xl font-bold text-gray-600">
            No hay datos históricos disponibles
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            No se encontraron registros para el período seleccionado
          </p>
        </div>
      </div>
    );
  }

  const { resumen, fechas, analisis } = historicalData;
  const formattedLabels = fechas ? formatLabels(fechas) : [];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#4A6B2A]">
          📈 Análisis Histórico
        </h2>
        <p className="text-sm text-gray-500 mt-1 md:mt-0">
          Análisis de datos históricos y tendencias
        </p>

        <div className="mt-4 md:mt-0">
          <label htmlFor="period" className="mr-2 text-gray-700">
            Período:
          </label>
          <select
            id="period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A6B2A]"
          >
            <option value="1mes">Último mes</option>
            <option value="3meses">Últimos 3 meses</option>
            <option value="6meses">Últimos 6 meses</option>
          </select>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {resumen.nitrogeno && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {resumen.nitrogeno.icono || "🌱"}
              </span>
              <h3 className="font-semibold text-green-800">Nitrógeno</h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-green-900">
                {resumen.nitrogeno.valor_actual} {resumen.nitrogeno.unidad}
              </p>
              <p
                className={`text-sm ${
                  getTrendDirection(
                    resumen.nitrogeno.valor_actual,
                    resumen.nitrogeno.valor_anterior
                  ) === "up"
                    ? "text-green-600"
                    : getTrendDirection(
                        resumen.nitrogeno.valor_actual,
                        resumen.nitrogeno.valor_anterior
                      ) === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {getTrendDirection(
                  resumen.nitrogeno.valor_actual,
                  resumen.nitrogeno.valor_anterior
                ) === "up"
                  ? "↗"
                  : getTrendDirection(
                      resumen.nitrogeno.valor_actual,
                      resumen.nitrogeno.valor_anterior
                    ) === "down"
                  ? "↘"
                  : "→"}{" "}
                Desde {resumen.nitrogeno.valor_anterior}{" "}
                {resumen.nitrogeno.unidad}
              </p>
            </div>
          </div>
        )}

        {resumen.fosforo && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {resumen.fosforo.icono || "⚡"}
              </span>
              <h3 className="font-semibold text-blue-800">Fósforo</h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-blue-900">
                {resumen.fosforo.valor_actual} {resumen.fosforo.unidad}
              </p>
              <p
                className={`text-sm ${
                  getTrendDirection(
                    resumen.fosforo.valor_actual,
                    resumen.fosforo.valor_anterior
                  ) === "up"
                    ? "text-green-600"
                    : getTrendDirection(
                        resumen.fosforo.valor_actual,
                        resumen.fosforo.valor_anterior
                      ) === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {getTrendDirection(
                  resumen.fosforo.valor_actual,
                  resumen.fosforo.valor_anterior
                ) === "up"
                  ? "↗"
                  : getTrendDirection(
                      resumen.fosforo.valor_actual,
                      resumen.fosforo.valor_anterior
                    ) === "down"
                  ? "↘"
                  : "→"}{" "}
                Desde {resumen.fosforo.valor_anterior} {resumen.fosforo.unidad}
              </p>
            </div>
          </div>
        )}

        {resumen.potasio && (
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {resumen.potasio.icono || "⚖️"}
              </span>
              <h3 className="font-semibold text-yellow-800">Potasio</h3>
            </div>
            <div className="mt-2">
              <p className="text-2xl font-bold text-yellow-900">
                {resumen.potasio.valor_actual} {resumen.potasio.unidad}
              </p>
              <p
                className={`text-sm ${
                  getTrendDirection(
                    resumen.potasio.valor_actual,
                    resumen.potasio.valor_anterior
                  ) === "up"
                    ? "text-green-600"
                    : getTrendDirection(
                        resumen.potasio.valor_actual,
                        resumen.potasio.valor_anterior
                      ) === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {getTrendDirection(
                  resumen.potasio.valor_actual,
                  resumen.potasio.valor_anterior
                ) === "up"
                  ? "↗"
                  : getTrendDirection(
                      resumen.potasio.valor_actual,
                      resumen.potasio.valor_anterior
                    ) === "down"
                  ? "↘"
                  : "→"}{" "}
                Desde {resumen.potasio.valor_anterior} {resumen.potasio.unidad}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Renderizar gráficas solo si existen los datos */}
        {resumen.nitrogeno && (
          <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-2xl shadow-md border border-green-100">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">
                {resumen.nitrogeno.icono || "🌱"}
              </span>
              <h3 className="text-lg font-semibold text-green-800">
                {resumen.nitrogeno.nombre || "Nitrógeno"}
              </h3>
            </div>
            {resumen.nitrogeno.datos_grafica && formattedLabels.length > 0 ? (
              <img
                src={generateChartUrl(
                  resumen.nitrogeno.nombre || "Nitrógeno",
                  resumen.nitrogeno.datos_grafica,
                  formattedLabels,
                  resumen.nitrogeno.color || "#4A6B2A"
                )}
                alt="Gráfica Nitrógeno"
                className="rounded-lg w-full h-48 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x200/4A6B2A/FFFFFF?text=Error+cargando+gráfica";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Sin datos para mostrar</p>
              </div>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <p>
                {resumen.nitrogeno.descripcion ||
                  "Monitoreo de niveles de nitrógeno"}
              </p>
            </div>
          </div>
        )}

        {resumen.fosforo && (
          <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl shadow-md border border-blue-100">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">
                {resumen.fosforo.icono || "⚡"}
              </span>
              <h3 className="text-lg font-semibold text-blue-800">
                {resumen.fosforo.nombre || "Fósforo"}
              </h3>
            </div>
            {resumen.fosforo.datos_grafica && formattedLabels.length > 0 ? (
              <img
                src={generateChartUrl(
                  resumen.fosforo.nombre || "Fósforo",
                  resumen.fosforo.datos_grafica,
                  formattedLabels,
                  resumen.fosforo.color || "#6B9EBF"
                )}
                alt="Gráfica Fósforo"
                className="rounded-lg w-full h-48 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x200/6B9EBF/FFFFFF?text=Error+cargando+gráfica";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Sin datos para mostrar</p>
              </div>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <p>
                {resumen.fosforo.descripcion ||
                  "Monitoreo de niveles de fósforo"}
              </p>
            </div>
          </div>
        )}

        {resumen.potasio && (
          <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-2xl shadow-md border border-yellow-100">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">
                {resumen.potasio.icono || "⚖️"}
              </span>
              <h3 className="text-lg font-semibold text-yellow-800">
                {resumen.potasio.nombre || "Potasio"}
              </h3>
            </div>
            {resumen.potasio.datos_grafica && formattedLabels.length > 0 ? (
              <img
                src={generateChartUrl(
                  resumen.potasio.nombre || "Potasio",
                  resumen.potasio.datos_grafica,
                  formattedLabels,
                  resumen.potasio.color || "#E8C662"
                )}
                alt="Gráfica Potasio"
                className="rounded-lg w-full h-48 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x200/E8C662/FFFFFF?text=Error+cargando+gráfica";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Sin datos para mostrar</p>
              </div>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <p>
                {resumen.potasio.descripcion ||
                  "Monitoreo de niveles de potasio"}
              </p>
            </div>
          </div>
        )}

        {resumen.ph && (
          <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-2xl shadow-md border border-purple-100">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">{resumen.ph.icono || "🧪"}</span>
              <h3 className="text-lg font-semibold text-purple-800">
                {resumen.ph.nombre || "pH"}
              </h3>
            </div>
            {resumen.ph.datos_grafica && formattedLabels.length > 0 ? (
              <img
                src={generateChartUrl(
                  resumen.ph.nombre || "pH",
                  resumen.ph.datos_grafica,
                  formattedLabels,
                  resumen.ph.color || "#8B7BD8"
                )}
                alt="Gráfica pH"
                className="rounded-lg w-full h-48 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x200/8B7BD8/FFFFFF?text=Error+cargando+gráfica";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Sin datos para mostrar</p>
              </div>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <p>{resumen.ph.descripcion || "Monitoreo del pH del suelo"}</p>
            </div>
          </div>
        )}

        {resumen.humedad && (
          <div className="bg-gradient-to-br from-cyan-50 to-white p-4 rounded-2xl shadow-md border border-cyan-100">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">
                {resumen.humedad.icono || "💧"}
              </span>
              <h3 className="text-lg font-semibold text-cyan-800">
                {resumen.humedad.nombre || "Humedad"}
              </h3>
            </div>
            {resumen.humedad.datos_grafica && formattedLabels.length > 0 ? (
              <img
                src={generateChartUrl(
                  resumen.humedad.nombre || "Humedad",
                  resumen.humedad.datos_grafica,
                  formattedLabels,
                  resumen.humedad.color || "#5DADE2"
                )}
                alt="Gráfica Humedad"
                className="rounded-lg w-full h-48 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x200/5DADE2/FFFFFF?text=Error+cargando+gráfica";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Sin datos para mostrar</p>
              </div>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <p>
                {resumen.humedad.descripcion ||
                  "Monitoreo de la humedad del suelo"}
              </p>
            </div>
          </div>
        )}

        {resumen.temperatura && (
          <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-2xl shadow-md border border-red-100">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">
                {resumen.temperatura.icono || "🌡️"}
              </span>
              <h3 className="text-lg font-semibold text-red-800">
                {resumen.temperatura.nombre || "Temperatura"}
              </h3>
            </div>
            {resumen.temperatura.datos_grafica && formattedLabels.length > 0 ? (
              <img
                src={generateChartUrl(
                  resumen.temperatura.nombre || "Temperatura",
                  resumen.temperatura.datos_grafica,
                  formattedLabels,
                  resumen.temperatura.color || "#F1948A"
                )}
                alt="Gráfica Temperatura"
                className="rounded-lg w-full h-48 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/500x200/F1948A/FFFFFF?text=Error+cargando+gráfica";
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                <p className="text-gray-500">Sin datos para mostrar</p>
              </div>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <p>
                {resumen.temperatura.descripcion ||
                  "Monitoreo de la temperatura del suelo"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resumen general */}
      {analisis && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
          <h3 className="text-xl font-semibold text-[#4A6B2A] mb-4">
            📊 Resumen de Tendencia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Tendencias positivas:
              </h4>
              <ul className="list-disc list-inside text-green-700">
                {analisis.tendencias_positivas &&
                analisis.tendencias_positivas.length > 0 ? (
                  analisis.tendencias_positivas.map((tendencia, index) => (
                    <li key={index}>{tendencia}</li>
                  ))
                ) : (
                  <li>Datos insuficientes para determinar tendencias</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Recomendaciones:
              </h4>
              <ul className="list-disc list-inside text-blue-700">
                {analisis.recomendaciones &&
                analisis.recomendaciones.length > 0 ? (
                  analisis.recomendaciones.map((recomendacion, index) => (
                    <li key={index}>{recomendacion}</li>
                  ))
                ) : (
                  <li>Continuar monitoreando los niveles</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
