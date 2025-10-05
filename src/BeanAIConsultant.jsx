import { useState, useEffect } from "react";
import {
  getFertilizerRecommendationFromAPI,
  getFallbackFertilizerRecommendation,
} from "../src/services/fertilizerAI";
import robotImage from "../images/magu_2.png";
//nueva implementacion
import germinacionImg from "./images/Germinacion.png";
import emergenciaImg from "./images/emergencia.png";
import hojasPrimariasImg from "./images/hojasprimarias.png";
import hojasTrifoleadaImg from "./images/hojatrifoleada.png";
import preFloracionImg from "./images/prefloracion.png";
import floracionImg from "./images/floracion.png";
import llenadoVainasImg from "./images/llenadodevainas.png";
import maduracionImg from "./images/maduracion.png";

export default function BeanAIConsultant() {
  //  const [growthDays, setGrowthDays] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingParams, setIsLoadingParams] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fertilizer, setFertilizer] = useState(null);
  const [parameters, setParameters] = useState({
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    ph: 0,
    humidity: 0,
    temperature: 0,
    sunlight: 0,
  });
  const [error, setError] = useState(null);

  // Primero calcula los días desde septiembre
  const calculateGrowthDays = () => {
    const today = new Date();
    const septemberFirst = new Date(today.getFullYear(), 8, 1); // 8 = Septiembre
    const timeDiff = today.getTime() - septemberFirst.getTime();
    const daysSinceSeptember = Math.floor(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysSinceSeptember); // Evita valores negativos
  };

  // Hook de estado (antes de usar growthDays)
  const [growthDays, setGrowthDays] = useState(calculateGrowthDays());

  // Definición de las etapas
  const growthStages = [
    { range: [1, 5], name: "Germinación", image: germinacionImg },
    { range: [5, 7], name: "Emergencia", image: emergenciaImg },
    { range: [8, 11], name: "Hojas Primarias", image: hojasPrimariasImg },
    { range: [12, 22], name: "Hojas Trifoleada", image: hojasTrifoleadaImg },
    { range: [23, 32], name: "Pre-Floración", image: preFloracionImg },
    { range: [33, 36], name: "Floración", image: floracionImg },
    { range: [37, 61], name: "Llenado de Vainas", image: llenadoVainasImg },
    { range: [61, 77], name: "Maduración", image: maduracionImg },
  ];

  // Función para determinar etapa
  const getCurrentGrowthStage = (days) => {
    const currentStage = growthStages.find(
      (stage) => days >= stage.range[0] && days <= stage.range[1]
    );
    return (
      currentStage || {
        name: "No plantado",
        image: null,
        range: [0, 0],
      }
    );
  };

  // ✅ Ahora ya puedes usar growthDays
  const currentStage = getCurrentGrowthStage(growthDays);

  // Detectar cambios en el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Actualizar fecha actual cada día
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 86400000); // Actualizar cada 24 horas

    return () => clearInterval(interval);
  }, []);

  // Obtener parámetros de la API
  const fetchParameters = async () => {
    try {
      setIsLoadingParams(true);
      setError(null);
      const response = await fetch(
        "https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/lecturas/ultima/1"
      );

      if (!response.ok) {
        throw new Error(`Error en API: ${response.status}`);
      }

      const data = await response.json();

      // Mapear los datos de la API a nuestro formato
      setParameters({
        nitrogen: data.nitrogeno || data.nitrogen || 0,
        phosphorus: data.fosforo || data.phosphorus || 0,
        potassium: data.potasio || data.potassium || 0,
        ph: data.ph || 6.5,
        humidity: data.humedad || data.humidity || 0,
        temperature: data.temperatura || data.temperature || 0,
        sunlight: data.luz_solar || data.sunlight || 0,
      });
    } catch (err) {
      console.error("Error obteniendo parámetros:", err);
      setError("Error al cargar los parámetros del sensor");

      // Valores por defecto en caso de error
      setParameters({
        nitrogen: 70,
        phosphorus: 0,
        potassium: 65,
        ph: 6.5,
        humidity: 72,
        temperature: 18,
        sunlight: 87,
      });
    } finally {
      setIsLoadingParams(false);
    }
  };

  // Cargar parámetros al montar el componente y cada 5 minutos
  useEffect(() => {
    fetchParameters();

    const interval = setInterval(() => {
      fetchParameters();
    }, 300000); // Actualizar cada 5 minutos

    return () => clearInterval(interval);
  }, []);

  const weeks = Math.floor(growthDays / 7);
  const plantSize = 50 + growthDays * 5;

  const handleConsultAI = async () => {
    setIsLoading(true);
    console.log("Iniciando consulta a la API...");

    try {
      console.log("Parámetros enviados:", parameters);
      const recommendation = await getFertilizerRecommendationFromAPI(
        parameters
      );
      console.log("Recomendación recibida de API:", recommendation);
      setFertilizer(recommendation);
    } catch (error) {
      console.error("Error obteniendo recomendación:", error);
      console.log("Usando función de respaldo...");
      setFertilizer(getFallbackFertilizerRecommendation());
    } finally {
      setIsLoading(false);
      setModalOpen(true);
    }
  };

  // Formatear fecha en español
  const formatDate = (date) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("es-ES", options);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://www.deere.com.mx/assets/images/tractors/specialty-tractors/tractor_6120eh_campo_2_large_87337f7bcf838610d09bc6ec9f3e7ae3b105a816.jpg')",
      }}
    >
      <div className="flex flex-col items-center w-full min-h-screen overflow-y-auto">
        {/* Encabezado */}
        <header className="w-full flex flex-col md:flex-row justify-center items-center py-6 text-white drop-shadow-lg bg-black/30 backdrop-blur-md px-4">
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide text-center mb-2 md:mb-0">
            Asistente IA Agrónomo
          </h1>
          <span className="text-base md:text-lg font-semibold md:ml-4">
            🌱 Cultivo de Frijol
          </span>
        </header>

        {/* Indicador de carga para parámetros */}
        {isLoadingParams && (
          <div className="w-full bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4">
            <p className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></span>
              Cargando parámetros del sensor...
            </p>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="text-center">{error}</p>
            <div className="flex justify-center mt-2">
              <button
                onClick={fetchParameters}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Contenedor principal de los tres paneles */}
        <div className="w-full flex justify-center px-4 py-6">
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Panel Izquierdo - Parámetros Actuales */}
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-green-300/40">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-green-900 drop-shadow-sm">
                  Parámetros Actuales
                </h2>
                <button
                  onClick={fetchParameters}
                  className="text-lg bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition shadow-md hover:shadow-lg"
                  title="Actualizar parámetros"
                >
                  🔄
                </button>
              </div>
              <ul className="space-y-3 md:space-y-4 text-gray-800">
                {[
                  {
                    label: "Nitrogeno (N)",
                    value: `${parameters.nitrogen} ppm`,
                    color: "text-green-700",
                    icon: "🌿",
                  },
                  {
                    label: "Fósforo (P)",
                    value: `${parameters.phosphorus} ppm`,
                    color: "text-green-700",
                    icon: "🧪",
                  },
                  {
                    label: "Potasio (K)",
                    value: `${parameters.potassium} ppm`,
                    color: "text-green-700",
                    icon: "⚡",
                  },
                  {
                    label: "pH del suelo",
                    value: parameters.ph,
                    color:
                      parameters.ph > 7 ? "text-red-600" : "text-green-700",
                    icon: "📊",
                  },
                  {
                    label: "Humedad",
                    value: `${parameters.humidity}%`,
                    color:
                      parameters.humidity < 60
                        ? "text-red-600"
                        : "text-blue-600",
                    icon: "💧",
                  },
                  {
                    label: "Temperatura",
                    value: `${parameters.temperature}°C`,
                    color:
                      parameters.temperature > 30
                        ? "text-red-600"
                        : "text-blue-600",
                    icon: "🌡️",
                  },
                  {
                    label: "Luz solar",
                    value: `${parameters.sunlight}%`,
                    color:
                      parameters.sunlight < 70
                        ? "text-yellow-600"
                        : "text-yellow-700",
                    icon: "☀️",
                  },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center py-1 md:py-0"
                  >
                    <span className="text-lg md:text-xl flex items-center">
                      <span className="mr-3 text-2xl">{item.icon}</span>
                      {item.label}
                    </span>
                    <span
                      className={`font-bold ${item.color} text-lg md:text-xl`}
                    >
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-sm text-gray-500 text-center">
                Última actualización: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {/* Centro - Robot Agrónomo */}
            <div className="bg-white/90 backdrop-blur-md p-5 md:p-6 flex flex-col items-center justify-center rounded-2xl shadow-xl border border-blue-300/40 hover:scale-105 transition-transform duration-300 order-first md:order-none relative">
              {/* Mensaje flotante del robot */}
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
                  <span className="text-sm font-semibold">
                    ¡Holaaaa!!!! Hoy {formatDate(currentDate)}, ¿en qué puedo
                    ayudarte?
                  </span>
                </div>
              </div>

              <div className="relative mt-8">
                <img
                  src={robotImage}
                  alt="Robot Agrónomo"
                  className="w-44 h-44 md:w-60 md:h-60 mb-6 transition-transform duration-500 hover:rotate-3"
                />
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-sm font-bold py-2 px-3 rounded-full">
                  Mi nombre es Tortuguín
                </div>
              </div>

              {isLoading ? (
                <div className="w-full flex flex-col items-center justify-center py-5">
                  <div className="w-14 h-14 border-4 border-[#004d00] border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-[#004d00] font-semibold text-center text-lg">
                    Consultando IA...
                  </p>
                  <p className="text-gray-600 text-base mt-2">
                    Analizando parámetros del suelo
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleConsultAI}
                  disabled={isLoading || isLoadingParams}
                  className="w-full px-5 py-4 bg-gradient-to-b from-[#006400] to-[#004d00] text-[#a0ffa0] font-black text-lg md:text-xl rounded-xl shadow-[0_0_8px_#004d00,0_0_15px_#006600,0_0_25px_#00cc00] 
                  transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_12px_#004d00,0_0_20px_#006600,0_0_35px_#00ff00] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Consultar IA
                </button>
              )}
            </div>

            {/* Panel Derecho */}
            <div className="bg-white/90 backdrop-blur-md p-5 md:p-6 flex flex-col items-center rounded-2xl shadow-xl border border-yellow-200/50">
              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-5 text-yellow-700 drop-shadow-sm">
                Crecimiento del Cultivo
              </h2>

              <div className="w-full flex flex-col items-center mb-5 md:mb-6">
                {/* Dynamic growth stage image */}
                {currentStage.image ? (
                  <img
                    src={currentStage.image}
                    alt={currentStage.name}
                    className="w-32 h-32 md:w-40 md:h-40 object-contain mb-4 transition-all duration-500"
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}

                <div className="text-center mb-4 space-y-2">
                  <p className="text-lg md:text-xl font-bold text-green-900">
                    {currentStage.name}
                  </p>
                  <p className="text-base text-green-800">
                    Días desde Septiembre 1: {growthDays}
                  </p>
                  <p className="text-sm text-gray-600">
                    Rango: {currentStage.range[0]} - {currentStage.range[1]}{" "}
                    días
                  </p>
                  <p className="text-base text-green-900">
                    Semanas: {Math.floor(growthDays / 7)}
                  </p>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-5 text-green-900 drop-shadow-sm">
                Recomendaciones Generales
              </h2>
              <ul className="space-y-2 md:space-y-3 text-green-800 font-medium text-base md:text-lg w-full">
                <li className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="mr-3 text-xl">💧</span>
                  <span>Regar el cultivo en 2 días</span>
                </li>
                <li className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="mr-3 text-xl">🌱</span>
                  <span>Añadir fertilizante según necesidad</span>
                </li>
                <li className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="mr-3 text-xl">☀️</span>
                  <span>Revisar exposición solar</span>
                </li>
                <li className="flex items-center p-3 bg-green-50 rounded-lg">
                  <span className="mr-3 text-xl">🫘</span>
                  <span>Momento óptimo para sembrar más frijol</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Efecto de neumática agrícola en la parte inferior */}
        <div className="w-full bg-black/40 backdrop-blur-md rounded-t-2xl p-4 text-center mt-auto">
          <p className="text-white text-base md:text-lg">
            💡 Consejo: Consulta regularmente con el Agrónomo IA para optimizar
            tu cultivo
          </p>
        </div>
      </div>

      {/* Modal de Recomendación - CORREGIDO CON NUEVOS CAMPOS */}
      {modalOpen && fertilizer && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-gradient-to-b from-white to-green-50 p-4 md:p-6 rounded-2xl w-full max-w-md md:max-w-2xl mx-auto shadow-2xl border-2 border-green-300 animate-scaleIn my-8 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-green-800">
                📋 Recomendación de Fertilizante
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-red-500 hover:text-red-700 text-xl bg-red-100 p-2 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 md:space-y-4 overflow-y-auto">
              {/* Diagnóstico */}
              {fertilizer.diagnostico && (
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-semibold text-blue-700 text-base md:text-lg flex items-center">
                    <span className="mr-2">🔍</span>
                    Diagnóstico:
                  </h3>
                  <p className="text-sm md:text-base text-blue-800 mt-1">
                    {fertilizer.diagnostico}
                  </p>
                </div>
              )}

              {/* Campos principales */}
              {[
                {
                  label: "Recomendación",
                  value: fertilizer.nombre_recomendacion || fertilizer.name,
                  icon: "📝",
                },
                {
                  label: "Dosis por manzana",
                  value: fertilizer.dosis_manzana || fertilizer.dose,
                  icon: "⚖️",
                },
                {
                  label: "Producto sugerido",
                  value: fertilizer.producto_sugerido || fertilizer.form,
                  icon: "🔬",
                },
                {
                  label: "Esquema de aplicación",
                  value: fertilizer.esquema_aplicacion || fertilizer.schedule,
                  icon: "⏰",
                },
                {
                  label: "Eficacia esperada",
                  value:
                    fertilizer.eficacia_esperada || fertilizer.effectiveness,
                  icon: "📈",
                },
                {
                  label: "Precio aproximado",
                  value: fertilizer.precio_aproximado || fertilizer.price,
                  icon: "💰",
                },
              ].map(
                (item, index) =>
                  item.value && (
                    <div
                      key={index}
                      className="flex items-start border-b border-green-100 pb-2"
                    >
                      <span className="mr-2 text-green-700 text-lg">
                        {item.icon}
                      </span>
                      <div className="flex-1">
                        <span className="font-semibold text-green-700 text-sm md:text-base">
                          {item.label}:
                        </span>
                        <span className="ml-2 text-sm md:text-base">
                          {item.value}
                        </span>
                      </div>
                    </div>
                  )
              )}

              {/* Beneficios técnicos */}
              <div className="pt-2">
                <h3 className="font-semibold text-green-700 text-base md:text-lg flex items-center">
                  <span className="mr-2">✅</span>
                  Beneficios Técnicos:
                </h3>
                <ul className="mt-2 space-y-1 pl-4 md:pl-6">
                  {(
                    fertilizer.beneficios_tecnicos ||
                    fertilizer.benefits ||
                    []
                  ).map((beneficio, index) => (
                    <li
                      key={index}
                      className="text-xs md:text-sm text-green-800 list-disc"
                    >
                      {beneficio}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Precauciones */}
              <div className="pt-2">
                <h3 className="font-semibold text-red-700 text-base md:text-lg flex items-center">
                  <span className="mr-2">⚠️</span>
                  Precauciones:
                </h3>
                <ul className="mt-2 space-y-1 pl-4 md:pl-6">
                  {(
                    fertilizer.precauciones ||
                    fertilizer.disadvantages ||
                    []
                  ).map((precaucion, index) => (
                    <li
                      key={index}
                      className="text-xs md:text-sm text-red-800 list-disc"
                    >
                      {precaucion}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recomendaciones complementarias */}
              {fertilizer.recomendaciones_complementarias && (
                <div className="pt-2">
                  <h3 className="font-semibold text-purple-700 text-base md:text-lg flex items-center">
                    <span className="mr-2">💡</span>
                    Recomendaciones Complementarias:
                  </h3>
                  <ul className="mt-2 space-y-1 pl-4 md:pl-6">
                    {fertilizer.recomendaciones_complementarias.map(
                      (recomendacion, index) => (
                        <li
                          key={index}
                          className="text-xs md:text-sm text-purple-800 list-disc"
                        >
                          {recomendacion}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {/* Enlace (si está disponible) */}
              {fertilizer.link && (
                <div className="flex items-start pt-2">
                  <span className="mr-2 text-green-700 text-lg">🔗</span>
                  <div className="flex-1">
                    <span className="font-semibold text-green-700 text-sm md:text-base">
                      Enlace:
                    </span>
                    <a
                      href={fertilizer.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 underline break-all text-xs md:text-sm"
                    >
                      Ver producto recomendado
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 md:mt-6 flex justify-center">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors font-semibold text-sm md:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Efectos de animación CSS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
            40% {transform: translateY(-10px);}
            60% {transform: translateY(-5px);}
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
          .animate-scaleIn {
            animation: scaleIn 0.3s ease-out;
          }
          .animate-bounce {
            animation: bounce 2s infinite;
          }
        `}
      </style>
    </div>
  );
}
