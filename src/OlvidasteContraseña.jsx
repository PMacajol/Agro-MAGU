import { useState } from "react";
import "./Login.css";
import logo from "../images/magu_2.png";

export default function OlvidasteContraseña({ onBack }) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el correo de recuperación
    console.log("Solicitud de recuperación para:", email);
    alert(
      "Si el correo existe, recibirás instrucciones para restablecer tu contraseña."
    );
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo-circle">
          <img src={logo} alt="Logo" />
        </div>
        <h1 className="agromagu">AgroMAGU®</h1>
        <p>Ingresa tu correo para recuperar tu contraseña</p>

        <div className="input-group">
          <span className="icon">📧</span>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-neon">
          Enviar instrucciones
        </button>

        <button
          type="button"
          className="link-btn"
          onClick={onBack}
          style={{ marginTop: "10px" }}
        >
          ← Volver al inicio de sesión
        </button>
      </form>
    </div>
  );
}
