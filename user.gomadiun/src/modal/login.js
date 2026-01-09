import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LoginModal({ isOpen, isClose, closeModal, SwicthToRegister, SwicthToResetPass, setStatusLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errormessage, setMessage] = useState(null);
  const [isVisible, setisVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    if (username !== '' && password !== '') {
      setMessage(null);
    }
  }, [username, password]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (username === '' || password === '') {
      setMessage('Masukkan email dan password');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/login`,
        { email: username, password: password },
        { withCredentials: true }
      );

      if (response.status === 200 || response.status === 201) {
      
        try {
          const meResponse = await axios.get(
            `${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/me`,
            { withCredentials: true }
          );

          if (meResponse.status === 200) {
            const userData = meResponse.data.user; 

            localStorage.setItem('user', JSON.stringify(userData));
            
            setStatusLogin(true);
            setPassword('');
            setUsername('');
            
            closeModal();
            setLoading(false);

            window.location.reload();
          }
        } catch (error) {
          console.error('⚠️ Gagal mengambil detail user:', error);
          setMessage('Gagal memuat profil. Silakan coba lagi.');
          setLoading(false);
        }
      }

    } catch (error) {
      console.error('⚠️ Login Error:', error);

      let errorMessage = 'Terjadi kesalahan server';
      if (error.response?.status === 400) {
        errorMessage = error.response.data.msg || 'Email dan password diperlukan';
      } else if (error.response?.status === 401) {
        errorMessage = 'Email atau password salah';
      } else if (error.response?.status === 422) {
        errorMessage = error.response.data.msg || 'Data login tidak valid';
      } else if (error.response) {
         errorMessage = error.response.data.msg || 'Terjadi kesalahan pada layanan API.';
      }

      setMessage(errorMessage);
      setLoading(false);
    }
  };

  const handleshowPass = () => {
    setisVisible(!isVisible);
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className={`modal-content ${isClose ? 'animasiDown' : 'animasiUp'}`}>
        <div className='cover-close'>
          <span className='text-bold text-size-14'>Login</span>
          <span className='close' onClick={closeModal}>
            &times;
          </span>
        </div>

        {errormessage !== null && (
          <span className='text-size-10 text-danger my-1'>
            <i className='fa-solid fa-circle-info' style={{ marginRight: 5 }} /> {errormessage}
          </span>
        )}

        <form onSubmit={handleLogin} className='form py-1'>
          <div className='group-form'>
            <i className='fa-solid fa-envelope mx-right-1 text-default' />
            <input
              className='email'
              type='email'
              placeholder='Email'
              id='email'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className='group-form'>
            <i className='fas fa-key text-scondary mx-right-1 text-default' />
            <input
              type={`${isVisible ? 'text' : 'password'}`}
              placeholder='Password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={handleshowPass}>
              {isVisible ? (
                <i className='far fa-eye text-secondary' />
              ) : (
                <i className='far fa-eye-slash text-secondary' />
              )}
            </span>
          </div>
          <div className='d-flex flex-row justify-content-end'>
            <span className='text-secondary text-size-10 my-1' onClick={SwicthToResetPass}>
              Lupa Password?
            </span>
          </div>
          <button className='button-form' type='submit' style={{ backgroundColor: '#06647B' }}>
            Login
            {loading ? (
              <svg className='spinner' viewBox='0 0 50 50'>
                <circle className='path' cx='25' cy='25' r='20' fill='none' strokeWidth='5'></circle>
              </svg>
            ) : (
              <div></div>
            )}
          </button>
        </form>

        <div className='d-flex flex-row'>
          <span className='text-size-10' style={{ paddingRight: 3 }}>
            Belum punya akun?
          </span>
          <span className='text-default text-size-10' onClick={SwicthToRegister}>
            Daftar
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;