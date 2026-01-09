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
import L, { geoJSON } from 'leaflet';

const TableKecamatan = ({ role, id_admin_login }) => {
    const navigate = useNavigate();
    const [DataUsers, setDataUsers] = useState([]);

    const [DataAdminOption, setDataAdminOption] = useState([]);
    const [DataAdminDinasOption, setDataAdminDinasOption] = useState([]);
     const [DataDetailAdminVerifikator, setDataDetailAdminVerifikator] = useState([]);
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
        nama_kecamatan: ' ',
        geojson: '',
        zoom_level: '',
        latitude: '',
        longitude: '',
    });

    const [formDataEdit, setFormDataEdit] = useState({
        // id_admin: '',
        nama_kecamatan: '',
        geojson: '',
        zoom_level: '',
        id: '',
        latitude: '',
        longitude: ''
    });

    const [DataDelete, setDataDelete] = useState({
        id: '',
        name_kecamatan: '',
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
                url = `${process.env.REACT_APP_BACKEND_API_URL}/api/kecamatan/get_all/?keyword=${searchTerm}`;
            }
            else {
                url = `${process.env.REACT_APP_BACKEND_API_URL}/api/kecamatan/get_all/?keyword=${searchTerm}`;
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

    const openModalEdit = (nama_kecamatan, zoom_level, latitude, longitude, geojson, id_kecamatan) => {
        setFormDataEdit({
            nama_kecamatan: nama_kecamatan,
            zoom_level: zoom_level,
            latitude: latitude,
            longitude: longitude,
            geojson: geojson,
            id: id_kecamatan,
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

    const openModalDelete = (id_kecamatan, name_kecamatan) => {
        setDataDelete({
            id: id_kecamatan,
            name: name_kecamatan,
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

    const openModalFormVerifikasi = (id_desaWisata, status) => {
        if (role === "dinas") {
            setDataFormVerifikasi({
                id_admin: id_admin_login,
                id_desaWisata: id_desaWisata,
                status_verifikasi: status
            });
            getDataDetailAdminDinas(id_admin_login);
        }else{
            setDataFormVerifikasi({
                id_desaWisata: id_desaWisata,
                status_verifikasi: status
            });
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
        setDataFormVerifikasi({ ...DataFormVerifikasi, [name]: value });
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

    const ButtonhandleSubmit = () => {
        document.getElementById('submit').click();
    };

    const ButtonhandleSubmitDelete = () => {
        document.getElementById('submitDelete').click();
    };

    const ButtonhandleSubmitUpdate = () => {
        document.getElementById('submitEdit').click();
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();

    for (const key in formData) {
        formDataObj.append(key, formData[key]);
    }

    try {
        const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_API_URL}/api/kecamatan/add`,
            formDataObj,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                withCredentials: true,
            }
        );

        if (response) {
            setResponseMessage(response.data.message);
            setResponseMessageStatus(response.data.status);
            closeModal();
            getData();

            setFormData({
                id_admin: '',
                nama_kecamatan: '',
                geojson: '',
                zoom_level: '',
                latitude: '',
                longitude: '',
            });
        }
    } catch (error) {
        closeModal();
        setResponseMessageStatus(error.response?.data?.status || 'error');
        setResponseMessage(error.response?.data?.message || 'Terjadi kesalahan');

        setTimeout(() => {
            setResponseMessage('');
            setResponseMessageStatus('');
        }, 2000);
    } finally {
        setLoading(false);
    }
};

    const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataObj = new FormData();
    formDataObj.append("nama_kecamatan", formDataEdit.nama_kecamatan);
    formDataObj.append("zoom_level", formDataEdit.zoom_level);
    formDataObj.append("latitude", formDataEdit.latitude);
    formDataObj.append("longitude", formDataEdit.longitude);

    // ✅ Pastikan geojson adalah file
    if (formDataEdit.geojson instanceof File) {
        formDataObj.append("geojson", formDataEdit.geojson);
    } else {
        setLoading(false);
        alert("Mohon unggah ulang file GeoJSON sebelum menyimpan.");
        return;
    }

    try {
        const response = await axios.put(
            `${process.env.REACT_APP_BACKEND_API_URL}/api/kecamatan/update/${formDataEdit.id}`,
            formDataObj
        );
        if (response) {
            setResponseMessage(response.data.message);
            setResponseMessageStatus(response.data.status);
            closeModalEdit();
            getData();
            setFormDataEdit({
                id_admin: '',
                nama_kecamatan: '',
                geojson: '',
                zoom_level: '',
                id: '',
                latitude: '',
                longitude: ''
            });
        }
    } catch (error) {
        closeModalEdit();
        setResponseMessageStatus(error.response?.data?.status || 'error');
        setResponseMessage(error.response?.data?.message || 'Terjadi kesalahan');
        setTimeout(() => {
            setResponseMessageStatus('');
            setResponseMessage('');
        }, 2000);
    } finally {
        setLoading(false);
    }
};


    const handleSubmitDelete = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/api/kecamatan/delete/${DataDelete.id}`)
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

    // const handleSubmitUpdateVerifikasi = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/verif/byAdmin/${DataFormVerifikasi.id_desaWisata}`, {
    //             id_admin: DataFormVerifikasi.id_admin,
    //             status_verifikasi: DataFormVerifikasi.status_verifikasi
    //         })
    //         if (response) {
    //             setResponseMessage(response.data.message);
    //             setResponseMessageStatus(response.data.status);
    //             closeModalFormVerifikasi();
    //             getData();
    //             setDataFormVerifikasi({
    //                 id_desaWisata: '',
    //                 id_admin: '',
    //                 username: '',
    //                 nama_lengkap: '',
    //                 sampul_admin: '',
    //                 status_verifikasi: ''
    //             })
    //             setTimeout(() => {
    //                 setResponseMessage('');
    //                 setResponseMessageStatus('');
    //             }, 2000)
    //         }
    //     } catch (error) {
    //         if (error.response.status === 422) {
    //             closeModalFormVerifikasi();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         } else {
    //             closeModalFormVerifikasi();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         }
    //     }

    // };

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
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label htmlFor="name">Nama Kecamatan</label>
                                            <input
                                                type="text"
                                                name="nama_kecamatan"
                                                value={formData.nama_kecamatan}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                       
                                        <div className="form-group">
                                            <label htmlFor="zoom_level">Zoom Level</label>
                                            <input
                                                type="text"
                                                name="zoom_level"
                                                value={formData.zoom_level}
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
                                         <div className="form-group">
                                            <label htmlFor="geojson">GeoJSON File</label>
                                            <input
                                                type="file"
                                                name="geojson"
                                                accept=".geojson,application/geo+json"
                                                onChange={(e) => setFormData({ ...formData, geojson: e.target.files[0] })}
                                                required
                                            />
                                            </div>
                                        <input
                                            type="submit"
                                            id="submit"
                                            style={{ display: 'none' }}
                                        />
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
    <label htmlFor="name">Nama Kecamatan</label>
    <input
      type="text"
      name="nama_kecamatan"
      value={formDataEdit.nama_kecamatan}
      onChange={handleInputChangeEdit}
      required
    />
  </div>

  <div className="form-group">
    <label htmlFor="zoom_level">Zoom Level</label>
    <input
      type="text"
      name="zoom_level"
      value={formDataEdit.zoom_level}
      onChange={handleInputChangeEdit}
      required
    />
  </div>

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

  <div className="form-group">
    <label htmlFor="geojson">File GeoJSON</label>
    <input
      type="file"
      name="geojson"
      accept=".geojson,application/geo+json,application/json"
      onChange={(e) => setFormDataEdit({ ...formDataEdit, geojson: e.target.files[0] })}
      required
    />
  </div>

  {/* Tombol submit tersembunyi untuk di-trigger dengan click() */}
  <input type="submit" id="submitEdit" style={{ display: 'none' }} />

  <div className="modal-footer">
    <button type="button" className="button good" onClick={ButtonhandleSubmitUpdate}>Save Changes</button>
  </div>
</form>

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

                    <div className="col-lg-12 grid-margin stretch-card mt-3">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">Tabel Data Kecamatan</h4>
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
                                                <th>Kecamatan</th>
                                                <th>Zoom Level</th>
                                                <th>Longitude</th>
                                                <th>Latitude</th>
                                                <th>Action</th>
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
                                                            <td>{item.nama_kecamatan}</td>
                                                            <td>{item.zoom_level}</td>
                                                            <td>{item.longitude}</td>
                                                            <td>{item.latitude}</td>
                                                            <td>
                                                            {/* <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => openModalEdit(item.detail_admin.id_admin, item.nama_desaWisata, item.desk_desaWisata, item.kontak_person_desawisata, item.id_desaWisata, item.sampul_desaWisata)} /> */}
                                                            <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => openModalEdit(item.nama_kecamatan, item.zoom_level, item.latitude, item.longitude, item.geojson, item.id_kecamatan)} />
                                                                <FontAwesomeIcon icon={faTrash} onClick={() => openModalDelete(item.id_kecamatan, item.nama_kecamatan)} />
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

export default TableKecamatan;
