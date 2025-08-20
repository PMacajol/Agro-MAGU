import { useState, useEffect } from "react";

export default function HistoricalPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("3meses");
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Datos históricos según el período seleccionado
  const historicalData = {
    "1mes": {
      labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
      nitrogen: [40, 42, 45, 48],
      phosphorus: [28, 29, 30, 31],
      potassium: [60, 62, 65, 68],
      ph: [6.4, 6.5, 6.5, 6.6],
      humidity: [68, 70, 72, 74],
      temperature: [24, 25, 26, 25],
    },
    "3meses": {
      labels: ["Feb", "Mar", "Abr", "May"],
      nitrogen: [30, 40, 45, 50],
      phosphorus: [25, 28, 30, 32],
      potassium: [55, 60, 65, 70],
      ph: [6.2, 6.4, 6.5, 6.7],
      humidity: [65, 70, 72, 75],
      temperature: [22, 24, 25, 26],
    },
    "6meses": {
      labels: ["Nov", "Dic", "Ene", "Feb", "Mar", "Abr"],
      nitrogen: [25, 30, 35, 40, 45, 50],
      phosphorus: [20, 22, 25, 28, 30, 32],
      potassium: [50, 52, 55, 60, 65, 70],
      ph: [6.0, 6.1, 6.2, 6.4, 6.5, 6.7],
      humidity: [60, 62, 65, 70, 72, 75],
      temperature: [20, 21, 22, 24, 25, 26],
    },
  };

  const currentData = historicalData[selectedPeriod];

  // Estadísticas resumidas
  const stats = {
    nitrogen: {
      current: currentData.nitrogen[currentData.nitrogen.length - 1],
      previous: currentData.nitrogen[currentData.nitrogen.length - 2],
      trend:
        currentData.nitrogen[currentData.nitrogen.length - 1] >
        currentData.nitrogen[currentData.nitrogen.length - 2]
          ? "up"
          : "down",
    },
    phosphorus: {
      current: currentData.phosphorus[currentData.phosphorus.length - 1],
      previous: currentData.phosphorus[currentData.phosphorus.length - 2],
      trend:
        currentData.phosphorus[currentData.phosphorus.length - 1] >
        currentData.phosphorus[currentData.phosphorus.length - 2]
          ? "up"
          : "down",
    },
    potassium: {
      current: currentData.potassium[currentData.potassium.length - 1],
      previous: currentData.potassium[currentData.potassium.length - 2],
      trend:
        currentData.potassium[currentData.potassium.length - 1] >
        currentData.potassium[currentData.potassium.length - 2]
          ? "up"
          : "down",
    },
  };

  // Función para generar URLs de gráficas con codificación correcta
  const generateChartUrl = (parameter, data, color) => {
    const chartConfig = {
      type: "line",
      data: {
        labels: currentData.labels,
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

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4A6B2A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#4A6B2A]">
            Cargando datos históricos...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#4A6B2A]">
          📈 Análisis Histórico
        </h2>

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
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🌱</span>
            <h3 className="font-semibold text-green-800">Nitrógeno</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-green-900">
              {stats.nitrogen.current} ppm
            </p>
            <p
              className={`text-sm ${
                stats.nitrogen.trend === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.nitrogen.trend === "up" ? "↗" : "↘"} Desde{" "}
              {stats.nitrogen.previous} ppm
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🧪</span>
            <h3 className="font-semibold text-blue-800">Fósforo</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-blue-900">
              {stats.phosphorus.current} ppm
            </p>
            <p
              className={`text-sm ${
                stats.phosphorus.trend === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.phosphorus.trend === "up" ? "↗" : "↘"} Desde{" "}
              {stats.phosphorus.previous} ppm
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
          <div className="flex items-center">
            <span className="text-2xl mr-2">🪴</span>
            <h3 className="font-semibold text-yellow-800">Potasio</h3>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-yellow-900">
              {stats.potassium.current} ppm
            </p>
            <p
              className={`text-sm ${
                stats.potassium.trend === "up"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.potassium.trend === "up" ? "↗" : "↘"} Desde{" "}
              {stats.potassium.previous} ppm
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nitrógeno */}
        <div className="bg-gradient-to-br from-green-50 to-white p-4 rounded-2xl shadow-md border border-green-100">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🌱</span>
            <h3 className="text-lg font-semibold text-green-800">
              Nitrógeno (N)
            </h3>
          </div>
          <img
            src={generateChartUrl("Nitrógeno", currentData.nitrogen, "#4A6B2A")}
            alt="Gráfica Nitrógeno"
            className="rounded-lg w-full h-48 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/500x200/4A6B2A/FFFFFF?text=Error+cargando+gráfica";
            }}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p>
              El nitrógeno es esencial para el crecimiento vegetativo y el
              desarrollo de hojas.
            </p>
          </div>
        </div>

        {/* Fósforo */}
        <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl shadow-md border border-blue-100">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🧪</span>
            <h3 className="text-lg font-semibold text-blue-800">Fósforo (P)</h3>
          </div>
          <img
            src={generateChartUrl("Fósforo", currentData.phosphorus, "#3B82F6")}
            alt="Gráfica Fósforo"
            className="rounded-lg w-full h-48 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/500x200/3B82F6/FFFFFF?text=Error+cargando+gráfica";
            }}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p>
              El fósforo favorece el desarrollo radicular y la formación de
              flores y frutos.
            </p>
          </div>
        </div>

        {/* Potasio */}
        <div className="bg-gradient-to-br from-yellow-50 to-white p-4 rounded-2xl shadow-md border border-yellow-100">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🪴</span>
            <h3 className="text-lg font-semibold text-yellow-800">
              Potasio (K)
            </h3>
          </div>
          <img
            src={generateChartUrl("Potasio", currentData.potassium, "#EAB308")}
            alt="Gráfica Potasio"
            className="rounded-lg w-full h-48 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/500x200/EAB308/FFFFFF?text=Error+cargando+gráfica";
            }}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p>
              El potasio mejora la resistencia a enfermedades y la calidad de
              los frutos.
            </p>
          </div>
        </div>

        {/* pH */}
        <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-2xl shadow-md border border-purple-100">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">⚗️</span>
            <h3 className="text-lg font-semibold text-purple-800">
              pH del suelo
            </h3>
          </div>
          <img
            src={generateChartUrl("pH", currentData.ph, "#8B5CF6")}
            alt="Gráfica pH"
            className="rounded-lg w-full h-48 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/500x200/8B5CF6/FFFFFF?text=Error+cargando+gráfica";
            }}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p>
              El pH afecta la disponibilidad de nutrientes para las plantas.
            </p>
          </div>
        </div>

        {/* Humedad */}
        <div className="bg-gradient-to-br from-cyan-50 to-white p-4 rounded-2xl shadow-md border border-cyan-100">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">💧</span>
            <h3 className="text-lg font-semibold text-cyan-800">Humedad (%)</h3>
          </div>
          <img
            src={generateChartUrl("Humedad", currentData.humidity, "#06B6D4")}
            alt="Gráfica Humedad"
            className="rounded-lg w-full h-48 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/500x200/06B6D4/FFFFFF?text=Error+cargando+gráfica";
            }}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p>
              La humedad del suelo es crucial para la absorción de nutrientes.
            </p>
          </div>
        </div>

        {/* Temperatura */}
        <div className="bg-gradient-to-br from-red-50 to-white p-4 rounded-2xl shadow-md border border-red-100">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">🌡️</span>
            <h3 className="text-lg font-semibold text-red-800">
              Temperatura (°C)
            </h3>
          </div>
          <img
            src={generateChartUrl(
              "Temperatura",
              currentData.temperature,
              "#EF4444"
            )}
            alt="Gráfica Temperatura"
            className="rounded-lg w-full h-48 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://via.placeholder.com/500x200/EF4444/FFFFFF?text=Error+cargando+gráfica";
            }}
          />
          <div className="mt-3 text-sm text-gray-600">
            <p>
              La temperatura afecta los procesos metabólicos de las plantas.
            </p>
          </div>
        </div>
      </div>

      {/* Resumen general */}
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
              <li>El nitrógeno ha aumentado consistentemente</li>
              <li>Los niveles de potasio se mantienen óptimos</li>
              <li>La humedad del suelo muestra mejora</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Recomendaciones:</h4>
            <ul className="list-disc list-inside text-blue-700">
              <li>Mantener el programa de fertilización actual</li>
              <li>Monitorear el pH regularmente</li>
              <li>Ajustar riego según la temporada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
