import { useState } from "react";

export default function SamplingPage() {
  const [actividades, setActividades] = useState([
    { fecha: "2025-08-01", titulo: "🌱 Siembra de frijol", done: false },
    { fecha: "2025-08-08", titulo: "💧 Riego programado", done: false },
    { fecha: "2025-08-15", titulo: "🧪 Muestreo de suelo", done: false },
    { fecha: "2025-08-20", titulo: "🪴 Fertilización NPK", done: false },
    { fecha: "2025-08-25", titulo: "🌿 Fumigación preventiva", done: false },
  ]);

  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth()); // 0-11
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear()
  );

  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const diasDelMes = new Date(
    anioSeleccionado,
    mesSeleccionado + 1,
    0
  ).getDate();
  const primerDiaSemana = new Date(
    anioSeleccionado,
    mesSeleccionado,
    1
  ).getDay();

  const toggleActividad = (fecha) => {
    setActividades((prev) =>
      prev.map((a) => (a.fecha === fecha ? { ...a, done: !a.done } : a))
    );
  };

  const cambiarMes = (incremento) => {
    let nuevoMes = mesSeleccionado + incremento;
    let nuevoAnio = anioSeleccionado;

    if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio += 1;
    } else if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio -= 1;
    }

    setMesSeleccionado(nuevoMes);
    setAnioSeleccionado(nuevoAnio);
  };

  const cambiarAnio = (incremento) => {
    setAnioSeleccionado(anioSeleccionado + incremento);
  };

  return (
    <div className="bg-gray-100 p-6 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-6 text-[#4A6B2A]">
        🌱 Plan de Fertilización {anioSeleccionado}
      </h2>

      {/* Controles con flechas alineados a la derecha */}
      <div className="flex gap-6 mb-4 justify-end items-center text-white font-bold">
        <div className="flex items-center gap-2 bg-[#8BAE68] p-2 rounded-xl shadow-md">
          <button
            onClick={() => cambiarMes(-1)}
            className="px-2 py-1 bg-[#4A6B2A] rounded hover:bg-[#6B9EBF] transition"
          >
            ◀
          </button>
          <span className="text-lg">{meses[mesSeleccionado]}</span>
          <button
            onClick={() => cambiarMes(1)}
            className="px-2 py-1 bg-[#4A6B2A] rounded hover:bg-[#6B9EBF] transition"
          >
            ▶
          </button>
        </div>

        <div className="flex items-center gap-2 bg-[#8BAE68] p-2 rounded-xl shadow-md">
          <button
            onClick={() => cambiarAnio(-1)}
            className="px-2 py-1 bg-[#4A6B2A] rounded hover:bg-[#6B9EBF] transition"
          >
            ◀
          </button>
          <span className="text-lg">{anioSeleccionado}</span>
          <button
            onClick={() => cambiarAnio(1)}
            className="px-2 py-1 bg-[#4A6B2A] rounded hover:bg-[#6B9EBF] transition"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-4 text-center mb-8">
        {diasSemana.map((d) => (
          <div key={d} className="font-bold text-gray-600">
            {d}
          </div>
        ))}

        {Array.from({ length: primerDiaSemana }).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}

        {Array.from({ length: diasDelMes }, (_, i) => {
          const dia = i + 1;
          const fecha = `${anioSeleccionado}-${String(
            mesSeleccionado + 1
          ).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
          const evento = actividades.find((a) => a.fecha === fecha);

          return (
            <div
              key={dia}
              className={`p-4 rounded-3xl transform transition-transform duration-200 hover:-translate-y-1 ${
                evento
                  ? evento.done
                    ? "bg-[#A67C52] border-2 border-[#4A6B2A] shadow-lg"
                    : "bg-[#8BAE68] border-2 border-[#4A6B2A] shadow-md hover:shadow-[#6B9EBF]/50"
                  : "bg-[#8BAE68] border-2 border-[#8BAE68] shadow-sm hover:shadow-[#6B9EBF]/50"
              }`}
            >
              <span className="font-extrabold text-white text-lg">{dia}</span>
              {evento && (
                <div className="text-sm mt-1 font-bold text-white truncate">
                  {evento.titulo}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lista de actividades */}
      <h3 className="text-xl font-semibold mb-2 text-[#6B9EBF]">
        📋 Actividades Programadas
      </h3>
      <ul className="space-y-2">
        {actividades.map((a, idx) => (
          <li
            key={idx}
            className={`p-3 rounded-2xl border-2 flex justify-between items-center transform shadow-md ${
              a.done
                ? "bg-[#A67C52] border-[#4A6B2A] text-white font-bold"
                : "bg-[#8BAE68] border-[#4A6B2A] text-white font-bold hover:bg-[#6B9EBF] transition duration-200"
            }`}
          >
            <span>
              <b>{a.fecha}:</b> {a.titulo}
            </span>
            <button
              onClick={() => toggleActividad(a.fecha)}
              className={`px-3 py-1 rounded-lg text-sm shadow ${
                a.done
                  ? "bg-[#4A6B2A] text-white hover:bg-[#6B9EBF]"
                  : "bg-[#6B9EBF] text-white hover:bg-[#E8C662] transition duration-200"
              }`}
            >
              {a.done ? "✔ Realizado" : "Marcar realizado"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
