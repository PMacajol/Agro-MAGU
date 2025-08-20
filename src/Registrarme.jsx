export default function Registrarme({ onBack }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Registro de nuevo usuario</h2>
        <input type="text" placeholder="Nombre completo" />
        <input type="email" placeholder="Correo electrónico" />
        <input type="password" placeholder="Contraseña" />
        <input type="password" placeholder="Confirmar contraseña" />
        <button>Registrarme</button>
        <button
          type="button"
          style={{ marginTop: "10px", background: "#004d00" }}
          onClick={onBack}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
