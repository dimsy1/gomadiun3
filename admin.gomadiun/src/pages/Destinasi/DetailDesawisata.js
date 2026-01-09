import { React, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import ReactPaginate from 'react-paginate';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faBackward, faCheck, faEdit, faEye, faSquarePlus, faTimes, faTrash, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getCroppedImg16_9 } from '../../components/croopingImg16-9';
import Cropper from 'react-easy-crop';
import moment from 'moment';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2/dist/js/select2.min.js';
import { useParams } from 'react-router-dom';

const TableDetailDesaWisata = ({ role, id_admin_login }) => {
    const { id_desawisata } = useParams();
    const navigate = useNavigate();
    const [DataUsers, setDataUsers] = useState([]);
    const [DataDetailDesaWisata, setDataDetailDesaWisata] = useState([]);
    const [DataDetailAdminVerifikator, setDataDetailAdminVerifikator] = useState([]);
    const [DataAdminOption, setDataAdminOption] = useState([]);
    const [DataAdminDinasOption, setDataAdminDinasOption] = useState([]);
    const [DataAjuan, setDataAjuan] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loading1, setLoading1] = useState(false);
    const [loadingMuatHalDetail, setLoadingMuatHalDetail] = useState(false);
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
    const [showModalFormVerifikasiPengunjung, setShowModalFormVerifikasiPengunjung] = useState(false);
    const [isClosingFormVerifikasiPengunjung, setIsClosingFormVerifikasiPengunjung] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseMessageStatus, setResponseMessageStatus] = useState('');
    const [AlertaddImage, setAlertaddImage] = useState('');
    const [tahunSelected, setTahunSelected] = useState('');


    const [activeTab, setActiveTab] = useState('Detail Wisata');

    const test = () => {
        const tabsNewAnim = document.getElementById('navbarSupportedContent');
        if (!tabsNewAnim) {
            console.error('Element with ID navbarSupportedContent not found');
            return;
        }
    
        const activeItemNewAnim = tabsNewAnim.querySelector('.active');
        if (!activeItemNewAnim) {
            console.error('Active item not found');
            return;
        }
    
        const horiSelector = document.querySelector('.hori-selector');
        if (!horiSelector) {
            console.error('Hori-selector not found');
            return;
        }
    
        const { offsetHeight, offsetWidth, offsetTop, offsetLeft } = activeItemNewAnim;
    
        horiSelector.style.top = `${offsetTop}px`;
        horiSelector.style.left = `${offsetLeft}px`;
        horiSelector.style.height = `${offsetHeight}px`;
        horiSelector.style.width = `${offsetWidth}px`;
    };

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
        setTimeout(test);
    };

    const [formData, setFormData] = useState({
        tahun_data_pengunjung: '',
        bulan_data_pengunjung: '',
        jumlah_pengunjung_lokal: '',
        jumlah_pengunjung_mancanegara: '',
        jumlah_pegawai_laki: '',
        jumlah_pegawai_perempuan: '',
    });

    const [formDataEdit, setFormDataEdit] = useState({
        tahun_data_pengunjung: '',
        bulan_data_pengunjung: '',
        jumlah_pengunjung_lokal: '',
        jumlah_pengunjung_mancanegara: '',
        jumlah_pegawai_laki: '',
        jumlah_pegawai_perempuan: '',
        id: '',
    });

    const [DataDelete, setDataDelete] = useState({
        id: '',
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

    const [DataFormVerifikasiPengunjung, setDataFormVerifikasiPengunjung] = useState({
        id_data_pengunjung: '',
        id_admin: '',
        username: '',
        nama_lengkap: '',
        sampul_admin: '',
        status_verifikasi: ''
    });

    const currentYear = new Date().getFullYear();
    const DataOptionTahun = [];
    for (let year = currentYear; year >= 2020; year--) {
        DataOptionTahun.push(year);
    }



    const searchKeyword = (event) => {
        setLoading(true);
        setDataUsers([])
        const value = event.target.value;
        setTahunSelected(value);
        debounceGetData(value);
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


    const getData = async (tahun = '') => {
        setLoading(true);
        setLoadingMuatHalDetail(true);
        setDataUsers([]);
        setDataDetailDesaWisata([]);
        setDataAjuan([]);
        try {
            if (role === "admin") {
                getDataOption()
            }
            const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/desawisata/detail/byAdmin/${id_desawisata}`;

            const response = await axios.get(url);
            if (response) {
                setDataDetailDesaWisata(response.data.data)
                setLoadingMuatHalDetail(false);

                try {
                    const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/get_all/byAdmin/${id_desawisata}?keywoard=tbl_desawisata&tahun=${tahun}`;

                    const response = await axios.get(url);
                    if (response) {
                        setTahunSelected(response.data.seleted_tahun)
                        setDataUsers(response.data.data)

                        try {
                            const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/get_all_noverified/byAdmin/${id_desawisata}?keywoard=tbl_desawisata`;

                            const response = await axios.get(url);
                            if (response) {
                                setDataAjuan(response.data.data)
                                setLoading(false);
                            }
                        } catch (error) {
                            if (error.response.status === 401) {
                                navigate('/');
                                setLoading(false);
                            }
                            if (error.response.status === 422) {
                                setDataAjuan([]);
                                setLoading(false);
                            }
                            else {
                                console.log(error.response)
                                setLoading(false);
                            }
                        }
                    }
                } catch (error) {
                    if (error.response.status === 401) {
                        navigate('/');
                        setLoading(false);
                    }
                    if (error.response.status === 422) {
                        setTahunSelected(error.response.data.seleted_tahun)
                        setLoading(false);

                        try {
                            const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/get_all_noverified/byAdmin/${id_desawisata}?keywoard=tbl_desawisata`;

                            const response = await axios.get(url);
                            if (response) {
                                setDataAjuan(response.data.data)
                                setLoading(false);
                            }
                        } catch (error) {
                            if (error.response.status === 401) {
                                navigate('/');
                                setLoading(false);
                            }
                            if (error.response.status === 422) {
                                setDataAjuan([]);
                                setLoading(false);
                            }
                            else {
                                console.log(error.response)
                                setLoading(false);
                            }
                        }
                    }
                    else {
                        console.log(error.response)
                        setLoading(false);
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
        if (showModalFormVerifikasiPengunjung) {
            $('#id_admin_verif_pengunjung').select2({
                placeholder: '--- Pilih Admin ---',
                allowClear: true,
            }).on('change', (e) => {
                const selectedValue = $(e.target).val();
                getDataDetailAdminDinas(selectedValue);
                setDataFormVerifikasiPengunjung({ ...DataFormVerifikasiPengunjung, id_admin: selectedValue });
            });
            return () => {
                $('#id_admin_verif_pengunjung').select2('destroy');
            };
        }
    }, [showModalFormVerifikasiPengunjung]);

    useEffect(() => {
        getData();

        test();
        window.addEventListener('resize', () => setTimeout(test, 500));
        return () => {
            window.removeEventListener('resize', () => setTimeout(test, 500));
        };
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

    const openModalEdit = (tahun_data_pengunjung, bulan_data_pengunjung, jumlah_pengunjung_lokal, jumlah_pengunjung_mancanegara, jumlah_pegawai_laki, jumlah_pegawai_perempuan, id) => {
        setFormDataEdit({
            tahun_data_pengunjung: tahun_data_pengunjung,
            bulan_data_pengunjung: bulan_data_pengunjung,
            jumlah_pengunjung_lokal: jumlah_pengunjung_lokal,
            jumlah_pengunjung_mancanegara: jumlah_pengunjung_mancanegara,
            jumlah_pegawai_laki: jumlah_pegawai_laki,
            jumlah_pegawai_perempuan: jumlah_pegawai_perempuan,
            id: id,
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

    const openModalDelete = (id_data_pengunjung) => {
        setDataDelete({
            id: id_data_pengunjung
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
                id: ''
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
        } else {
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

    const openModalFormVerifikasiPengunjung = (id_data_pengunjung, status) => {
        if (role === "dinas") {
            setDataFormVerifikasiPengunjung({
                id_admin: id_admin_login,
                id_data_pengunjung: id_data_pengunjung,
                status_verifikasi: status
            });
            getDataDetailAdminDinas(id_admin_login);
        } else {
            setDataFormVerifikasiPengunjung({
                id_data_pengunjung: id_data_pengunjung,
                status_verifikasi: status
            });
        }
        setShowModalFormVerifikasiPengunjung(true);
        setIsClosingFormVerifikasiPengunjung(false);
    };

    const closeModalFormVerifikasiPengunjung = () => {
        setIsClosingFormVerifikasiPengunjung(true);
        setTimeout(() => {
            setShowModalFormVerifikasiPengunjung(false);
            setIsClosingFormVerifikasiPengunjung(false);
            setDataFormVerifikasiPengunjung({
                id_data_pengunjung: '',
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

    const handleInputChangeFormVerifikasiPengunjung = (e) => {
        const { name, value } = e.target;
        setDataFormVerifikasiPengunjung({ ...DataFormVerifikasiPengunjung, [name]: value });
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

    const ButtonhandleSubmitVerifikasiPengunjung = () => {
        document.getElementById('submitVerifikasiPengunjung').click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/add_data/byAdmin?keywoard=tbl_desawisata`, {
                tahun_data_pengunjung: formData.tahun_data_pengunjung,
                bulan_data_pengunjung: formData.bulan_data_pengunjung,
                jumlah_pengunjung_lokal: formData.jumlah_pengunjung_lokal,
                jumlah_pengunjung_mancanegara: formData.jumlah_pengunjung_mancanegara,
                jumlah_pegawai_laki: formData.jumlah_pegawai_laki,
                jumlah_pegawai_perempuan: formData.jumlah_pegawai_perempuan,
                id_table: id_desawisata
            })
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModal();
                getData();
                setFormData({
                    tahun_data_pengunjung: '',
                    bulan_data_pengunjung: '',
                    jumlah_pengunjung_lokal: '',
                    jumlah_pengunjung_mancanegara: '',
                    jumlah_pegawai_laki: '',
                    jumlah_pegawai_perempuan: '',
                })
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
                getData();
                setTimeout(() => {
                    setResponseMessage('');
                }, 2000)
            } else {
                closeModal();
                getData();
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

        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/update/byAdmin/${formDataEdit.id}`, {
                tahun_data_pengunjung: formDataEdit.tahun_data_pengunjung,
                bulan_data_pengunjung: formDataEdit.bulan_data_pengunjung,
                jumlah_pengunjung_lokal: formDataEdit.jumlah_pengunjung_lokal,
                jumlah_pengunjung_mancanegara: formDataEdit.jumlah_pengunjung_mancanegara,
                jumlah_pegawai_laki: formDataEdit.jumlah_pegawai_laki,
                jumlah_pegawai_perempuan: formDataEdit.jumlah_pegawai_perempuan
            })
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModalEdit();
                getData();
                setFormDataEdit({
                    tahun_data_pengunjung: '',
                    bulan_data_pengunjung: '',
                    jumlah_pengunjung_aplikasi: '',
                    jumlah_pengunjung_lokal: '',
                    jumlah_pengunjung_mancanegara: '',
                    jumlah_pegawai_laki: '',
                    jumlah_pegawai_perempuan: '',
                    id: '',
                })
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
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/delete/byAdmin/${DataDelete.id}`)
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

    const handleSubmitUpdateVerifikasiPengunjung = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/verifikasi/byAdmin/${DataFormVerifikasiPengunjung.id_data_pengunjung}`, {
                id_admin: DataFormVerifikasiPengunjung.id_admin,
                status_verifikasi: DataFormVerifikasiPengunjung.status_verifikasi
            })
            if (response) {
                setResponseMessage(response.data.message);
                setResponseMessageStatus(response.data.status);
                closeModalFormVerifikasiPengunjung();
                getData();
                setDataFormVerifikasiPengunjung({
                    id_data_pengunjung: '',
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
                closeModalFormVerifikasiPengunjung();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            } else {
                closeModalFormVerifikasiPengunjung();
                setResponseMessageStatus(error.response.data.status);
                setResponseMessage(error.response.data.message);
                setTimeout(() => {
                    setResponseMessageStatus('');
                    setResponseMessage('');
                }, 2000)
            }
        }

    };

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD HH:mm');
    };

    const back = () => {
        navigate(-1)
    }


    return (
        <div className="main-panel">
            <div className="content-wrapper">
                <div className="row">
                    <div className='d-flex w-100'>
                        <h4 className="card-title">Detail Desa Wisata</h4>
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
                                            <label htmlFor="tahun_data_pengunjung">Tahun</label>
                                            <select
                                                type="text"
                                                name="tahun_data_pengunjung"
                                                value={formData.tahun_data_pengunjung}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">--- Pilih Tahun ---</option>

                                                {DataOptionTahun && (
                                                    <>
                                                        {DataOptionTahun.map((item, index) => (
                                                            <option key={index} value={item}>{item}</option>
                                                        ))}
                                                    </>
                                                )}

                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="bulan_data_pengunjung">Bulan</label>
                                            <select
                                                type="text"
                                                name="bulan_data_pengunjung"
                                                value={formData.bulan_data_pengunjung}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">--- Pilih Bulan ---</option>
                                                <option value="1">Januari</option>
                                                <option value="2">Februari</option>
                                                <option value="3">Maret</option>
                                                <option value="4">April</option>
                                                <option value="5">Mei</option>
                                                <option value="6">Juni</option>
                                                <option value="7">Juli</option>
                                                <option value="8">Agustus</option>
                                                <option value="9">September</option>
                                                <option value="10">Oktober</option>
                                                <option value="11">November</option>
                                                <option value="12">Desember</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="jumlah_pengunjung_lokal">Pengunjung Lokal</label>
                                            <input
                                                type="number"
                                                name="jumlah_pengunjung_lokal"
                                                value={formData.jumlah_pengunjung_lokal}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="jumlah_pengunjung_mancanegara">Pengunjung Mancanegara</label>
                                            <input
                                                type="number"
                                                name="jumlah_pengunjung_mancanegara"
                                                value={formData.jumlah_pengunjung_mancanegara}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="jumlah_pegawai_perempuan">Pegawai Pria</label>
                                            <input
                                                type="number"
                                                name="jumlah_pegawai_perempuan"
                                                value={formData.jumlah_pegawai_perempuan}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="jumlah_pegawai_laki">Pegawai Wanita</label>
                                            <input
                                                type="number"
                                                name="jumlah_pegawai_laki"
                                                value={formData.jumlah_pegawai_laki}
                                                onChange={handleInputChange}
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
                                            <label htmlFor="tahun_data_pengunjung">Tahun</label>
                                            <select
                                                type="text"
                                                name="tahun_data_pengunjung"
                                                value={formDataEdit.tahun_data_pengunjung}
                                                onChange={handleInputChangeEdit}
                                                required
                                            >

                                                {DataOptionTahun && (
                                                    <>
                                                        {DataOptionTahun.map((item, index) => (
                                                            <option key={index} value={item}>{item}</option>
                                                        ))}
                                                    </>
                                                )}

                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="bulan_data_pengunjung">Bulan</label>
                                            <select
                                                type="text"
                                                name="bulan_data_pengunjung"
                                                value={formDataEdit.bulan_data_pengunjung}
                                                onChange={handleInputChangeEdit}
                                                required
                                            >
                                                <option value="1">Januari</option>
                                                <option value="2">Februari</option>
                                                <option value="3">Maret</option>
                                                <option value="4">April</option>
                                                <option value="5">Mei</option>
                                                <option value="6">Juni</option>
                                                <option value="7">Juli</option>
                                                <option value="8">Agustus</option>
                                                <option value="9">September</option>
                                                <option value="10">Oktober</option>
                                                <option value="11">November</option>
                                                <option value="12">Desember</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="jumlah_pengunjung_lokal">Pengunjung Lokal</label>
                                            <input
                                                type="number"
                                                name="jumlah_pengunjung_lokal"
                                                value={formDataEdit.jumlah_pengunjung_lokal}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="jumlah_pengunjung_mancanegara">Pengunjung Mancanegara</label>
                                            <input
                                                type="number"
                                                name="jumlah_pengunjung_mancanegara"
                                                value={formDataEdit.jumlah_pengunjung_mancanegara}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="jumlah_pegawai_perempuan">Pegawai Pria</label>
                                            <input
                                                type="number"
                                                name="jumlah_pegawai_perempuan"
                                                value={formDataEdit.jumlah_pegawai_perempuan}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="jumlah_pegawai_laki">Pegawai Wanita</label>
                                            <input
                                                type="number"
                                                name="jumlah_pegawai_laki"
                                                value={formDataEdit.jumlah_pegawai_laki}
                                                onChange={handleInputChangeEdit}
                                                required
                                            />
                                        </div>
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
                                            <div className="detail-item">
                                                <div className='ml-3'>
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

                    {showModalFormVerifikasiPengunjung && (
                        <div className={`modal ${isClosingFormVerifikasiPengunjung ? 'closing' : ''}`} onClick={closeModalFormVerifikasi}>
                            <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Verifikasi Data Pengunjung</h3>
                                    <div>
                                        <span className="close" onClick={closeModalFormVerifikasiPengunjung}>&times;</span>
                                    </div>
                                </div>
                                <div className="modal-body">
                                    {role === 'admin' && (
                                        <>
                                            <form className="modal-form" onSubmit={handleSubmitUpdateVerifikasiPengunjung}>
                                                <div className="form-group">
                                                    <label htmlFor="id_admin_verif_pengunjung">Admin Dinas</label>
                                                    <select
                                                        className="form-control"
                                                        id="id_admin_verif_pengunjung"
                                                        name="id_admin"
                                                        style={{ width: '100%' }}
                                                        value={DataFormVerifikasiPengunjung.id_admin}
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

                                                {DataFormVerifikasiPengunjung.id_admin && (
                                                    <div className="form-group">
                                                        <label htmlFor="status_verifikasi">Status Verifikasi</label>
                                                        <select
                                                            className="form-control"
                                                            id="status_verifikasi"
                                                            name="status_verifikasi"
                                                            style={{ width: '100%' }}
                                                            value={DataFormVerifikasiPengunjung.status_verifikasi}
                                                            onChange={handleInputChangeFormVerifikasiPengunjung}
                                                            required
                                                        >

                                                            <option value="verified">Verifikasi</option>
                                                            <option value="rejected">Tolak Ajuan</option>
                                                            <option value="unverified">Belum Terverifikasi</option>

                                                        </select>
                                                    </div>
                                                )}
                                                <input
                                                    type="submit"
                                                    id="submitVerifikasiPengunjung"
                                                    style={{ display: 'none' }}
                                                />
                                            </form>
                                        </>
                                    )}
                                    {role === 'dinas' && (
                                        <>
                                            <form className="modal-form" onSubmit={handleSubmitUpdateVerifikasiPengunjung}>

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

                                                {DataFormVerifikasiPengunjung.id_admin && (
                                                    <div className="form-group">
                                                        <label htmlFor="status_verifikasi">Status Verifikasi</label>
                                                        <select
                                                            className="form-control"
                                                            id="status_verifikasi"
                                                            name="status_verifikasi"
                                                            style={{ width: '100%' }}
                                                            value={DataFormVerifikasiPengunjung.status_verifikasi}
                                                            onChange={handleInputChangeFormVerifikasiPengunjung}
                                                            required
                                                        >
                                                            <option value="verified">Verifikasi</option>
                                                            <option value="rejected">Tolak Ajuan</option>
                                                            <option value="unverified">Belum Terverifikasi</option>

                                                        </select>
                                                    </div>
                                                )}
                                                <input
                                                    type="submit"
                                                    id="submitVerifikasiPengunjung"
                                                    style={{ display: 'none' }}
                                                />
                                            </form>
                                        </>
                                    )}
                                    {role === 'admin pengelola' && (
                                        <div className="modal-body">
                                            <div className="detail-item">
                                                <div className='ml-3'>
                                                    <p>Hanya admin dinas yang dapat melakukan verifikasi</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="button danger" onClick={closeModalFormVerifikasiPengunjung}>Tutup</button>
                                    {(role === 'admin' || role === 'dinas') && (
                                        <button type="button" className="button good" onClick={ButtonhandleSubmitVerifikasiPengunjung}>Save Changes</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="col-lg-12 grid-margin stretch-card mt-3">
                        <div className="card">
                            <div className="card-body">
                                <div className="container-top">
                                    <div className='back' onClick={back}>
                                        <FontAwesomeIcon icon={faBackward} />
                                        <span className='ml-2'>Kembali</span>
                                    </div>
                                </div>

                                <nav className="navbar navbar-expand-custom navbar-mainbg">
                                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                                        <ul className="navbar-nav">
                                            <div className="hori-selector">
                                                <div className="left"></div>
                                                <div className="right"></div>
                                            </div>
                                            {['Detail Wisata', 'Data Pengunjung'].map((tab) => (
                                                <li className={`nav-item ${activeTab === tab ? 'active' : ''}`} key={tab} onClick={() => handleTabClick(tab)}>
                                                    <a className="nav-link">
                                                        {tab}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </nav>

                                {!loadingMuatHalDetail ? (

                                    <div className='d-flex flex-column my-5'>
                                        {DataDetailDesaWisata[0] ? (
                                            <>
                                                {DataDetailDesaWisata.map((item, index) => (
                                                    <div className='cover-detail-content' style={{ display: activeTab === "Detail Wisata" ? "" : "none" }}>
                                                        <div className='detail-content'>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Nama Desa Wisata</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name'>{item.nama_desaWisata}</span>
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Status Verifikasi</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name'>  {item.detail_admin_verified ? (
                                                                    <label className={`badge ${item.status_verifikasi === "verified" ? " badge-success" : " badge-danger"} mt-0`}
                                                                        onClick={() => openModalDetailAdmin("verifikator", item.detail_admin_verified.nama_admin, item.detail_admin_verified.namaLengkap_admin, item.detail_admin_verified.role, item.detail_admin_verified.sampul_admin)}
                                                                    >
                                                                        {item.status_verifikasi === "verified" ? "Sudah diverifikasi" : "Tidak diverifikasi"}
                                                                    </label>

                                                                ) : (
                                                                    <label className={`badge badge-warning mt-0`}
                                                                        onClick={() => openModalFormVerifikasi(item.id_desaWisata, item.status_verifikasi)}
                                                                    >Belum diverifikasi</label>
                                                                )}
                                                                </span>
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Admin Desa Wisata</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name'>{item.detail_admin.namaLengkap_admin}</span>
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Kontak Desa Wisata</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name'>{item.kontak_person_desawisata}</span>
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Total Pengunjung Desa Wisata</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name'>{item.total_pengunjung} Pengunjung</span>
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Deskripsi Desa Wisata</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name' style={{ whiteSpace: 'pre-wrap', width: 850 }}>{item.desk_desaWisata}</span>
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Sampul Desa Wisata</span>
                                                                <span>:</span>
                                                                <img src={item.sampul_desaWisata} alt={item.sampul_desaWisata} />
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Author Data Desa Wisata</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name'>{item.detail_author.namaLengkap_admin}</span>
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Dibuat pada</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name'>{formatDate(item.createdAt)}</span>
                                                            </div>
                                                            <div className='detail-content-row'>
                                                                <span className='title-name'>Diubah pada</span>
                                                                <span>:</span>
                                                                <span className='subtitle-name'>{formatDate(item.updatedAt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className='mt-5' style={{ display: activeTab === "Data Pengunjung" ? "" : "none" }}>

                                                    {responseMessage && (
                                                        <div className={`alert ${responseMessageStatus === "success" ? "alert-success" : "alert-danger"}`} role="alert">
                                                            {responseMessage}
                                                        </div>
                                                    )}

                                                    {DataAjuan.length !== 0 && (
                                                        <>


                                                            <h6 className="card-title">Tabel Data Ajuan Pengunjung {DataDetailDesaWisata[0].nama_desaWisata}</h6>
                                                            <div className="table-responsive">
                                                                <table className="table table-hover">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>#</th>
                                                                            <th>Tahun</th>
                                                                            <th>Bulan</th>
                                                                            <th>Pengunjung Lokal</th>
                                                                            <th>Pengunjung Mancanegara</th>
                                                                            <th>Pegawai Pria</th>
                                                                            <th>Pegawai Wanita</th>
                                                                            <th>Status Verifikasi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {DataAjuan.length === 0 ? (
                                                                            <>
                                                                                {loading ? (
                                                                                    <>
                                                                                        <tr className='under-line'>
                                                                                            <td></td>
                                                                                            <td></td>
                                                                                            <td></td>
                                                                                            <td></td>
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
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
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
                                                                                {DataAjuan.map((item, index) => (
                                                                                    <tr key={index} className='under-line'>
                                                                                        <td>{index + 1}</td>
                                                                                        <td>{item.tahun_data_pengunjung}</td>
                                                                                        <td>{item.bulan_data_pengunjung}</td>
                                                                                        <td>{item.jumlah_pengunjung_lokal}</td>
                                                                                        <td>{item.jumlah_pengunjung_mancanegara}</td>
                                                                                        <td>{item.jumlah_pegawai_laki}</td>
                                                                                        <td>{item.jumlah_pegawai_perempuan}</td>
                                                                                        {item.detail_admin_verified ? (
                                                                                            <td><label className={`badge ${item.status_verifikasi === "unverified" ? " badge-warning" : "badge-danger"}`}
                                                                                                onClick={() => openModalDetailAdmin("verifikator", item.detail_admin_verified.nama_admin, item.detail_admin_verified.namaLengkap_admin, item.detail_admin_verified.role, item.detail_admin_verified.sampul_admin)}
                                                                                            >
                                                                                                {item.status_verifikasi === "unverified" ? "Belum diverifikasi" : "Ajuan ditolak"}
                                                                                            </label>
                                                                                            </td>
                                                                                        ) : (
                                                                                            <td>
                                                                                                <label className={`badge badge-warning mt-0`}
                                                                                                    onClick={() => openModalFormVerifikasiPengunjung(item.id_data_pengunjung, item.status_verifikasi)}
                                                                                                >Belum diverifikasi</label>
                                                                                            </td>
                                                                                        )}
                                                                                        <td>
                                                                                            <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => openModalEdit(item.tahun_data_pengunjung, item.bulan_data_pengunjung_value, item.jumlah_pengunjung_lokal, item.jumlah_pengunjung_mancanegara, item.jumlah_pegawai_laki, item.jumlah_pegawai_perempuan, item.id_data_pengunjung)} />
                                                                                            <FontAwesomeIcon icon={faTrash} onClick={() => openModalDelete(item.id_data_pengunjung)} />
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </>
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div className='my-5'>
                                                            </div>

                                                        </>
                                                    )}
                                                    <h4 className="card-title">Tabel Data Pengunjung {DataDetailDesaWisata[0].nama_desaWisata}</h4>
                                                    <div className="container-top">
                                                        <button type="button" className="button good rounded" onClick={openModal}>
                                                            <FontAwesomeIcon icon={faSquarePlus} width={17} />
                                                            <span className='mx-2'>Add Data</span>
                                                        </button>
                                                        <div className='d-flex align-items-center' style={{ width: '300px' }}>
                                                            <label style={{ width: '100px' }}>Tahun :</label>
                                                            <select
                                                                className="form-control ml-3"
                                                                name="status_verifikasi"
                                                                value={tahunSelected}
                                                                onChange={searchKeyword}
                                                                required
                                                            >

                                                                {DataOptionTahun && (
                                                                    <>
                                                                        {DataOptionTahun.map((item, index) => (
                                                                            <option key={index} value={item}>{item}</option>
                                                                        ))}
                                                                    </>
                                                                )}

                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="table-responsive">
                                                        <table className="table table-hover">
                                                            <thead>
                                                                <tr>
                                                                    <th>#</th>
                                                                    <th>Tahun</th>
                                                                    <th>Bulan</th>
                                                                    <th>Pengunjung Lokal</th>
                                                                    <th>Pengunjung Mancanegara</th>
                                                                    <th>Pengunjung Aplikasi</th>
                                                                    <th>Pegawai Pria</th>
                                                                    <th>Pegawai Wanita</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {currentPageData.length === 0 ? (
                                                                    <>
                                                                        {loading ? (
                                                                            <>
                                                                                <tr className='under-line'>
                                                                                    <td></td>
                                                                                    <td></td>
                                                                                    <td></td>
                                                                                    <td></td>
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
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
                                                                                <td></td>
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
                                                                                <td>{item.tahun_data_pengunjung}</td>
                                                                                <td>{item.bulan_data_pengunjung}</td>
                                                                                <td>{item.jumlah_pengunjung_lokal}</td>
                                                                                <td>{item.jumlah_pengunjung_mancanegara}</td>
                                                                                <td>{item.jumlah_pengunjung_aplikasi}</td>
                                                                                <td>{item.jumlah_pegawai_laki}</td>
                                                                                <td>{item.jumlah_pegawai_perempuan}</td>
                                                                                <td>
                                                                                    <FontAwesomeIcon className='mx-2' icon={faEdit} onClick={() => openModalEdit(item.tahun_data_pengunjung, item.bulan_data_pengunjung_value, item.jumlah_pengunjung_lokal, item.jumlah_pengunjung_mancanegara, item.jumlah_pegawai_laki, item.jumlah_pegawai_perempuan, item.id_data_pengunjung)} />
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className='my-5'>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="classNameLoadingidetail">
                                                <span>
                                                    <svg className="spinner-only secondary" viewBox="0 0 50 50">
                                                        <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                                    </svg>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="classNameLoadingidetail">
                                        <span>
                                            <svg className="spinner-only secondary" viewBox="0 0 50 50">
                                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                            </svg>
                                        </span>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TableDetailDesaWisata;
