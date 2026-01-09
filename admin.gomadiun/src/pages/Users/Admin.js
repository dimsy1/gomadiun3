import { React, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import ReactPaginate from 'react-paginate';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faEdit, faTimes, faTrash, faUserLock, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getCroppedImg } from '../../components/croopingImg';
import Cropper from 'react-easy-crop';

const TableAdmin = () => {
    const navigate = useNavigate();
    const [DataUsers, setDataUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setKeyword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [isClosingEdit, setIsClosingEdit] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [isClosingDelete, setIsClosingDelete] = useState(false);
    const [showModalEditPass, setShowModalEditPass] = useState(false);
    const [isClosingEditPass, setIsClosingEditPass] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [croppedArea, setCroppedArea] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseMessageStatus, setResponseMessageStatus] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        nama_lengkap: '',
        email: '',
        password: '',
        status_akun: 'aktif'
    });

    const [formDataEdit, setFormDataEdit] = useState({
        name: '',
        nama_lengkap: '',
        email: '',
        status_akun: '',
        id: '',
        sampul_admin: ''
    });  

    const [DataDelete, setDataDelete] = useState({
        id: '',
        name: '',
        email: '',
        role: '',
        sampul_admin: ''
    });
    
    const [formDataEditPass, setFormDataEditPass] = useState({
        id: '',
        oldpassword: '',
        newpassword: '',
        confirmnewpassword: ''
    });


    const searchKeyword = (event) => {
        setLoading(true);
        setDataUsers([])
        const value = event.target.value;
        setKeyword(value);
        debounceGetData(value);
    };

    const debounceGetData = useCallback(
        debounce((value) => {
            getData(value);
        }, 1000),
        []
    );

    const getData = async (searchTerm = '') => {
        setLoading(true);
        setDataUsers([])
        try {
            const url = searchTerm
                ? `${process.env.REACT_APP_BACKEND_API_URL}/api/superAdmin/get_all?keyword=${searchTerm}`
                : `${process.env.REACT_APP_BACKEND_API_URL}/api/superAdmin/get_all`;

            const response = await axios.get(url);
            if (response) {
                setDataUsers(response.data.data)
                setLoading(false);
            }
        } catch (error) {
            if (error.response.status === 401) {
                navigate('/');
                setLoading(false);
            }
            else {
                console.log(error.response)
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 6; // Tentukan jumlah item per halaman
    const offset = currentPage * itemsPerPage;
    const currentPageData = DataUsers.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(DataUsers.length / itemsPerPage);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const openModal = () => {
        setShowModal(true);
        setIsClosing(false);
    };

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
        }, 500); 
    };

    const openModalEdit = (id_admin, name_admin, email, nama_lengkap, status_akun, sampul) => {
        setFormDataEdit({
            id: id_admin,
            name: name_admin,
            email: email,
            nama_lengkap: nama_lengkap,
            status_akun: status_akun,
            sampul_admin: sampul
        });
        setShowModalEdit(true);
        setIsClosingEdit(false);
    };

    const closeModalEdit = () => {
        setIsClosingEdit(true);
        setTimeout(() => {
            setShowModalEdit(false);
            setIsClosingEdit(false);
        }, 500); 
    };

    const openModalEditPass = (id_admin) => {
        setFormDataEditPass({id: id_admin})
        setShowModalEditPass(true);
        setIsClosingEditPass(false);
    };

    const closeModalEditPass = () => {
        setIsClosingEditPass(true);
        setTimeout(() => {
            setShowModalEditPass(false);
            setIsClosingEditPass(false);
        }, 500); 
    };

    const openModalDelete = (id_admin, name_admin, email, role, sampul) => {
        setDataDelete({
            id: id_admin,
            name: name_admin,
            email: email,
            role: role,
            sampul_admin: sampul
        });
        setShowModalDelete(true);
        setIsClosingDelete(false);
    };

    const closeModalDelete = () => {
        setIsClosingDelete(true);
        setTimeout(() => {
            setShowModalDelete(false);
            setIsClosingDelete(false);
            setDataDelete({
                id: '',
                name: '',
                email: '',
                role: '',
                sampul_admin: ''
            });
        }, 500);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleInputChangeEdit = (e) => {
        const { name, value } = e.target;
        setFormDataEdit({ ...formDataEdit, [name]: value });
    };

    const handleInputChangeEditPass = (e) => {
        const { name, value } = e.target;
        setFormDataEditPass({ ...formDataEditPass, [name]: value });
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

    const handleCancelAvatar = () => {
        setAvatar(null);
        setCroppedImage(null);
        setShowCropper(false);
        document.getElementById('avatar').value = '';
    };

    const handleUploadClick = () => {
        document.getElementById('avatar').click();
    };

    const ButtonhandleSubmit = () => {
        document.getElementById('submit').click();
    };

    const ButtonhandleSubmitDelete = () => {
        document.getElementById('submitDelete').click();
    };

    const ButtonhandleSubmitUpdate = () => {
        document.getElementById('submitEdit').click();
    };

    const ButtonhandleSubmitUpdatePass = () => {
        document.getElementById('submitEditPass').click();
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
            const croppedImage = await getCroppedImg(avatar, croppedArea);
            setCroppedImage(croppedImage);
            setShowCropper(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formDataObj = new FormData();
        for (const key in formData) {
            formDataObj.append(key, formData[key]);
        }
        if (croppedImage) {
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            formDataObj.append('image', blob, 'avatar.jpg');
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/superAdmin/add_data`, formDataObj)
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModal();
                getData();
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    nama_lengkap: '',
                    status_akun: 'aktif'
                })
                handleCancelCropping();
                handleCancelAvatar();
                setTimeout(() => {
                    setResponseMessage('');
                    setResponseMessageStatus('');
                }, 2000)
            }
        } catch (error) {
            if (error.response.status === 422) {
                closeModal();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessage('');
                }, 2000)
            } else {
                closeModal();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            }
        }

    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataObj = new FormData();

        formDataObj.append("name", formDataEdit.name);
        formDataObj.append("email", formDataEdit.email);
        formDataObj.append("nama_lengkap", formDataEdit.nama_lengkap);
        formDataObj.append("status_akun", formDataEdit.status_akun);

        if (croppedImage) {
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            formDataObj.append('image', blob, 'avatar.jpg');
        }
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/superAdmin/update/${formDataEdit.id}`, formDataObj)
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModalEdit();
                getData();
                setFormDataEdit({
                    id: '',
                    name: '',
                    email: '',
                    nama_lengkap: '',
                    status_akun: '',
                    sampul_admin: ''
                })
                handleCancelCropping();
                handleCancelAvatar();
                setTimeout(() => {
                    setResponseMessage('');
                    setResponseMessageStatus('');
                }, 2000)
            }
        } catch (error) {
            if (error.response.status === 422) {
                closeModalEdit();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            } else {
                closeModalEdit();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            }
        }

    };
    
    const handleSubmitUpdatePass = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/changepass/admin/${formDataEditPass.id}`, { 
                old_pass: formDataEditPass.oldpassword, 
                new_pass: formDataEditPass.newpassword, 
                newPass_comfirm: formDataEditPass.confirmnewpassword 
            })
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModalEditPass();
                getData();
                setFormDataEditPass({
                    id: '',
                    oldpassword: '',
                    newpassword: '',
                    confirmnewpassword: ''
                })
                setTimeout(() => {
                    setResponseMessage('');
                    setResponseMessageStatus('');
                }, 2000)
            }
        } catch (error) {
            if (error.response.status === 422) {
                closeModalEditPass();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            } else {
                closeModalEditPass();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            }
        }

    };

    const handleSubmitDelete = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/api/admin/delete/${DataDelete.id}`)
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModalDelete();
                getData();
                setTimeout(() => {
                    setResponseMessage('');
                    setResponseMessageStatus('');
                }, 2000)
            }
        } catch (error) {
            if (error.response.status === 422) {
                closeModal();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessage('');
                    setResponseMessageStatus('');
                }, 2000)
            } else {
                closeModal();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            }
        }

    };

    return (
        <div className="main-panel">
            <div className="content-wrapper">
                <div className="row">
                    <div className='d-flex justify-content-end w-100'>
                        <button type="button" className="button good rounded" onClick={openModal}>
                            <FontAwesomeIcon icon={faUserPlus} width={17} />
                            <span className='mx-2'>Add User</span>
                        </button>
                    </div>

                    {showModal && (
                        <div className={`modal ${isClosing ? 'closing' : ''}`}>
                            <div className="modal-content slideDown">
                                <div className="modal-header">
                                    <h3>Form Tambah</h3>
                                    <div>
                                        <span className="close" onClick={closeModal}>&times;</span>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit} className="modal-form">
                                        <div className="form-group">
                                            <label htmlFor="name">Username</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="nama_lengkap">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                name="nama_lengkap"
                                                value={formData.nama_lengkap}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password">Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="status_akun">Status Akun</label>
                                            <select
                                                name="status_akun"
                                                value={formData.status_akun}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="aktif">Aktif</option>
                                                <option value="suspend">Non Aktif</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="avatar">Upload Avatar</label>
                                            <button type="button" className="btn btn-outline-secondary btn-icon-text" onClick={handleUploadClick}>
                                                <i className="ti-upload btn-icon-prepend"></i>
                                                Upload
                                            </button>
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
                                            id="submit"
                                            style={{ display: 'none' }}
                                        />
                                        {showCropper && (
                                            <div className="cropper-container">
                                                <Cropper
                                                    image={avatar}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={1}
                                                    onCropChange={setCrop}
                                                    onZoomChange={setZoom}
                                                    onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedArea(croppedAreaPixels)}
                                                />
                                                <div className="crop-button-container">
                                                    <button className='crop' type="button" onClick={onCropComplete}><FontAwesomeIcon icon={faCheck} /></button>
                                                    <button className='cancel mt-3' type="button" onClick={handleCancelCropping}><FontAwesomeIcon icon={faTimes} /></button>
                                                </div>
                                            </div>
                                        )}
                                        {croppedImage && (
                                            <div className="form-group avatar-preview-container">
                                                <img src={croppedImage} alt="Selected Avatar" className="avatar-preview" />
                                                <button type="button" className="cancel-avatar" onClick={handleCancelAvatar}>
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button className="button good" onClick={ButtonhandleSubmit} >Save</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showModalEdit && (
                        <div className={`modal ${isClosingEdit ? 'closing' : ''}`}>
                            <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Form Edit</h3>
                                    <div>
                                        <span className="close" onClick={closeModalEdit}>&times;</span>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <form className="modal-form" onSubmit={handleSubmitUpdate}>
                                        <div className="form-group">
                                            <label htmlFor="name">Username</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formDataEdit.name}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="nama_lengkap">Nama Lengkap</label>
                                            <input
                                                type="text"
                                                name="nama_lengkap"
                                                value={formDataEdit.nama_lengkap}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formDataEdit.email}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="status_akun">Status Akun</label>
                                            <select
                                                name="status_akun"
                                                value={formDataEdit.status_akun}
                                                onChange={handleInputChangeEdit}
                                                required
                                            >
                                                <option value="aktif">Aktif</option>
                                                <option value="suspend">Non Aktif</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="avatar">Ubah Avatar</label>
                                            <div>
                                                <img src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${formDataEdit.sampul_admin}`} alt={formDataEdit.sampul_admin} style={{ width: '100px' }} />
                                            </div>
                                            <button type="button" className="btn btn-outline-secondary btn-icon-text mt-3" onClick={handleUploadClick}>
                                                <i className="ti-upload btn-icon-prepend"></i>
                                                Upload
                                            </button>
                                            <input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                                        </div>
                                        {showCropper && (
                                            <div className="cropper-container">
                                                <Cropper
                                                    image={avatar}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={1}
                                                    onCropChange={setCrop}
                                                    onZoomChange={setZoom}
                                                    onCropComplete={(croppedArea, croppedAreaPixels) => setCroppedArea(croppedAreaPixels)}
                                                />
                                                <div className="crop-button-container">
                                                    <button className='crop' type="button" onClick={onCropComplete}><FontAwesomeIcon icon={faCheck} /></button>
                                                    <button className='cancel mt-3' type="button" onClick={handleCancelCropping}><FontAwesomeIcon icon={faTimes} /></button>
                                                </div>
                                            </div>
                                        )}
                                        {croppedImage && (
                                            <div className="form-group avatar-preview-container">
                                                <img src={croppedImage} alt="Selected Avatar" className="avatar-preview" />
                                                <button type="button" className="cancel-avatar" onClick={handleCancelAvatar}>
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            type="submit"
                                            id="submitEdit"
                                            style={{ display: 'none' }}
                                        />
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="button good" onClick={ButtonhandleSubmitUpdate}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showModalDelete && (
                        <div className={`modal ${isClosingDelete ? 'closing' : ''}`} onClick={closeModalDelete}>
                            <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Konfirmasi</h3>
                                    <div>
                                        <span className="close" onClick={closeModalDelete}>&times;</span>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <form className="modal-form" onSubmit={handleSubmitDelete}>
                                        <div className="form-group">
                                            <label htmlFor="namepick">Apakah Anda yakin untuk menghapus data ini?</label>
                                            <div className="detail-item">
                                                <img src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${DataDelete.sampul_admin}`} alt={DataDelete.sampul_admin} style={{ width: '100px' }} />
                                                <div className='ml-3'>
                                                    <p><strong>Nama:</strong> {DataDelete.name}</p>
                                                    <p><strong>email:</strong> {DataDelete.email}</p>
                                                    <p><strong>Role:</strong> {DataDelete.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="submit"
                                            id="submitDelete"
                                            style={{ display: 'none' }}
                                        />
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="button good" onClick={closeModalDelete}>Batal</button>
                                    <button type="button" className="button danger" onClick={ButtonhandleSubmitDelete}>Hapus</button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {showModalEditPass && (
                        <div className={`modal ${isClosingEditPass ? 'closing' : ''}`}>
                            <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Form Edit</h3>
                                    <div>
                                        <span className="close" onClick={closeModalEditPass}>&times;</span>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <form className="modal-form" onSubmit={handleSubmitUpdatePass}>
                                        <div className="form-group">
                                            <label htmlFor="password">Password Lama</label>
                                            <input
                                                type="password"
                                                name="oldpassword"
                                                value={formDataEditPass.oldpassword}
                                                onChange={handleInputChangeEditPass}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password">Password Baru</label>
                                            <input
                                                type="password"
                                                name="newpassword"
                                                value={formDataEditPass.newpassword}
                                                onChange={handleInputChangeEditPass}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password">Konfirmasi Password Baru</label>
                                            <input
                                                type="password"
                                                name="confirmnewpassword"
                                                value={formDataEditPass.confirmnewpassword}
                                                onChange={handleInputChangeEditPass}
                                                required
                                            />
                                        </div>
                                        <input
                                            type="submit"
                                            id="submitEditPass"
                                            style={{ display: 'none' }}
                                        />
                                    </form>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="button good" onClick={ButtonhandleSubmitUpdatePass}>Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="col-lg-12 grid-margin stretch-card mt-3">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">Tabel Super Admin</h4>
                                {responseMessage && (
                                    <div className={`alert ${responseMessageStatus === "success" ? "alert-success" : "alert-danger"}`} role="alert">
                                        {responseMessage}
                                    </div>
                                )}
                                <div className="search-container">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={searchKeyword}
                                    />
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Nama</th>
                                                <th>Email</th>
                                                <th>status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentPageData.length === 0 ? (
                                                <>
                                                    {loading ? (
                                                        <>
                                                            <tr className='under-line'>
                                                                <td className="py-1"></td>
                                                                <td></td>

                                                                <td>
                                                                    <svg className="spinner black" viewBox="0 0 50 50">
                                                                        <circle className="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                                                                    </svg> Loading</td>
                                                                <td></td>
                                                                <td></td>
                                                            </tr>
                                                        </>
                                                    ) : (

                                                        <tr className='under-line'>
                                                            <td className="py-1"></td>
                                                            <td></td>
                                                            <td>Data tidak ditemukan</td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    )}
                                                </>

                                            ) : (
                                                <>
                                                    {currentPageData.map((item, index) => (
                                                        <tr key={index} className='under-line'>
                                                            <td className="py-1">
                                                                <img className='mr-2' src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${item.sampul_admin}`} alt="image" /> {item.nama_admin}
                                                            </td>
                                                            <td>{item.namaLengkap_admin}</td>
                                                            <td>{item.email_admin}</td>
                                                            <td><label className={`badge ${item.status_akun === "aktif" ? " badge-success" : " badge-danger"}`}>{item.status_akun}</label></td>
                                                            <td><FontAwesomeIcon icon={faEdit} onClick={() => openModalEdit(item.id_admin, item.nama_admin, item.email_admin, item.namaLengkap_admin, item.status_akun, item.sampul_admin)} />
                                                                <FontAwesomeIcon className='mx-2' icon={faUserLock} onClick={() => openModalEditPass(item.id_admin)} />
                                                                <FontAwesomeIcon icon={faTrash} onClick={() => openModalDelete(item.id_admin, item.namaLengkap_admin, item.email_admin, item.role, item.sampul_admin)} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className='my-5'>
                                    <ReactPaginate
                                        containerClassName={"pagination"}
                                        subContainerClassName={"pages pagination"}
                                        previousLabel={<FontAwesomeIcon icon={faArrowLeft} />}
                                        nextLabel={<FontAwesomeIcon icon={faArrowRight} />}
                                        breakLabel={"..."}
                                        breakClassName={"break-me"}
                                        pageCount={pageCount}
                                        marginPagesDisplayed={2}
                                        pageRangeDisplayed={5}
                                        onPageChange={handlePageClick}
                                        activeClassName={"active"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TableAdmin;
