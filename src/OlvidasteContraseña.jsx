export default function OlvidasteContraseña({ onBack }) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Recuperar contraseña</h2>
        <p>Ingresa tu correo electrónico para recibir instrucciones</p>
        <input type="email" placeholder="Correo electrónico" />
        <button>Enviar</button>
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
