import React, { useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { faSquareCheck } from '@fortawesome/free-solid-svg-icons';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errormessage, setMessage] = useState(null);
  const [isVisible, setisVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API_URL}/api/admin/login`, 
        {
            email: username,
            password: password
        },
        { withCredentials: true } 
      );

      if (response.status === 200) {
        // PERUBAHAN: Gunakan window.location agar browser menangkap navigasi sukses 
        // setelah form submit, memicu prompt "Save Password"
        window.location.replace("/dashboard");
      }

    } catch (error) {
      setLoading(false);
      if (error.response) {
        const msg = error.response.data.message || error.response.data.msg || "Login Gagal";
        setMessage(msg);
      } else {
        setMessage("Server tidak terjangkau / Network Error");
      }
      
      setTimeout(() => {
          setMessage(null);
      }, 2000);
    }
  };

  const handleshowPass = () => {
    setisVisible(!isVisible);
  };

  return (
    <div className="container-fluid page-body-wrapper full-page-wrapper">
      <div className="content-wrapper d-flex align-items-center auth px-0">
        <div className="row w-100 mx-0">
          <div className="col-lg-4 mx-auto">

            {errormessage && (
              <div className="alert alert-danger" role="alert">
                {errormessage}
              </div>
            )}
            
            <div className="auth-form-light text-left py-5 px-4 px-sm-5">
              <h4>Hello Admin!</h4>
              <h6 className="font-weight-light">Sign in</h6>
              
              {/* Tambahkan action dan method dummy agar browser mendeteksi ini form login asli */}
              <form onSubmit={handleLogin} className='pt-3' action="#" method="POST">
                <div className='form-group'>
                  <input 
                    className='form-control form-control-lg' 
                    type="email" 
                    name="email" // WAJIB: Agar browser tahu ini field username
                    autoComplete="username" // WAJIB: Membantu Autofill Google
                    placeholder='Email' 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                  />
                </div>
                <div className='form-group'>
                  <input 
                    className='form-control form-control-lg' 
                    type={isVisible ? 'text' : 'password'} 
                    name="password" // WAJIB: Agar browser tahu ini field password
                    autoComplete="current-password" // WAJIB: Membantu Save Password Google
                    placeholder='Password' 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>

                <div className="font-weight-light mb-3" onClick={handleshowPass} style={{cursor: 'pointer'}}>
                  {isVisible ? <FontAwesomeIcon icon={faSquareCheck} /> : <FontAwesomeIcon icon={faSquare} />}
                  <span className="ml-2">Tampilkan password</span>
                </div>

                <div className="mt-4">
                  <button 
                    type="submit" 
                    id="login_button" // Tambahkan ID jika diperlukan
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                    disabled={loading}
                  >
                    {loading ? 'LOADING...' : 'SIGN IN'}
                    {loading && (
                      <svg className="spinner ml-2" viewBox="0 0 50 50" style={{width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle'}}>
                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5" stroke="#fff"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;