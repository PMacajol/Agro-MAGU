import { useState, useEffect } from "react";

export default function SamplingPage() {
  const [actividades, setActividades] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [anioSeleccionado, setAnioSeleccionado] = useState(
    new Date().getFullYear()
  );
  const [editando, setEditando] = useState(null);
  const [fechaInput, setFechaInput] = useState("");
  const [tituloInput, setTituloInput] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

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

  // Obtener actividades desde la API
  const obtenerActividades = async () => {
    try {
      setCargando(true);
      setError(null);
      const response = await fetch(
        `https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/actividades/1/${
          mesSeleccionado + 1
        }/${anioSeleccionado}`
      );

      if (!response.ok) {
        throw new Error(`Error en API: ${response.status}`);
      }

      const data = await response.json();
      setActividades(data);
    } catch (err) {
      console.error("Error obteniendo actividades:", err);
      setError("Error al cargar las actividades");
    } finally {
      setCargando(false);
    }
  };

  // Crear una nueva actividad
  const crearActividad = async () => {
    if (!fechaInput || !tituloInput) return alert("Completa fecha y título");

    try {
      const response = await fetch(
        "https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/actividades/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha: fechaInput,
            titulo: tituloInput,
            usuario_id: 1,
            completada: false, // CORREGIDO: usar 'completada' en lugar de 'done'
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error en API: ${response.status} - ${errorText}`);
      }

      // Recargar actividades después de crear
      await obtenerActividades();
      setFechaInput("");
      setTituloInput("");
    } catch (err) {
      console.error("Error creando actividad:", err);
      alert("Error al crear la actividad: " + err.message);
    }
  };

  // Actualizar una actividad - CORREGIDO
  const actualizarActividad = async () => {
    if (editando === null) return;
    if (!fechaInput || !tituloInput) return alert("Completa fecha y título");

    try {
      const actividadId = actividades[editando].id;
      const response = await fetch(
        `https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/actividades/${actividadId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha: fechaInput,
            titulo: tituloInput,
            usuario_id: 1,
            completada:
              actividades[editando].completada ||
              actividades[editando].done ||
              false, // CORREGIDO: usar 'completada' y manejar ambos casos
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error en API: ${response.status} - ${errorText}`);
      }

      // Recargar actividades después de actualizar
      await obtenerActividades();
      setEditando(null);
      setFechaInput("");
      setTituloInput("");
    } catch (err) {
      console.error("Error actualizando actividad:", err);
      alert("Error al actualizar la actividad: " + err.message);
    }
  };

  // Eliminar una actividad
  const eliminarActividad = async (idx) => {
    if (!confirm("¿Eliminar esta actividad?")) return;

    try {
      const actividadId = actividades[idx].id;
      const response = await fetch(
        `https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/actividades/${actividadId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error en API: ${response.status} - ${errorText}`);
      }

      // Recargar actividades después de eliminar
      await obtenerActividades();
    } catch (err) {
      console.error("Error eliminando actividad:", err);
      alert("Error al eliminar la actividad: " + err.message);
    }
  };

  // Marcar actividad como realizada - CORREGIDO
  const marcarRealizada = async (fecha, idx) => {
    try {
      const actividadId = actividades[idx].id;
      const estadoActual =
        actividades[idx].completada || actividades[idx].done || false;
      const nuevoEstado = !estadoActual;

      // Actualización inmediata del estado local para mejor UX
      const actividadesActualizadas = actividades.map((act, index) =>
        index === idx
          ? { ...act, completada: nuevoEstado, done: nuevoEstado }
          : act
      );
      setActividades(actividadesActualizadas);

      const response = await fetch(
        `https://agromaguia-e6hratbmg2hraxdq.centralus-01.azurewebsites.net/api/actividades/${actividadId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fecha: actividades[idx].fecha,
            titulo: actividades[idx].titulo,
            usuario_id: 1,
            completada: nuevoEstado, // CORREGIDO: usar 'completada' en lugar de 'done'
          }),
        }
      );

      if (!response.ok) {
        // Si falla, revertir el cambio local
        setActividades(actividades);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error en API: ${response.status} - ${errorText}`);
      }

      // Opcional: recargar para asegurar sincronización
      // await obtenerActividades();
    } catch (err) {
      console.error("Error marcando actividad como realizada:", err);
      alert("Error al marcar la actividad: " + err.message);
      // Recargar actividades para recuperar el estado correcto
      await obtenerActividades();
    }
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

  const iniciarEdicion = (idx) => {
    setEditando(idx);
    setFechaInput(actividades[idx].fecha);
    setTituloInput(actividades[idx].titulo);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDayClick = (fecha) => {
    const idx = actividades.findIndex((a) => a.fecha === fecha);
    if (idx >= 0) {
      iniciarEdicion(idx);
    } else {
      setEditando(null);
      setFechaInput(fecha);
      setTituloInput("");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Cargar actividades cuando cambie el mes o año
  useEffect(() => {
    obtenerActividades();
  }, [mesSeleccionado, anioSeleccionado]);

  return (
    <div className="bg-gray-100 p-6 rounded-3xl shadow-2xl">
      <h2 className="text-3xl font-extrabold mb-6 text-[#4A6B2A]">
        🌱 Plan de Fertilización {anioSeleccionado}
      </h2>

      {/* Formulario para agregar/editar actividades */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-md flex flex-col md:flex-row gap-2">
        <input
          type="date"
          value={fechaInput}
          onChange={(e) => setFechaInput(e.target.value)}
          className="p-2 border rounded-md flex-1"
        />
        <input
          type="text"
          value={tituloInput}
          onChange={(e) => setTituloInput(e.target.value)}
          placeholder="Título de la actividad (ej: 🌱 Siembra de frijol)"
          className="p-2 border rounded-md flex-2"
        />
        {editando !== null ? (
          <>
            <button
              onClick={actualizarActividad}
              className="px-4 py-2 bg-[#6B9EBF] text-white rounded-md hover:bg-[#4A6B2A] transition"
            >
              💾 Guardar cambios
            </button>
            <button
              onClick={() => {
                setEditando(null);
                setFechaInput("");
                setTituloInput("");
              }}
              className="px-4 py-2 bg-[#A67C52] text-white rounded-md hover:bg-[#D9534F] transition"
            >
              ✖ Cancelar
            </button>
          </>
        ) : (
          <button
            onClick={crearActividad}
            className="px-4 py-2 bg-[#4A6B2A] text-white rounded-md hover:bg-[#6B9EBF] transition"
          >
            ➕ Agregar actividad
          </button>
        )}
      </div>

      {/* Indicador de carga */}
      {cargando && (
        <div className="mb-4 p-4 bg-blue-100 rounded-xl text-center">
          <p>Cargando actividades...</p>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 rounded-xl text-center">
          <p>{error}</p>
          <button
            onClick={obtenerActividades}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Reintentar
          </button>
        </div>
      )}

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

          // CORREGIDO: manejar tanto 'completada' como 'done' para compatibilidad
          const estaCompleta = evento && (evento.completada || evento.done);

          return (
            <div
              key={dia}
              onClick={() => onDayClick(fecha)}
              className={`p-4 rounded-3xl transform transition-transform duration-200 hover:-translate-y-1 cursor-pointer ${
                evento
                  ? estaCompleta
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
        {actividades.map((a, idx) => {
          // CORREGIDO: manejar tanto 'completada' como 'done' para compatibilidad
          const estaCompleta = a.completada || a.done || false;

          return (
            <li
              key={a.id}
              className={`p-3 rounded-2xl border-2 flex justify-between items-center transform shadow-md ${
                estaCompleta
                  ? "bg-[#A67C52] border-[#4A6B2A] text-white font-bold"
                  : "bg-[#8BAE68] border-[#4A6B2A] text-white font-bold hover:bg-[#6B9EBF] transition duration-200"
              }`}
            >
              <span>
                <b>{a.fecha}:</b> {a.titulo}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => marcarRealizada(a.fecha, idx)}
                  className={`px-3 py-1 rounded-lg text-sm shadow ${
                    estaCompleta
                      ? "bg-[#4A6B2A] text-white hover:bg-[#6B9EBF]"
                      : "bg-[#6B9EBF] text-white hover:bg-[#E8C662] transition duration-200"
                  }`}
                >
                  {estaCompleta ? "✔ Realizado" : "Marcar realizado"}
                </button>
                <button
                  onClick={() => iniciarEdicion(idx)}
                  className="px-3 py-1 rounded-lg text-sm bg-[#6B9EBF] text-white hover:bg-[#4A6B2A] transition"
                >
                  ✏ Editar
                </button>
                <button
                  onClick={() => eliminarActividad(idx)}
                  className="px-3 py-1 rounded-lg text-sm bg-[#A67C52] text-white hover:bg-[#D9534F] transition"
                >
                  🗑 Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
