import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [error, setError] = useState('');

  // Fonction de gestion de la connexion via Google
  const handleGoogleLogin = () => {
    // Redirection vers le backend Flask pour commencer l'authentification Google
    window.location.href = 'http://127.0.0.1:5000/Login';
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;