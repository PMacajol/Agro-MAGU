import { useState } from "react";
import "./Login.css";
import logo from "../images/magu_2.png";
import Registrarme from "./Registrarme";
import OlvidasteContraseña from "./OlvidasteContraseña";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentScreen, setCurrentScreen] = useState("login"); // login, forgot, register
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.detail || "Usuario o contraseña incorrectos");
      } else {
        // Login exitoso, ejecutar callback
        onLogin(username, data); // data puede incluir token u otra info
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form className="login-card" onSubmit={handleLogin}>
      <div className="logo-circle">
        <img src={logo} alt="Logo" />
      </div>
      <h1 className="agromagu">AgroMAGU®</h1>
      <p>Inicia sesión para cuidar tu cultivo de frijol</p>

      <div className="input-group">
        <span className="icon">👤</span>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="input-group">
        <span className="icon">🔒</span>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          className="show-pass-btn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "🐵"}
        </button>
      </div>

      <div className="login-options">
        <label>
          <input type="checkbox" /> Recordar sesión
        </label>
        <button
          type="button"
          className="link-btn"
          onClick={() => setCurrentScreen("forgot")}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <button type="submit" className="btn-neon" disabled={loading}>
        {loading ? "Cargando..." : "Ingresar"}
      </button>

      <div className="extra-space"></div>

      <p>
        ¿Nuevo usuario?{" "}
        <button
          type="button"
          className="link-btn"
          onClick={() => setCurrentScreen("register")}
        >
          Registrarme
        </button>
      </p>
    </form>
  );

  return (
    <div className="login-page">
      {currentScreen === "login" && renderLoginForm()}
      {currentScreen === "forgot" && (
        <OlvidasteContraseña onBack={() => setCurrentScreen("login")} />
      )}
      {currentScreen === "register" && (
        <Registrarme onBack={() => setCurrentScreen("login")} />
      )}
    </div>
  );
}
