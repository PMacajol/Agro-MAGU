import { useState, useEffect } from "react";
import robotImage from "../images/magu_2.png";

export default function BeanAIConsultant() {
  const [growthDays, setGrowthDays] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const parameters = {
    nitrogen: 45,
    phosphorus: 30,
    potassium: 65,
    ph: 6.5,
    humidity: 72,
    temperature: 25,
    sunlight: 87,
  };

  const weeks = Math.floor(growthDays / 7);
  const plantSize = 50 + growthDays * 5;

  const getFertilizerRecommendation = () => {
    return {
      name: "Fertilizante NPK 20-10-20",
      dose: "25 kg por tonelada de cultivo",
      link: "https://www.agroservicios.com.gt/fertilizante-npk-20-10-20",
      price: "Q500 por bolsa de 50kg",
      form: "Tronqueado",
      schedule: "Aplicar en la mañana o al final de la tarde",
      effectiveness: "90% en suelos con pH 6.0-7.0",
      benefits: [
        "Aumenta el rendimiento hasta un 30%",
        "Mejora la resistencia a plagas y enfermedades",
        "Favorece el desarrollo radicular",
        "Mejora la calidad nutricional del frijol",
        "Aumenta la tolerancia a sequía",
      ],
      disadvantages: [
        "Sin fertilización, el rendimiento puede disminuir hasta un 40%",
        "Mayor susceptibilidad a plagas como la mosca blanca",
        "Deficiencias nutricionales que afectan el crecimiento",
        "Menor producción de vainas por planta",
        "Granos de menor tamaño y valor comercial",
      ],
    };
  };

  const handleConsultAI = () => {
    setIsLoading(true);
    // Simular tiempo de consulta a la IA
    setTimeout(() => {
      setIsLoading(false);
      setModalOpen(true);
    }, 2000);
  };

  const fertilizer = getFertilizerRecommendation();

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
      className="min-h-screen flex flex-col items-center p-4 md:p-6 bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://www.deere.com.mx/assets/images/tractors/specialty-tractors/tractor_6120eh_campo_2_large_87337f7bcf838610d09bc6ec9f3e7ae3b105a816.jpg')",
      }}
    >
      {/* Encabezado */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-center items-center mb-4 md:mb-6 text-white drop-shadow-lg bg-black/30 backdrop-blur-md p-4 rounded-2xl">
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide text-center mb-2 md:mb-0">
          Asistente IA Agrónomo
        </h1>
        <span className="text-base md:text-lg font-semibold md:ml-4">
          🌱 Cultivo de Frijol
        </span>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Panel Izquierdo */}
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-green-300/40">
          <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-green-900 drop-shadow-sm">
            Parámetros Actuales
          </h2>
          <ul className="space-y-2 md:space-y-3 text-gray-800">
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
                color: parameters.ph > 7 ? "text-red-600" : "text-green-700",
                icon: "📊",
              },
              {
                label: "Humedad",
                value: `${parameters.humidity}%`,
                color:
                  parameters.humidity < 60 ? "text-red-600" : "text-blue-600",
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
                <span className="text-sm md:text-base flex items-center">
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </span>
                <span
                  className={`font-bold ${item.color} text-sm md:text-base`}
                >
                  {item.value}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Centro - Robot Agrónomo */}
        <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 flex flex-col items-center justify-center rounded-2xl shadow-xl border border-blue-300/40 hover:scale-105 transition-transform duration-300 order-first md:order-none relative">
          {/* Mensaje flotante del robot */}
          <div className="absolute -top-4 left-0 right-0 flex justify-center">
            <div className="bg-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
              <span className="text-sm font-semibold">
                ¡Holaaaa!!!! Hoy {formatDate(currentDate)}, ¿en qué puedo
                ayudarte?
              </span>
            </div>
          </div>

          <div className="relative mt-6">
            <img
              src={robotImage}
              alt="Robot Agrónomo"
              className="w-40 h-40 md:w-56 md:h-56 mb-4 transition-transform duration-500 hover:rotate-3"
            />
            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold py-1 px-2 rounded-full">
              Mi nombre es Tortuguín
            </div>
          </div>

          {isLoading ? (
            <div className="w-full flex flex-col items-center justify-center py-4">
              <div className="w-12 h-12 border-4 border-[#004d00] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-[#004d00] font-semibold text-center">
                Consultando IA...
              </p>
              <p className="text-gray-600 text-sm mt-1">
                Analizando parámetros del suelo
              </p>
            </div>
          ) : (
            <button
              onClick={handleConsultAI}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-b from-[#006400] to-[#004d00] text-[#a0ffa0] font-black text-base md:text-lg rounded-xl shadow-[0_0_8px_#004d00,0_0_15px_#006600,0_0_25px_#00cc00] 
              transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_12px_#004d00,0_0_20px_#006600,0_0_35px_#00ff00] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              Consultar IA
            </button>
          )}
        </div>

        {/* Panel Derecho */}
        <div className="bg-white/80 backdrop-blur-md p-4 md:p-6 flex flex-col items-center rounded-2xl shadow-xl border border-yellow-200/50">
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-yellow-700 drop-shadow-sm">
            Crecimiento del Cultivo
          </h2>
          <div className="w-full flex flex-col items-center mb-4 md:mb-6">
            <div
              style={{
                width: `${Math.min(plantSize, isMobile ? 80 : 120)}px`,
                height: `${Math.min(plantSize, isMobile ? 80 : 120)}px`,
                background:
                  "radial-gradient(circle at 30% 30%, #8BAE68, #4A6B2A)",
              }}
              className="rounded-t-full transition-all duration-500 shadow-[0_0_20px_#4A6B2A] mb-3"
            />
            <div className="text-center mb-3">
              <span className="text-xs md:text-sm text-green-900 block">
                Días de crecimiento: {growthDays}
              </span>
              <span className="text-xs md:text-sm text-green-900 block">
                Semanas: {weeks} | Tamaño: {plantSize}px
              </span>
            </div>
            <button
              onClick={() => setGrowthDays(growthDays + 1)}
              className="w-full px-4 py-2 md:py-3 bg-gradient-to-r from-yellow-500 to-yellow-300 text-white font-black text-sm md:text-base rounded-xl 
              shadow-[0_0_8px_#E8C662,0_0_15px_#FFD966,0_0_25px_#FFF080] 
              transition-all duration-300 transform hover:scale-105 
              hover:shadow-[0_0_12px_#E8C662,0_0_20px_#FFD966,0_0_35px_#FFF080] cursor-pointer"
            >
              Avanzar un día
            </button>
          </div>

          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-green-900 drop-shadow-sm">
            Recomendaciones Generales
          </h2>
          <ul className="space-y-1 md:space-y-2 text-green-800 font-medium text-sm md:text-base w-full">
            <li className="flex items-center p-2 bg-green-50 rounded-lg">
              <span className="mr-2 text-lg">💧</span>
              <span>Regar el cultivo en 2 días</span>
            </li>
            <li className="flex items-center p-2 bg-green-50 rounded-lg">
              <span className="mr-2 text-lg">🌱</span>
              <span>Añadir fertilizante según necesidad</span>
            </li>
            <li className="flex items-center p-2 bg-green-50 rounded-lg">
              <span className="mr-2 text-lg">☀️</span>
              <span>Revisar exposición solar</span>
            </li>
            <li className="flex items-center p-2 bg-green-50 rounded-lg">
              <span className="mr-2 text-lg">🫘</span>
              <span>Momento óptimo para sembrar más frijol</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal de Recomendación */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-gradient-to-b from-white to-green-50 p-6 rounded-2xl w-full max-w-2xl shadow-2xl border-2 border-green-300 animate-scaleIn my-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-green-800">
                📋 Recomendación de Fertilizante
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-red-500 hover:text-red-700 text-xl bg-red-100 p-1 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {[
                { label: "Nombre", value: fertilizer.name, icon: "📝" },
                { label: "Dosis", value: fertilizer.dose, icon: "⚖️" },
                {
                  label: "Forma de aplicación",
                  value: fertilizer.form,
                  icon: "🔄",
                },
                {
                  label: "Horario recomendado",
                  value: fertilizer.schedule,
                  icon: "⏰",
                },
                {
                  label: "Efectividad",
                  value: fertilizer.effectiveness,
                  icon: "📈",
                },
                { label: "Precio", value: fertilizer.price, icon: "💰" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start border-b border-green-100 pb-2"
                >
                  <span className="mr-2 text-green-700 text-lg">
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <span className="font-semibold text-green-700">
                      {item.label}:
                    </span>
                    <span className="ml-2">{item.value}</span>
                  </div>
                </div>
              ))}

              {/* Beneficios de aplicar el fertilizante */}
              <div className="pt-2">
                <h3 className="font-semibold text-green-700 text-lg flex items-center">
                  <span className="mr-2">✅</span>
                  Beneficios de aplicar este fertilizante:
                </h3>
                <ul className="mt-2 space-y-1 pl-6">
                  {fertilizer.benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="text-sm md:text-base text-green-800 list-disc"
                    >
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Desventajas de no aplicar */}
              <div className="pt-2">
                <h3 className="font-semibold text-red-700 text-lg flex items-center">
                  <span className="mr-2">❌</span>
                  Desventajas de no aplicar fertilizante:
                </h3>
                <ul className="mt-2 space-y-1 pl-6">
                  {fertilizer.disadvantages.map((disadvantage, index) => (
                    <li
                      key={index}
                      className="text-sm md:text-base text-red-800 list-disc"
                    >
                      {disadvantage}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start pt-2">
                <span className="mr-2 text-green-700 text-lg">🔗</span>
                <div className="flex-1">
                  <span className="font-semibold text-green-700">Enlace:</span>
                  <a
                    href={fertilizer.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 underline break-all text-sm"
                  >
                    Ver producto recomendado
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Efecto de neumática agrícola en la parte inferior */}
      <div className="mt-6 md:mt-8 w-full max-w-6xl bg-black/40 backdrop-blur-md rounded-2xl p-3 text-center">
        <p className="text-white text-sm md:text-base">
          💡 Consejo: Consulta regularmente con el Agrónomo IA para optimizar tu
          cultivo
        </p>
      </div>

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
