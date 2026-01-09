import { React, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './croopingImg';

function AkunSetting({ 
    setnameGlobal,
    SetprofileGlobal, 
    SwicthToResetPass, 
    showAlert,
    messageAlert,
    nameAlert,
    // username,
 }) {
    const [profile, setProfile] = useState('');
    const [username, setUsername] = useState('');
    // const [nama_lengkap, setNama_lengkap] = useState('');
    const [namaLengkap, setNamaLengkap] = useState('');
    const [telp, setTelp] = useState('');
    const [email, setEmail] = useState('');
    const [loadingPage, setLoading] = useState(false);
    const [loading, setLoadingUpdate] = useState(false);
    const [Menu, setMenu] = useState('profile');
    const [Newpass, setNewpass] = useState('');
    const [Oldpass, setOldpass] = useState('');
    const [ConfirmNewpass, setConfirmNewpass] = useState('');
    const [isVisibleOld, setisVisibleOld] = useState(false);
    const [isVisible, setisVisible] = useState(false);
    const [isVisibleConfirm, setisVisibleConfirm] = useState(false);
    const [profileImage, setAvatar] = useState(null);
    const [croppedArea, setCroppedArea] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const navigate = useNavigate();
    

    const getData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/get_detail`)

            if (response) {
                setUsername(response.data.data.name);
                setnameGlobal(response.data.data.name);
                // setNama_lengkap(response.data.data.nama_lengkap);
                setNamaLengkap(response.data.data.nama_lengkap);
                setTelp(response.data.data.no_hp);
                setEmail(response.data.data.email);
                setProfile(response.data.data.profile);
                SetprofileGlobal(response.data.data.profile);
                setLoading(false);
            }

        } catch (error) {
            if (error.response?.status === 401) navigate("/");
            else console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    }, [navigate, setnameGlobal, SetprofileGlobal]);

    useEffect(() => {
        getData();
    }, [getData]);


    const ButtonhandleSubmit = () => {
        document.getElementById('submit').click();
    };

    const ButtonhandleSubmitAvatar = () => {
        document.getElementById('submitProfile').click();
    };

    const ButtonhandleSubmitPass = () => {
        document.getElementById('submitChangePass').click();
    };

    const ChangeMenu = (name) => {
        setMenu(name);
    };

    const handleshowPass = (e) => {
        setisVisible(!isVisible)
    };
    const handleshowOldPass = (e) => {
        setisVisibleOld(!isVisibleOld)
    };
    const handleshowConfirmPass = (e) => {
        setisVisibleConfirm(!isVisibleConfirm)
    };
    const handleCancelAvatar = () => {
        setAvatar(null);
        setCroppedImage(null);
        setShowCropper(false);
        document.getElementById('avatar').value = '';
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageURL = URL.createObjectURL(file);
            setAvatar(imageURL);
            setShowCropper(true);
        } else {
            setAvatar(null);
        }
    };
    const handleUploadClick = () => {
        document.getElementById('avatar').click();
    };

    const handleCancelCropping = () => {
        setShowCropper(false);
        setAvatar(null);
        setCroppedArea(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
    };

    const onCropComplete = async () => {
        try {
            const croppedImage = await getCroppedImg(profileImage, croppedArea);
            setCroppedImage(croppedImage);
            setShowCropper(false);
        } catch (e) {
            console.error(e);
        }
    };


    const handleSubmitAvatar = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const formDataObj = new FormData();
    
        if (croppedImage) {
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            formDataObj.append('avatar', blob, 'avatar.jpg'); // Sesuai dengan nama field backend
        }
    
        // Sertakan data lainnya
        formDataObj.append('name', username);
        formDataObj.append('nama_lengkap', namaLengkap);
        formDataObj.append('no_hp', telp);
    
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/update_data`,
                formDataObj,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
    
            if (response.data.status === "success") {
                setProfile(response.data.data.profile); 
                SetprofileGlobal(response.data.data.profile);
    
                messageAlert("Avatar berhasil diperbarui!");
                nameAlert("Success");
                showAlert();
            }
        } catch (error) {
            console.error("Failed to update avatar:", error);
    
            if (error.response) {
                messageAlert(error.response.data.message || "Gagal memperbarui avatar.");
            } else {
                messageAlert("Terjadi kesalahan. Silakan coba lagi.");
            }
            nameAlert("Error");
            showAlert();
        } finally {
            setLoading(false);
            setCroppedImage(null);
            setAvatar(null);
            setShowCropper(false);
        }
    };
    

    
    const handleSubmitUpdateData = async (e) => {
        e.preventDefault();
        setLoadingUpdate(true);
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisatawan/update_data`, {
                name: username, 
                nama_lengkap: namaLengkap, 
                no_hp: telp,
                profile: profileImage,
            })
            if (response) {
                getData();
                setLoadingUpdate(false);
                messageAlert(response.data.message);
                nameAlert('Success')
                showAlert();
            }
        } catch (error) {
            if (error.response.status === 422) {
                setLoadingUpdate(false);
                messageAlert(error.response.data.message);
                nameAlert('Warning')
                showAlert();
            } else {
                setLoadingUpdate(false);
            }
        }

    };

    return (
        <section>
            <div className="bg-cover-profile" style={{ backgroundColor : "#F2F8FF" }}></div>
            {!loadingPage ? (
                <div className='cover-parent-profile'>
                    <div className="container-profile">
                        <div className="middle">
                            <img src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${profile}`} alt="" className="user-pic" />
                            <h4 className="name">{username}</h4>
                            <h4 className="work">{namaLengkap}</h4>
                        </div>
                        <div className="footer-profile">
                            <form onSubmit={handleSubmitAvatar}>
                                <div className="form-group">
                                    <input
                                        type="file"
                                        id="avatar"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                <input
                                    type="submit"
                                    id="submitProfile"
                                    style={{ display: 'none' }}
                                />
                            </form>
                            <button className="btn-follow" onClick={croppedImage ? ButtonhandleSubmitAvatar : handleUploadClick}>{croppedImage ? "Upload Avatar" : "Edit Avatar"} </button><br />
                        </div>
                    </div>
                    <div className="container-profile-right">
                        <div className="content-box-profile">

                            {(showCropper || croppedImage) ? (
                                <div className="content-left-profile">
                                    <div className='form-profile p-4'>
                                        <div className="cropper-container">
                                            {showCropper && (
                                                <div>
                                                    <Cropper
                                                        image={profileImage}
                                                        crop={crop}
                                                        zoom={zoom}
                                                        aspect={1}
                                                        onCropChange={setCrop}
                                                        onZoomChange={setZoom}
                                                        onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedArea(croppedAreaPixels)}
                                                    />
                                                    <div className="crop-button-container">
                                                        <button className='crop' type="button" onClick={onCropComplete}><i className="fa-solid fa-circle-check"/></button>
                                                        <button className='cancel mt-3' type="button" onClick={handleCancelCropping}><i className="fa-solid fa-circle-xmark" /></button>
                                                    </div>
                                                </div>
                                            )}
                                            {croppedImage && (
                                                <div className="form-group avatar-preview-container">
                                                    <img src={croppedImage} alt="Selected Avatar" className="avatar-preview" />
                                                    <button type="button" className="cancel-avatar" onClick={handleCancelAvatar}>
                                                        <i className="fa-solid fa-circle-xmark" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="content-left-profile">
                                    <form className='form-profile p-4' style={{ display: Menu !== 'profile' ? "none" : '' }} onSubmit={handleSubmitUpdateData}>
                                        <div className='group-form-profile my-top-1' style={{ animationDelay: `${0}s` }}>
                                            <i className="fa-solid fa-user mx-right-1 mx-left-1" style={{ color : "#06647B" }} />
                                            <input className='username' type="text" placeholder='Username' id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                                        </div>
                                        <div className='group-form-profile my-top-1' style={{ animationDelay: `${0.3}s` }}>
                                            <i className="fa-solid fa-address-card mx-right-1 mx-left-1" style={{ color : "#06647B" }}/>
                                            <input className='nama_lengkap' type="text" placeholder='Nama Lengkap' id="nama_lengkap" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} required />
                                        </div>
                                        <div className='group-form-profile my-top-1' style={{ animationDelay: `${0.6}s` }}>
                                            <i className="fa-solid fa-phone mx-right-1 mx-left-1" style={{ color : "#06647B" }}/>
                                            <input className='telepon' type="phone" placeholder='Nomor Telpon' id="telpon" value={telp} onChange={(e) => setTelp(e.target.value)} required />
                                        </div>
                                        <div className='group-form-profile my-top-1' style={{ animationDelay: `${0.9}s` }}>
                                            <i className="fa-solid fa-envelope mx-right-1 mx-left-1" style={{ color : "#06647B" }}/>
                                            <input className='email' type="email" placeholder='Email' id="emailRegistrasi" value={email} disabled />
                                        </div>
                                        <input
                                            type="submit"
                                            id="submit"
                                            style={{ display: 'none' }}
                                        />
                                    </form>

                                    <form className='form-profile p-4' style={{ display: Menu !== 'changepass' ? "none" : '' }}>
                                        <div className='group-form-profile my-top-1' style={{ animationDelay: `${0}s` }}>
                                            <i className="fas fa-key text-scondary mx-right-1 text-default" />
                                            <input type={`${isVisibleOld ? 'text' : 'password'}`} placeholder='Password Lama' id="password_lama" value={Oldpass} onChange={(e) => setOldpass(e.target.value)} required />
                                            <span onClick={handleshowOldPass}>
                                                {isVisibleOld ? (
                                                    <i className="far fa-eye text-secondary" />
                                                ) : (
                                                    <i className="far fa-eye-slash text-secondary" />
                                                )}
                                            </span>
                                        </div>
                                        <div className='group-form-profile my-top-1' style={{ animationDelay: `${0.3}s` }}>
                                            <i className="fas fa-key text-scondary mx-right-1 text-default" />
                                            <input type={`${isVisible ? 'text' : 'password'}`} placeholder='Password Baru' id="password_baru" value={Newpass} onChange={(e) => setNewpass(e.target.value)} required />
                                            <span onClick={handleshowPass}>
                                                {isVisible ? (
                                                    <i className="far fa-eye text-secondary" />
                                                ) : (
                                                    <i className="far fa-eye-slash text-secondary" />
                                                )}
                                            </span>
                                        </div>
                                        <div className='group-form-profile my-top-1' style={{ animationDelay: `${0.6}s` }}>
                                            <i className="fas fa-key text-scondary mx-right-1 text-default" />
                                            <input type={`${isVisibleConfirm ? 'text' : 'password'}`} placeholder='Konfirmasi Password Baru' id="confirmpassword_baru" value={ConfirmNewpass} onChange={(e) => setConfirmNewpass(e.target.value)} required />
                                            <span onClick={handleshowConfirmPass}>
                                                {isVisibleConfirm ? (
                                                    <i className="far fa-eye text-secondary" />
                                                ) : (
                                                    <i className="far fa-eye-slash text-secondary" />
                                                )}
                                            </span>
                                        </div>
                                        <input
                                            type="submit"
                                            id="submitChangePass"
                                            style={{ display: 'none' }}
                                        />
                                    </form>

                                    <div className="d-flex px-4">
                                        <button className="button good" style= {{backgroundColor : "#06647B"}}onClick={Menu === 'profile' ? ButtonhandleSubmit : ButtonhandleSubmitPass} >Save Change
                                            {loading ? (
                                                <svg className="spinner" viewBox="0 0 50 50">
                                                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                                </svg>
                                            ) : (
                                                <div></div>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="content-right-profile">
                                <div>
                                    <li className={Menu !== "profile" ? '' : 'selected'} onClick={() => ChangeMenu('profile')}>
                                        <i className="fa-solid fa-user"></i>
                                        <span className='mx-2'>Profil Saya</span>
                                    </li>
                                    <li className={Menu !== "changepass" ? '' : 'selected'} onClick={() => ChangeMenu('changepass')}>
                                        <i className="fa-solid fa-key"></i>
                                        <span className='mx-2'>Ubah Password</span>
                                    </li>
                                </div>
                                <li onClick={SwicthToResetPass}>
                                    <span>Lupa Password?</span>
                                </li>
                            </div>

                        </div>
                    </div>
                </div>
            ) : (
                <div className="classLoadingidetail">
                    <span>
                        <svg className="spinner-only" viewBox="0 0 50 50">
                            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                        </svg>
                    </span>
                </div>
            )}

        </section>
    );
}

export default AkunSetting;
