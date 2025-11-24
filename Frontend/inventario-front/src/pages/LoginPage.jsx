import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import inventarioApi from "../api/inventarioApi";
import "./Login.css";

const CLIENT_ID = "857285179730-h99ak9m8ve72m1ssj2g0u690kk89a03c.apps.googleusercontent.com";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();

  // ============================
  //   LOGIN NORMAL
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const success = await login(username, password);
    if (!success) {
      setError("Credenciales inválidas.");
    }
  };

  // ============================
  //   LOGIN CON GOOGLE
  // ============================
  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleGoogleResponse,
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleLoginDiv"),
      {
        theme: "outline",
        size: "large",
        width: 300,
        text: "signin_with",
        shape: "rectangular",
      }
    );
  }, []);

  const handleGoogleResponse = async (googleResponse) => {
    try {
      const credential = googleResponse.credential;

      const res = await inventarioApi.post("/google-login/", {
        credential: credential,
      });

      const { access, refresh, is_admin } = res.data;

      // Guardar tokens
      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("is_admin", is_admin ? "true" : "false");

      // Redirigir
      window.location.href = "/";

    } catch (error) {
      console.error("❌ Error Google Login:", error);
      setError("No tienes permisos para acceder con Google.");
    }
  };

  // ============================
  //   UI
  // ============================
  return (
    <div className="login-container">

      <h1 className="titulo-principal">ANIMALPRINT PETSTOCK</h1>

      <div className="login-box">
        <h2>Inicio Sesión</h2>

        <form onSubmit={handleSubmit}>

          <div className="campo">
            <label>
              <span className="icono">👤</span> Usuario
            </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="campo">
            <label>
              <span className="icono">🔒</span> Contraseña
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button className="btn-ingresar" type="submit">
            Ingresar
          </button>
        </form>

        {/* BOTÓN DE GOOGLE */}
        <div id="googleLoginDiv" style={{ marginTop: "20px" }}></div>

      </div>
    </div>
  );
};

export default LoginPage;
