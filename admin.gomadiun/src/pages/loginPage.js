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

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/admin/login`, {
        email: username,
        password: password
      })
      if (response) {
        try {
          const data = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/admin/me`)
          if (data) {
            window.location.reload();
            console.log(data)
          }
        } catch (error) {
          if (error.response.status === 401) {
            console.log(error.response.data.msg);
          }
        }
      }
    } catch (error) {
      if (error.response.status === 422) {
        setMessage(error.response.data.message);
        setLoading(false);
        setTimeout(() => {
            setMessage('');
        }, 2000)
      }
    }

  };

  const handleshowPass = (e) => {
    setisVisible(!isVisible)
  };


  return (
    <div className="container-fluid page-body-wrapper full-page-wrapper">
      <div className="content-wrapper d-flex align-items-center auth px-0">
        <div className="row w-100 mx-0">
          <div className="col-lg-4 mx-auto">

            {errormessage && (
              <div className={`alert alert-danger`} role="alert">
                {errormessage}
              </div>
            )}
            <div className="auth-form-light text-left py-5 px-4 px-sm-5">
              <h4>Hello Admin!</h4>
              <h6 className="font-weight-light">Sign in</h6>
              <form onSubmit={handleLogin} className='pt-3'>
                <div className='form-group'>
                  <input className='form-control form-control-lg' type="email" placeholder='Email' id="email" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className='form-group'>
                  <input className='form-control form-control-lg' type={`${isVisible ? 'text' : 'password'}`} placeholder='Password' id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="font-weight-light" onClick={handleshowPass}>
                  {isVisible ? (
                    <FontAwesomeIcon icon={faSquareCheck} />
                  ) : (
                    <FontAwesomeIcon icon={faSquare} />
                  )} <span>Tampilkan password</span>
                </div>
                <div className="mt-4">
                  <button type="submit" className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn">SIGN IN
                    {loading ? (
                      <svg className="spinner" viewBox="0 0 50 50">
                        <circle className="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                      </svg>
                    ) : (
                      <div></div>
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
