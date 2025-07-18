import React, { useState, useEffect } from 'react';
import api from '../../services/axiosConfig';

import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({ mail: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para alternar visibilidad
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', formData);
      const user = response.data.user;
      delete user.password;
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center">
      <div className="login-card shadow p-4">
        <div className="text-center mb-4">
          <p className="title">Login</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="mail"
              value={formData.mail}
              onChange={handleChange}
              className="form-control"
              placeholder="nombre@ejemplo.com"
              required
            />
          </div>
          <div className="mb-3 password-container">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Ingrese su contraseña"
                required
              />
              <span
                className="password-toggle-icon"
                onClick={toggleShowPassword}
              >
                {showPassword ? <svg
                    aria-hidden="true"
                    width="24"
                    height="18"
                    viewBox="0 0 24 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M12.0011 14C8.63237 14 5.4638 12.0754 2.44714 7.9998C5.46419 3.92435 8.63259 2 12.0011 2C15.3699 2 18.5384 3.9246 21.5551 8.00019C18.5381 12.0757 15.3697 14 12.0011 14ZM12.0011 0C7.5541 0 3.72153 2.69306 0.396231 7.42477L-0.0078125 7.9997L0.396182 8.57467C3.72105 13.3066 7.55383 16 12.0011 16C16.4481 16 20.2807 13.3069 23.606 8.57523L24.0101 8.0003L23.6061 7.42533C20.2812 2.69339 16.4484 0 12.0011 0ZM9 8C9 6.34315 10.3431 5 12 5C13.6569 5 15 6.34315 15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8ZM12 3C9.23858 3 7 5.23858 7 8C7 10.7614 9.23858 13 12 13C14.7614 13 17 10.7614 17 8C17 5.23858 14.7614 3 12 3Z"
                      fill="#666"
                    />
                  </svg> : <svg
                    aria-hidden="true"
                    width="24"
                    height="18"
                    viewBox="0 0 24 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M21.666 1.74742C22.0788 1.3805 22.1159 0.74843 21.749 0.335647C21.3821 -0.0771359 20.75 -0.114317 20.3373 0.252601L17.6904 2.60537C15.9141 1.55556 14.021 0.999981 12.0011 0.999981C7.5541 0.999981 3.72153 3.69304 0.396231 8.42475L-0.0078125 8.99968L0.396182 9.57465C1.72195 11.4615 3.12847 13.0242 4.62251 14.2213L2.33725 16.2526C1.92447 16.6195 1.88729 17.2516 2.25421 17.6644C2.62113 18.0772 3.2532 18.1143 3.66598 17.7474L6.31249 15.395C8.08863 16.4445 9.98151 17 12.0011 17C16.4481 17 20.2807 14.3069 23.606 9.57521L24.0101 9.00028L23.6061 8.42531C22.2805 6.53872 20.8741 4.97616 19.3803 3.77915L21.666 1.74742ZM16.1043 4.0152C14.7689 3.33295 13.4023 2.99998 12.0011 2.99998C8.63259 2.99998 5.46419 4.92433 2.44714 8.99979C3.65324 10.6293 4.88362 11.9149 6.14137 12.8712L7.67403 11.5088C7.24544 10.7714 7 9.91434 7 8.99998C7 6.23856 9.23858 3.99998 12 3.99998C13.1248 3.99998 14.1629 4.37142 14.9983 4.99834L16.1043 4.0152ZM16.3271 6.49309L17.8614 5.12923C19.119 6.08545 20.3492 7.37095 21.5551 9.00018C18.5381 13.0756 15.3697 15 12.0011 15C10.6001 15 9.23379 14.6671 7.89858 13.9851L9.00349 13.003C9.83855 13.6291 10.876 14 12 14C14.7614 14 17 11.7614 17 8.99998C17 8.08642 16.755 7.23008 16.3271 6.49309ZM13.4511 6.37364C13.0211 6.13554 12.5264 5.99998 12 5.99998C10.3431 5.99998 9 7.34313 9 8.99998C9 9.401 9.07868 9.78364 9.22146 10.1333L13.4511 6.37364ZM10.551 11.6274L14.7794 7.86881C14.9216 8.21789 15 8.59978 15 8.99998C15 10.6568 13.6569 12 12 12C11.4745 12 10.9805 11.8649 10.551 11.6274Z"
                      fill="#666"
                    />
                  </svg>} {/* Cambiar a un ícono real si es necesario */}
              </span>
            </div>
          </div>
          {error && <p className="text-danger">{error}</p>}
          <div className="d-flex justify-content-between mb-3">
            <a href="#" className="text-decoration-none">Olvidaste tu Contraseña?</a>
          </div>
          <button type="submit" className="btn btn-primary w-100">Log In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

/*<div className="mt-3 text-center">
          <button className="btn btn-outline-primary w-100 mb-2">Log in with a one-time code</button>
          <div className="divider my-2">or</div>
          <button className="btn btn-outline-secondary w-100">Sign Up</button>
        </div>

        {error && <p className="text-danger">{error}</p>}
          <div className="d-flex justify-content-between mb-3">
            <a href="#" className="text-decoration-none">Olvidaste tu Contraseña?</a>
          </div>
        

        esto va abaho del p title
<img>
            //src="https://www.paypalobjects.com/images/shared/paypal-logo-129x32.svg"
            //alt="PayPal"
            //className="paypal-logo"
          /></img>*/