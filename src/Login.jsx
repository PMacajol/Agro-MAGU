import { useState } from "react";
import "./Login.css";
import logo from "../images/magu_2.png";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentScreen, setCurrentScreen] = useState("login"); // login, forgot, register
  const [showPassword, setShowPassword] = useState(false);

  const users = { admin: "admin123", user_1: "user123" };

  const handleLogin = (e) => {
    e.preventDefault();
    if (users[username] && users[username] === password) {
      onLogin(username);
    } else {
      alert("Usuario o contraseña incorrectos");
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

      <button type="submit" className="btn-neon">
        Ingresar
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

  const renderForgot = () => (
    <div className="login-card">
      <h1>Recuperar contraseña</h1>
      <p>Ingresa tu correo para recuperar tu contraseña</p>
      <input type="email" placeholder="Correo electrónico" />
      <button className="btn-neon">Enviar</button>
      <button className="link-btn" onClick={() => setCurrentScreen("login")}>
        ← Volver
      </button>
    </div>
  );

  const renderRegister = () => (
    <div className="login-card">
      <h1>Registrarme</h1>
      <p>Crea una cuenta nueva</p>
      <input type="text" placeholder="Usuario" />
      <input type="email" placeholder="Correo electrónico" />
      <input type="password" placeholder="Contraseña" />
      <button className="btn-neon">Registrarse</button>
      <button className="link-btn" onClick={() => setCurrentScreen("login")}>
        ← Volver
      </button>
    </div>
  );

  return (
    <div className="login-page">
      {currentScreen === "login" && renderLoginForm()}
      {currentScreen === "forgot" && renderForgot()}
      {currentScreen === "register" && renderRegister()}
    </div>
  );
}
