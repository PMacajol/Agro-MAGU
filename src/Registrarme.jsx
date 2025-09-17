import { useState } from "react";
import "./Login.css";
import logo from "../images/magu_2.png";

export default function Registrarme({ onBack }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    // Aquí iría la lógica para registrar al usuario
    console.log({ username, email, password, phone });
    // Después de registrar, podríamos redirigir o hacer otra acción
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="logo-circle">
          <img src={logo} alt="Logo" />
        </div>
        <h1 className="agromagu">AgroMAGU®</h1>
        <p>Crea una cuenta nueva</p>

        <div className="input-group">
          <span className="icon">👤</span>
          <input
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

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

        <div className="input-group">
          <span className="icon">🔒</span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="show-pass-btn"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "🐵"}
          </button>
        </div>

        <div className="input-group">
          <span className="icon">🔒</span>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="show-pass-btn"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "🙈" : "🐵"}
          </button>
        </div>

        <div className="input-group">
          <span className="icon">📞</span>
          <input
            type="tel"
            placeholder="Número de teléfono"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-neon">
          Registrarme
        </button>

        <button
          type="button"
          className="link-btn"
          onClick={onBack}
          style={{ marginTop: "10px" }}
        >
          ← Volver
        </button>
      </form>
    </div>
  );
}
