import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RegisterModal({
  isOpen,
  isClose,
  closeModal,
  SwicthToLogin,
  OpenOtp,
  statusVerif,
  username,
  nama_lengkap,
  email,
  password,
  passwordConfirm,
  telp,
  setUsername,
  setNamaLengkap,
  setEmail,
  setPassword,
  setPasswordConfirm,
  setTelp,
  showAlert,
  messageAlert,
  nameAlert
}) {
  const [isVisible, setisVisible] = useState(false);
  const [isVisibleConfirm, setisVisibleConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errormessage, setMessage] = useState(null);


  const handleshowPass = (e) => {
    setisVisible(!isVisible)
  };
  const handleshowConfirmPass = (e) => {
    setisVisibleConfirm(!isVisibleConfirm)
  };

  const handleRegistrasi = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (password === passwordConfirm) {

      try {
        const checkEmail = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/checkEmail`, {
          email: email
        });

        if (checkEmail.status === 200) {
          messageAlert(checkEmail.data.message);
          nameAlert('Warning')
          showAlert();
          setLoading(false);
        }
      } catch (error) {
        if (error.response.status === 422) {
          try {
            const sendOTP = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/sendOTP`, {
              email: email,
              typesend: "registrasi"
            });

            if (sendOTP.status === 200) {
              setMessage(null);
              setLoading(false);
              statusVerif('registrasi');
              setPasswordConfirm('');
              closeModal();
              OpenOtp();
              messageAlert(sendOTP.data.message);
              nameAlert('Success')
              showAlert();
            }
          } catch (error) {
            if (error.response.status === 422) {
              console.log(error.response);
              messageAlert(error.response.data.message);
              nameAlert('Error')
              showAlert();
              setLoading(false);
            }
          }

        }
      }

    } else {
      setMessage('Konfirmasi password baru salah');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (username !== '' && email !== '' && password !== '' && passwordConfirm !== '' && telp !== '') {
      setMessage(null);
    }
  }, [username, password, email, passwordConfirm, telp]);

  return (

    <div className={`modal ${isOpen ? 'open' : ''}`}>
      <div className={`modal-content ${isClose ? 'animasiDown' : 'animasiUp'}`}>
        <div className='cover-close'>
          <span className='text-bold text-size-14'>Registrasi</span>
          <span className="close" onClick={closeModal}>&times;</span>
        </div>
        {errormessage !== null && (
          <span className='text-size-10 text-danger my-1'><i className="fa-solid fa-circle-info" style={{ marginRight: 5 }} /> {errormessage}</span>
        )}
        <form onSubmit={handleRegistrasi} className='form py-1'>
          <div className='group-form'>
            <i className="fa-solid fa-user mx-right-1 text-default" />
            <input className='username' type="text" placeholder='Username' id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className='group-form'>
            <i className="fa-solid fa-address-card mx-right-1 text-default" />
            <input className='nama_lengkap' type="text" placeholder='Nama Lengkap' id="nama_lengkap" value={nama_lengkap} onChange={(e) => setNamaLengkap(e.target.value)} required />
          </div>
          <div className='group-form'>
            <i className="fa-solid fa-phone mx-right-1 text-default" />
            <input className='telepon' type="phone" placeholder='Nomor Telpon' id="telpon" value={telp} onChange={(e) => setTelp(e.target.value)} required />
          </div>
          <div className='group-form'>
            <i className="fa-solid fa-envelope mx-right-1 text-default" />
            <input className='email' type="email" placeholder='Email' id="emailRegistrasi" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className='group-form'>
            <i className="fas fa-key text-scondary mx-right-1 text-default" />
            <input type={`${isVisible ? 'text' : 'password'}`} placeholder='Password' id="passwordRegistrasi" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <span onClick={handleshowPass}>
              {isVisible ? (
                <i className="far fa-eye text-secondary" />
              ) : (
                <i className="far fa-eye-slash text-secondary" />
              )}
            </span>
          </div>
          <div className='group-form'>
            <i className="fas fa-key text-scondary mx-right-1 text-default" />
            <input type={`${isVisibleConfirm ? 'text' : 'password'}`} placeholder='Konfirmasi Password' id="confirmpassword" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            <span onClick={handleshowConfirmPass}>
              {isVisibleConfirm ? (
                <i className="far fa-eye text-secondary" />
              ) : (
                <i className="far fa-eye-slash text-secondary" />
              )}
            </span>
          </div>
          <button className='button-form my-1' style={{backgroundColor : "#06647B" }} type="submit">Daftar
            {loading ? (
              <svg className="spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
              </svg>
            ) : (
              <div></div>
            )}
          </button>
        </form>
        <div className='d-flex flex-row'>
          <span className='text-size-10' style={{ paddingRight: 3 }}>Sudah punya akun?</span>
          <span className='text-default text-size-10' onClick={SwicthToLogin}>Login</span>
        </div>
      </div>
    </div>
  );
}

export default RegisterModal;
