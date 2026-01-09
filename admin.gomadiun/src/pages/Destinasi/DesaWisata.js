import { React, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import ReactPaginate from 'react-paginate';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faCheck, faEdit, faEye, faTimes, faTrash, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getCroppedImg16_9 } from '../../components/croopingImg16-9';
import Cropper from 'react-easy-crop';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2/dist/js/select2.min.js';
import { faSquarePlus } from '@fortawesome/free-regular-svg-icons';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const TableDesaWisata = ({ role, id_admin_login }) => {
    const navigate = useNavigate();
    const [DataUsers, setDataUsers] = useState([]);
    const [DataDetailAdminVerifikator, setDataDetailAdminVerifikator] = useState([]);
    const [DataAdminOption, setDataAdminOption] = useState([]);
    const [DataAdminDinasOption, setDataAdminDinasOption] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [showModalDetailAdmin, setShowModalDetailAdmin] = useState(false);
    const [isClosingDetailAdmin, setIsClosingDetailAdmin] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [showModalEdit, setShowModalEdit] = useState(false);
    const [isClosingEdit, setIsClosingEdit] = useState(false);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [isClosingDelete, setIsClosingDelete] = useState(false);
    const [showModalFormVerifikasi, setShowModalFormVerifikasi] = useState(false);
    const [isClosingFormVerifikasi, setIsClosingFormVerifikasi] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [croppedArea, setCroppedArea] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [searchTerm, setKeyword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [responseMessageStatus, setResponseMessageStatus] = useState('');
    const [AlertaddImage, setAlertaddImage] = useState('');

    const [formData, setFormData] = useState({
        id_admin: '',
        nama_desaWisata: 'Desa Wisata ',
        desk_desaWisata: '',
        no_hp: '',
        latitude: '',
        longitude: '',
    });

    const [formDataEdit, setFormDataEdit] = useState({
        // id_admin: '',
        nama_desaWisata: '',
        desk_desaWisata: '',
        no_hp: '',
        id: '',
        sampul_desawisata: '',
        latitude: '',
        longitude: ''
    });

    const [DataDelete, setDataDelete] = useState({
        id: '',
        name: '',
        sampul_desawisata: ''
    });

    const [DataDetailAdmin, setDataDetailAdmin] = useState({
        jenis_detail: '',
        username: '',
        nama_lengkap: '',
        role: '',
        sampul_admin: ''
    });

    const [DataFormVerifikasi, setDataFormVerifikasi] = useState({
        id_desaWisata: '',
        id_admin: '',
        username: '',
        nama_lengkap: '',
        sampul_admin: '',
        status_verifikasi: ''
    });



    const searchKeyword = (event) => {
        setLoading(true);
        setDataUsers([])
        const value = event.target.value;
        setKeyword(value);
        debounceGetData(value);
    };

    // Atur ikon marker biar tidak error
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ onSelect }) => {
    useMapEvents({
      click(e) {
        onSelect(e.latlng);
      },
    });
    return null;
  };

  const handleMapClick = (latlng) => {
    setFormData({ ...formData, latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) });
  };

  const handleMapClickEdit = (latlng) => {
    setFormDataEdit({ ...formDataEdit, latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) });
  };

    const debounceGetData = useCallback(
        debounce((value) => {
            getData(value);
        }, 1000),
        []
    );

    const getDataOption = async () => {
        setLoading(true);
        setDataAdminOption([])
        setDataAdminDinasOption([])
        try {
            const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/option/adminpengelola`;

            const response = await axios.get(url);
            if (response) {
                setDataAdminOption(response.data.data)

                if (role === "admin") {

                    try {
                        const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/option/admindinas`;

                        const response = await axios.get(url);
                        if (response) {
                            setDataAdminDinasOption(response.data.data)
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
                }

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

    const getData = async (searchTerm = '') => {
        setLoading(true);
        setDataUsers([])
        try {
            let url = null;
            if (role === "admin" || role === "dinas") {
                getDataOption()
            }
            if (role === "admin" || role === "dinas") {
                url = `${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/get_all/byAdmin?keyword=${searchTerm}`;
            }
            else if (role === "admin pengelola") {
                url = `${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/get_all/byAdmin?byAdmin=${id_admin_login}&keyword=${searchTerm}`;
            }
            else {
                url = `${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/get_all/byAdmin?keyword=${searchTerm}`;
            }

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

    const getDataDetailAdminDinas = async (id) => {
        setLoading1(true);
        setDataDetailAdminVerifikator([])
        try {
            const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/detail/adminDinas/${id}`;

            const response = await axios.get(url);
            if (response) {
                setDataDetailAdminVerifikator(response.data.data)
                setLoading1(false);
            }
        } catch (error) {
            if (error.response.status === 401) {
                navigate('/');
                setLoading1(false);
            }
            else {
                console.log(error.response)
                setLoading1(false);
            }
        }
    };

    useEffect(() => {
        if (showModal) {
            $('#id_admin').select2({
                placeholder: '--- Pilih Admin ---',
                allowClear: true,
            }).on('change', (e) => {
                const selectedValue = $(e.target).val();
                setFormData({ ...formData, id_admin: selectedValue });
            });
            return () => {
                $('#id_admin').select2('destroy');
            };
        }
    }, [showModal]);

    // useEffect(() => {
    //     if (showModalEdit) {
    //         $('#id_admin_edit').select2({
    //             placeholder: '--- Pilih Admin ---',
    //             allowClear: true,
    //         }).on('change', (e) => {
    //             const selectedValue = $(e.target).val();
    //             setFormDataEdit({ ...formDataEdit, id_admin: selectedValue });
    //         });
    //         return () => {
    //             $('#id_admin_edit').select2('destroy');
    //         };
    //     }
    // }, [showModalEdit]);

    useEffect(() => {
        if (showModalFormVerifikasi) {
            $('#id_admin_verif').select2({
                placeholder: '--- Pilih Admin ---',
                allowClear: true,
            }).on('change', (e) => {
                const selectedValue = $(e.target).val();
                getDataDetailAdminDinas(selectedValue);
                setDataFormVerifikasi({ ...DataFormVerifikasi, id_admin: selectedValue });
            });
            return () => {
                $('#id_admin_verif').select2('destroy');
            };
        }
    }, [showModalFormVerifikasi]);

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

    // const openModalEdit = (id_admin, nama_desaWisata, desk_desaWisata, no_hp, id, sampul) => {
    //     setFormDataEdit({
    //         id_admin: id_admin,
    //         nama_desaWisata: nama_desaWisata,
    //         desk_desaWisata: desk_desaWisata,
    //         no_hp: no_hp,
    //         id: id,
    //         sampul_desawisata: sampul
    //     });
    //     setShowModalEdit(true);
    //     setIsClosingEdit(false);
    // };

    const openModalEdit = (nama_desaWisata, desk_desaWisata, no_hp, id, sampul, latitude, longitude) => {
        setFormDataEdit({
            nama_desaWisata: nama_desaWisata,
            desk_desaWisata: desk_desaWisata,
            no_hp: no_hp,
            id: id,
            sampul_desawisata: sampul,
            latitude: latitude,
            longitude: longitude,
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

    const openModalDelete = (id_desawisata, name_desawisata, sampul) => {
        setDataDelete({
            id: id_desawisata,
            name: name_desawisata,
            sampul_desawisata: sampul
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
                sampul_desawisata: ''
            });
        }, 500);
    };

    const openModalDetailAdmin = (jenis_detail, name_admin, nameLengkap_admin, role, sampul) => {
        setDataDetailAdmin({
            jenis_detail: jenis_detail,
            username: name_admin,
            nama_lengkap: nameLengkap_admin,
            role: role,
            sampul_admin: sampul
        });
        setShowModalDetailAdmin(true);
        setIsClosingDetailAdmin(false);
    };

    const closeModalDetailAdmin = () => {
        setIsClosingDetailAdmin(true);
        setTimeout(() => {
            setShowModalDetailAdmin(false);
            setIsClosingDetailAdmin(false);
            setDataDetailAdmin({
                jenis_detail: '',
                username: '',
                nama_lengkap: '',
                role: '',
                sampul_admin: ''
            });
        }, 500);
    };

   const openModalFormVerifikasi = (id_desaWisata, status, admin) => {
    if (role === "dinas") {
        setDataFormVerifikasi(prev => ({
            ...prev,
            id_admin: id_admin_login,
            id_desaWisata: id_desaWisata,
            status_verifikasi: status
        }));
        getDataDetailAdminDinas(id_admin_login);
    } else {
        if (admin && admin.id_admin) {
            getDataDetailAdminDinas(admin.id_admin);
            setDataFormVerifikasi(prev => ({
                ...prev,
                id_admin: admin.id_admin,
                id_desaWisata: id_desaWisata,
                status_verifikasi: status,
                username: admin.nama_admin || '',
                nama_lengkap: admin.namaLengkap_admin || '',
                sampul_admin: admin.sampul_admin || ''
            }));
        } else {
            // Jika belum pernah diverifikasi
            setDataFormVerifikasi(prev => ({
                ...prev,
                id_admin: '',
                id_desaWisata: id_desaWisata,
                status_verifikasi: status
            }));
        }
    }
    setShowModalFormVerifikasi(true);
    setIsClosingFormVerifikasi(false);
};


    const closeModalFormVerifikasi = () => {
        setIsClosingFormVerifikasi(true);
        setTimeout(() => {
            setShowModalFormVerifikasi(false);
            setIsClosingFormVerifikasi(false);
            setDataFormVerifikasi({
                id_desaWisata: '',
                id_admin: '',
                username: '',
                nama_lengkap: '',
                sampul_admin: '',
                status_verifikasi: ''
            });
            setDataDetailAdminVerifikator([])
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

    const handleInputChangeFormVerifikasi = (e) => {
    const { name, value } = e.target;
    setDataFormVerifikasi(prev => ({
        ...prev,
        [name]: value
    }));
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

    const ButtonhandleSubmitVerifikasi = () => {
        document.getElementById('submitVerifikasi').click();
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
            const croppedImage = await getCroppedImg16_9(avatar, croppedArea);
            setCroppedImage(croppedImage);
            setShowCropper(false);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (croppedImage) {
            const formDataObj = new FormData();

            for (const key in formData) {
                formDataObj.append(key, formData[key]);
            }
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            formDataObj.append('image', blob, 'avatar.jpg');

            try {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/add_data/byAdmin`, formDataObj)
                if (response) {
                    setResponseMessage(response.data.message);
                    setResponseMessageStatus(response.data.status);
                    closeModal();
                    getData();
                    setFormData({
                        id_admin: '',
                        nama_desaWisata: 'Desa Wisata ',
                        desk_desaWisata: '',
                        no_hp: '',
                        latitude: '',
                        longitude: '',
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
        } else {
            setAlertaddImage('Mohon pilih sampul desa wisata')
            setTimeout(() => {
                setAlertaddImage('');
            }, 2000)
        }
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataObj = new FormData();

        // formDataObj.append("id_admin", formDataEdit.id_admin);
        formDataObj.append("nama_desaWisata", formDataEdit.nama_desaWisata);
        formDataObj.append("desk_desaWisata", formDataEdit.desk_desaWisata);
        formDataObj.append("no_hp", formDataEdit.no_hp);
        formDataObj.append("latitude", formDataEdit.latitude);
        formDataObj.append("longitude", formDataEdit.longitude);

        if (croppedImage) {
            const response = await fetch(croppedImage);
            const blob = await response.blob();
            formDataObj.append('image', blob, 'desawisata_sampul.jpg');
        }
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/update/byAdmin/${formDataEdit.id}`, formDataObj)
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModalEdit();
                getData();
                setFormDataEdit({
                    id_admin: '',//sebelumnya di command
                    nama_desaWisata: '',
                    desk_desaWisata: '',
                    no_hp: '',
                    id: '',
                    sampul_desawisata: '',
                    latitude: '',
                    longitude: ''
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

    const handleSubmitDelete = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/delete/byAdmin/${DataDelete.id}`)
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
                closeModalDelete();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessage('');
                    setResponseMessageStatus('');
                }, 2000)
            } else {
                closeModalDelete();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            }
        }

    };

    const handleSubmitUpdateVerifikasi = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/verif/byAdmin/${DataFormVerifikasi.id_desaWisata}`, {
                id_admin: DataFormVerifikasi.id_admin,
                status_verifikasi: DataFormVerifikasi.status_verifikasi
            })
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModalFormVerifikasi();
                getData();
                setDataFormVerifikasi({
                    id_desaWisata: '',
                    id_admin: '',
                    username: '',
                    nama_lengkap: '',
                    sampul_admin: '',
                    status_verifikasi: ''
                })
                setTimeout(() => {
                    setResponseMessage('');
                    setResponseMessageStatus('');
                }, 2000)
            }
        } catch (error) {
            if (error.response.status === 422) {
                closeModalFormVerifikasi();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            } else {
                closeModalFormVerifikasi();
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
                            <FontAwesomeIcon icon={faSquarePlus} width={17} />
                            <span className='mx-2'>Add Data</span>
                        </button>
                    </div>

                    {showModal && (
                        <div className={`modal ${isClosing ? 'closing' : ''}`}>
                            <div className="modal-content slideDown">
                                {AlertaddImage && (
                                    <div className={`alert alert-warning`} role="alert">
                                        {AlertaddImage}
                                    </div>
                                )}
                                <div className="modal-header">
                                    <h3>Form Tambah</h3>
                                    <div>
                                        <span className="close" onClick={closeModal}>&times;</span>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <form onSubmit={handleSubmit} className="modal-form">
                                        {(role === "admin" || role === "dinas") && (

                                            <div className="form-group">
                                                <label htmlFor="id_admin">Admin Pengelola</label>
                                                <select
                                                    className="form-control"
                                                    id="id_admin"
                                                    name="id_admin"
                                                    style={{ width: '100%' }}
                                                    value={formData.id_admin}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">select</option>

                                                    {DataAdminOption.length !== 0 && (
                                                        <>
                                                            {DataAdminOption.map((item, index) => (
                                                                <option key={index} value={item.id_admin}>{item.nama_admin}</option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label htmlFor="name">Nama Desa Wisata</label>
                                            <input
                                                type="text"
                                                name="nama_desaWisata"
                                                value={formData.nama_desaWisata}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="desk_desaWisata">Deskripsi</label>
                                            <textarea
                                                name="desk_desaWisata"
                                                value={formData.desk_desaWisata}
                                                onChange={handleInputChange}
                                                rows="5"
                                                style={{ width: '100%' }}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="no_hp">No. telp</label>
                                            <input
                                                type="text"
                                                name="no_hp"
                                                value={formData.no_hp}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="latitude">Latitude</label>
                                            <input
                                                type="text"
                                                name="latitude"
                                                value={formData.latitude}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="longitude">Longitude</label>
                                            <input
                                                type="text"
                                                name="longitude"
                                                value={formData.longitude}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        {/* <h3>Pilih Lokasi di Peta:</h3>
                                              <MapContainer center={[-7.5, 112.7]} zoom={8} style={{ height: '400px', marginTop: '20px' }}>
                                                <TileLayer
                                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <LocationMarker onSelect={handleMapClick} />
                                                {formData.latitude && formData.longitude && (
                                                  <Marker position={[formData.latitude, formData.longitude]} />
                                                )}
                                              </MapContainer> */}
                                        <div className="form-group">
                                            <label htmlFor="avatar">Upload Sampul</label>
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
                                                    aspect={3 / 4}
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
                                        {/* {(role === "admin" || role === "dinas") && (

                                            <div className="form-group">
                                                <label htmlFor="id_admin">Admin Pengelola</label>
                                                <select
                                                    className="form-control"
                                                    id="id_admin_edit"
                                                    name="id_admin"
                                                    style={{ width: '100%' }}
                                                    value={formDataEdit.id_admin}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">select</option>

                                                    {DataAdminOption.length !== 0 && (
                                                        <>
                                                            {DataAdminOption.map((item, index) => (
                                                                <option key={index} value={item.id_admin}>{item.nama_admin}</option>
                                                            ))}
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        )} */}
                                        <div className="form-group">
                                            <label htmlFor="name">Nama Desa Wisata</label>
                                            <input
                                                type="text"
                                                name="nama_desaWisata"
                                                value={formDataEdit.nama_desaWisata}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="desk_desaWisata">Deskripsi</label>
                                            <textarea
                                                name="desk_desaWisata"
                                                value={formDataEdit.desk_desaWisata}
                                                onChange={handleInputChangeEdit}
                                                rows="7"
                                                style={{ width: '100%' }}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="no_hp">No. telp</label>
                                            <input
                                                type="text"
                                                name="no_hp"
                                                value={formDataEdit.no_hp}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="avatar">Ubah Sampul</label>
                                            <div>
                                                <img src={`${formDataEdit.sampul_desawisata}`} alt={formDataEdit.sampul_desawisata} style={{ width: '200px' }} />
                                            </div>
                                            <button type="button" className="btn btn-outline-secondary btn-icon-text mt-3" onClick={handleUploadClick}>
                                                <i className="ti-upload btn-icon-prepend"></i>
                                                Upload
                                            </button>
                                            <input type="file" id="avatar" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                                        </div>
                                        <input
                                            type="submit"
                                            id="submitEdit"
                                            style={{ display: 'none' }}
                                        />
                                        {showCropper && (
                                            <div className="cropper-container">
                                                <Cropper
                                                    image={avatar}
                                                    crop={crop}
                                                    zoom={zoom}
                                                    aspect={3 / 4}
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
                                <div className="form-group">
                                            <label htmlFor="latitude">Latitude</label>
                                            <input
                                                type="text"
                                                name="latitude"
                                                value={formDataEdit.latitude}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                <div className="form-group">
                                            <label htmlFor="longitude">Longitude</label>
                                            <input
                                                type="text"
                                                name="longitude"
                                                value={formDataEdit.longitude}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        {/* <h3>Pilih Lokasi di Peta:</h3>
                                              <MapContainer center={[-7.5, 112.7]} zoom={8} style={{ height: '400px', marginTop: '20px' }}>
                                                <TileLayer
                                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                />
                                                <LocationMarker onSelect={handleMapClickEdit} />
                                                {formDataEdit.latitude && formDataEdit.longitude && (
                                                  <Marker position={[formDataEdit.latitude, formDataEdit.longitude]} />
                                                )}
                                              </MapContainer> */}
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
                                            <div className="detail-item flex-column">
                                                <img className='mt-2' src={`${DataDelete.sampul_desawisata}`} alt={DataDelete.sampul_desawisata} style={{ height: '150px' }} />
                                                <div className='mt-3'>
                                                    <strong> {DataDelete.name}</strong>
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

                    {showModalDetailAdmin && (
                        <div className={`modal ${isClosingDetailAdmin ? 'closing' : ''}`} onClick={closeModalDetailAdmin}>
                            <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Detail {DataDetailAdmin.jenis_detail === "admin" ? "Admin Desa Wisata" : DataDetailAdmin.jenis_detail === "author" ? "Admin Author" : "Admin Verifikator"}</h3>
                                    <div>
                                        <span className="close" onClick={closeModalDetailAdmin}>&times;</span>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    <div className="detail-item">
                                        <img src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${DataDetailAdmin.sampul_admin}`} alt={DataDetailAdmin.sampul_admin} style={{ width: '100px' }} />
                                        <div className='ml-3'>
                                            <p><strong>Username:</strong> {DataDetailAdmin.username}</p>
                                            <p><strong>Nama Lengkap:</strong> {DataDetailAdmin.nama_lengkap}</p>
                                            <p><strong>Role:</strong> Admin {DataDetailAdmin.role}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="button good" onClick={closeModalDetailAdmin}>Tutup</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {showModalFormVerifikasi && (
                        <div className={`modal ${isClosingFormVerifikasi ? 'closing' : ''}`} onClick={closeModalFormVerifikasi}>
                            <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Verifikasi Desa Wisata</h3>
                                    <div>
                                        <span className="close" onClick={closeModalFormVerifikasi}>&times;</span>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    {role === 'admin' && (
                                        <>
                                            <form className="modal-form" onSubmit={handleSubmitUpdateVerifikasi}>
                                                <div className="form-group">
                                                    <label htmlFor="id_admin_verif">Admin Dinas</label>
                                                    <select
                                                        className="form-control"
                                                        id="id_admin_verif"
                                                        name="id_admin"
                                                        style={{ width: '100%' }}
                                                        value={DataFormVerifikasi.id_admin}
                                                        required
                                                    >
                                                        <option value="">select</option>

                                                        {DataAdminDinasOption.length !== 0 && (
                                                            <>
                                                                {DataAdminDinasOption.map((item, index) => (
                                                                    <option key={index} value={item.id_admin}>{item.nama_admin}</option>
                                                                ))}
                                                            </>
                                                        )}
                                                    </select>
                                                </div>

                                                <div className="form-group">

                                                    {loading1 ? (
                                                        <>
                                                            <svg className="spinner black" viewBox="0 0 50 50">
                                                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                                            </svg> Loading
                                                        </>
                                                    ) : (
                                                        <>
                                                            {DataDetailAdminVerifikator.length !== 0 && (
                                                                <>
                                                                    <label>Detail Admin Dinas</label>

                                                                    {DataDetailAdminVerifikator.map((item, index) => (
                                                                        <div className="detail-item">
                                                                            <img src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${item.sampul_admin}`} alt={item.sampul_admin} style={{ width: '100px' }} />
                                                                            <div className='ml-3'>
                                                                                <p><strong>Username:</strong> {item.nama_admin}</p>
                                                                                <p><strong>Nama Lengkap:</strong> {item.namaLengkap_admin}</p>
                                                                                <p><strong>Role:</strong> Admin dinas</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                </div>

                                                {DataFormVerifikasi.id_admin && (
                                                    <div className="form-group">
                                                        <label htmlFor="status_verifikasi">Status Verifikasi</label>
                                                        <select
                                                            className="form-control"
                                                            id="status_verifikasi"
                                                            name="status_verifikasi"
                                                            style={{ width: '100%' }}
                                                            value={DataFormVerifikasi.status_verifikasi}
                                                            onChange={handleInputChangeFormVerifikasi}
                                                            required
                                                        >
                                                            <option value="verified">Verifikasi</option>
                                                            <option value="unverified">Belum Terverifikasi</option>

                                                        </select>
                                                    </div>
                                                )}
                                                <input
                                                    type="submit"
                                                    id="submitVerifikasi"
                                                    style={{ display: 'none' }}
                                                />
                                            </form>
                                        </>
                                    )}
                                    {role === 'dinas' && (
                                        <>
                                            <form className="modal-form" onSubmit={handleSubmitUpdateVerifikasi}>

                                                <div className="form-group">

                                                    {loading1 ? (
                                                        <>
                                                            <svg className="spinner black" viewBox="0 0 50 50">
                                                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                                            </svg> Loading
                                                        </>
                                                    ) : (
                                                        <>
                                                            {DataDetailAdminVerifikator.length !== 0 && (
                                                                <>
                                                                    <label>Detail Admin Dinas</label>

                                                                    {DataDetailAdminVerifikator.map((item, index) => (
                                                                        <div className="detail-item">
                                                                            <img src={`${process.env.REACT_APP_BACKEND_API_URL}/uploads/img/profile/${item.sampul_admin}`} alt={item.sampul_admin} style={{ width: '100px' }} />
                                                                            <div className='ml-3'>
                                                                                <p><strong>Username:</strong> {item.nama_admin}</p>
                                                                                <p><strong>Nama Lengkap:</strong> {item.namaLengkap_admin}</p>
                                                                                <p><strong>Role:</strong> Admin dinas</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </>
                                                            )}
                                                        </>
                                                    )}

                                                </div>

                                                {DataFormVerifikasi.id_admin && (
                                                    <div className="form-group">
                                                        <label htmlFor="status_verifikasi">Status Verifikasi</label>
                                                        <select
                                                            className="form-control"
                                                            id="status_verifikasi"
                                                            name="status_verifikasi"
                                                            style={{ width: '100%' }}
                                                            value={DataFormVerifikasi.status_verifikasi}
                                                            onChange={handleInputChangeFormVerifikasi}
                                                            required
                                                        >
                                                            <option value="verified">Verifikasi</option>
                                                            <option value="unverified">Belum Terverifikasi</option>

                                                        </select>
                                                    </div>
                                                )}
                                                <input
                                                    type="submit"
                                                    id="submitVerifikasi"
                                                    style={{ display: 'none' }}
                                                />
                                            </form>
                                        </>
                                    )}
                                    {role === 'admin pengelola' && (
                                        <div className="modal-body">
                                            <div className="detail-item mt-0">
                                                <div className='ml-4 mt-1'>
                                                    <p>Hanya admin dinas yang dapat melakukan verifikasi</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="button danger" onClick={closeModalFormVerifikasi}>Tutup</button>
                                    {(role === 'admin' || role === 'dinas') && (
                                        <button type="button" className="button good" onClick={ButtonhandleSubmitVerifikasi}>Save Changes</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="col-lg-12 grid-margin stretch-card mt-3">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">Tabel Data Desa Wisata</h4>
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
                                                <th>#</th>
                                                <th>Desa Wisata</th>
                                                <th>Admin Desa Wisata</th>
                                                <th>Status Verifikasi</th>
                                                <th>Author</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentPageData.length === 0 ? (
                                                <>
                                                    {loading ? (
                                                        <>
                                                            <tr className='under-line'>
                                                                <td>
                                                                    <svg className="spinner black" viewBox="0 0 50 50">
                                                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                                                    </svg> Loading</td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                                <td></td>
                                                            </tr>
                                                        </>
                                                    ) : (

                                                        <tr className='under-line'>
                                                            <td>Data tidak ditemukan</td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        </tr>
                                                    )}
                                                </>

                                            ) : (
                                               <>
                                                    {currentPageData.map((item, index) => (
                                                        <tr key={index} className='under-line'>
                                                            <td>{index + 1}</td>
                                                            <td>{item.nama_desaWisata}</td>
                                                            <td onClick={() => openModalDetailAdmin("admin", item.detail_admin.nama_admin, item.detail_admin.namaLengkap_admin, item.detail_admin.role, item.detail_admin.sampul_admin)}>{item.detail_admin.nama_admin}</td>
                                                            {item.detail_admin_verified ? (
                                                                <td><label className={`badge ${item.status_verifikasi === "verified" ? " badge-success" : " badge-danger"}`}
                                                                    onClick={() => openModalDetailAdmin("verifikator", item.detail_admin_verified.nama_admin, item.detail_admin_verified.namaLengkap_admin, item.detail_admin_verified.role, item.detail_admin_verified.sampul_admin)}
                                                                >
                                                                    {item.status_verifikasi === "verified" ? "Sudah diverifikasi" : "Tidak diverifikasi"}
                                                                </label>
                                                                </td>
                                                            ) : (
                                                                <td><label className={`badge badge-warning`}
                                                                    onClick={() => openModalFormVerifikasi(item.id_desaWisata, item.status_verifikasi)}
                                                                >Belum diverifikasi</label></td>
                                                            )}
                                                            <td onClick={() => openModalDetailAdmin("author", item.detail_author.nama_admin, item.detail_author.namaLengkap_admin, item.detail_author.role, item.detail_author.sampul_admin)}>{item.detail_author.nama_admin}</td>
                                                            <td><Link to={`/desawisata/${item.id_desaWisata}`}>Lihat detail</Link>
                                                            {/* <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => openModalEdit(item.detail_admin.id_admin, item.nama_desaWisata, item.desk_desaWisata, item.kontak_person_desawisata, item.id_desaWisata, item.sampul_desaWisata)} /> */}
                                                            <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => openModalEdit(item.nama_desaWisata, item.desk_desaWisata, item.kontak_person_desawisata, item.id_desaWisata, item.sampul_desaWisata, item.latitude, item.longitude)} />
                                                                <FontAwesomeIcon icon={faTrash} onClick={() => openModalDelete(item.id_desaWisata, item.nama_desaWisata, item.sampul_desaWisata)} />
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

export default TableDesaWisata;
