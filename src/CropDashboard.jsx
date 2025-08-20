import React, { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

import robotImage from "../images/magu_2.png";

export default function CropDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    // Actualizar hora actual cada minuto
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  const npkData = {
    N: [{ name: "Nitrógeno", value: 45, fill: "#4A6B2A" }],
    P: [{ name: "Fósforo", value: 31, fill: "#6B9EBF" }],
    K: [{ name: "Potasio", value: 68, fill: "#E8C662" }],
  };

  const soilData = [
    {
      parameter: "Humedad",
      value: 72,
      unit: "%",
      icon: "💧",
      color: "#4A6B2A",
    },
    {
      parameter: "Temperatura",
      value: 25,
      unit: "°C",
      icon: "🌡️",
      color: "#A67C52",
    },
    { parameter: "pH", value: 6.8, unit: "", icon: "🧪", color: "#6B9EBF" },
    {
      parameter: "Luz Solar",
      value: 87,
      unit: "%",
      icon: "☀️",
      color: "#E8C662",
    },
  ];

  const nextActivity = {
    date: "20 Ago 2025",
    task: "🌱 Siembra de frijol",
    priority: "Alta",
    time: "09:00 AM",
  };

  const recommendations = [
    "💧 Regar el cultivo en 2 días",
    "🌱 Añadir fertilizante rico en fósforo",
    "☀️ Revisar exposición solar",
    "🫘 Momento óptimo para sembrar más frijol",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F5E9] to-[#A5D6A7] p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-[#4A6B2A]">AGROMAGU®</h1>
          <p className="text-[#5A5A5A]">Dashboard de Monitoreo de Cultivos</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-[#4A6B2A]">
            {currentTime.toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-[#5A5A5A]">
            {currentTime.toLocaleTimeString("es-ES")}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sección Robot y Parámetros */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 border-[#4A6B2A]">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-[#4A6B2A] rounded-full flex items-center justify-center mr-3">
              <span className="text-2xl">🤖</span>
            </div>
            <h2 className="text-2xl font-bold text-[#4A6B2A]">Agrónomo IA</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Imagen del Robot IA */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <img
                  src={robotImage}
                  alt="Robot IA"
                  className="w-72 h-72 rounded-2xl shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-[#E8C662] text-[#4A6B2A] font-bold py-1 px-3 rounded-full text-sm">
                  En línea
                </div>
              </div>
            </div>

            {/* Potenciómetros individuales con nombre y porcentaje */}
            <div className="flex flex-col items-center justify-center gap-8">
              {["N", "P", "K"].map((nutrient) => (
                <div key={nutrient} className="flex items-center gap-6">
                  <div className="w-36 h-36 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="20%"
                        outerRadius="90%"
                        barSize={25}
                        data={npkData[nutrient]}
                      >
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          tick={false}
                        />
                        <RadialBar
                          background
                          dataKey="value"
                          cornerRadius={10}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-[#4A6B2A]">
                        {npkData[nutrient][0].value}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-lg text-[#4A6B2A]">
                      {npkData[nutrient][0].name}
                    </span>
                    <div className="w-20 h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${npkData[nutrient][0].value}%`,
                          backgroundColor: npkData[nutrient][0].fill,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Temperatura y humedad */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {soilData.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl shadow-md border-l-4"
                style={{ borderLeftColor: item.color }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{item.icon}</span>
                  <span
                    className="text-xl font-bold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                    {item.unit}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{item.parameter}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Monitoring + Recomendaciones */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 border-[#6B9EBF]">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-[#6B9EBF] rounded-full flex items-center justify-center mr-3">
              <span className="text-2xl">📡</span>
            </div>
            <h2 className="text-2xl font-bold text-[#6B9EBF]">
              Monitoreo en tiempo real
            </h2>
          </div>

          {/* Datos y Recomendaciones lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos del Sensor */}
            <div className="bg-gradient-to-br from-[#E8F5E9] to-[#A5D6A7] p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-[#4A6B2A] mb-4">
                Datos del Sensor #027
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Humedad del suelo:</span>
                  <span className="font-semibold">55%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Temperatura:</span>
                  <span className="font-semibold">23°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nitrógeno:</span>
                  <span className="font-semibold">21 ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fósforo:</span>
                  <span className="font-semibold">18 ppm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Potasio:</span>
                  <span className="font-semibold">30 ppm</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                  Normal
                </span>
                <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                  Alerta
                </span>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB] p-4 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-[#6B9EBF] mb-4">
                Recomendaciones
              </h3>
              <ul className="space-y-3">
                {recommendations.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">{item.split(" ")[0]}</span>
                    <span className="text-gray-700">
                      {item.split(" ").slice(1).join(" ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mapa */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-[#4A6B2A] mb-3">
              Ubicación del Cultivo
            </h3>
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                title="Mapa Cultivo"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3878.205287676834!2d-90.502!3d14.444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85890d64f6f79d3d%3A0x7c0c7c6b2d403a5c!2sSanta%20Elena%20Barillas%2C%20Villa%20Canales%2C%20Guatemala!5e0!3m2!1ses!2sgt!4v1692222222222"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Próxima Actividad */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-l-4 border-[#E8C662] col-span-1 lg:col-span-2">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-[#E8C662] rounded-full flex items-center justify-center mr-3">
              <span className="text-2xl">📅</span>
            </div>
            <h2 className="text-2xl font-bold text-[#A67C52]">
              Próxima Actividad
            </h2>
          </div>

          <div className="bg-gradient-to-r from-[#F5F5DC] to-[#F0E68C] p-6 rounded-xl shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="text-2xl font-bold text-[#4A6B2A]">
                  {nextActivity.task}
                </p>
                <p className="text-gray-600 mt-2">
                  <span className="font-semibold">{nextActivity.date}</span> a
                  las <span className="font-semibold">{nextActivity.time}</span>
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="px-4 py-2 bg-[#4A6B2A] text-white rounded-full text-sm font-semibold">
                  Prioridad: {nextActivity.priority}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
