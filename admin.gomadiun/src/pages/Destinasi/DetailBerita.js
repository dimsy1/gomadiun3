import { React, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';
import ReactPaginate from 'react-paginate';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faBackward, faCheck, faCircleQuestion, faEdit, faEye, faSquarePlus, faTimes, faTrash, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { getCroppedImg16_9 } from '../../components/croopingImg16-9';
import Cropper from 'react-easy-crop';
import moment from 'moment';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2/dist/js/select2.min.js';
import { useParams } from 'react-router-dom';

//img
import img1 from '../../assets/images/tutorial/1.png'
import img2 from '../../assets/images/tutorial/2.png'
import img3 from '../../assets/images/tutorial/3.png'

const DetailBerita = ({ role, id_admin_login }) => {
    const { id_berita} = useParams();
    const navigate = useNavigate();
    const [DataUsers, setDataUsers] = useState([]);
    const [DataDetailBerita, setDataDetailBerita] = useState([]);
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
    // const [showModalFormVerifikasi, setShowModalFormVerifikasi] = useState(false);
    // const [isClosingFormVerifikasi, setIsClosingFormVerifikasi] = useState(false);
    // const [showModalFormMaps, setShowModalFormMaps] = useState(false);
    // const [isClosingFormMaps, setIsClosingFormMaps] = useState(false);
    // const [showModalFormVerifikasiPengunjung, setShowModalFormVerifikasiPengunjung] = useState(false);
    // const [isClosingFormVerifikasiPengunjung, setIsClosingFormVerifikasiPengunjung] = useState(false);
    // const [showModalTutorial, setShowModalTutorial] = useState(false);
    // const [isClosingshowModalTutorial, setIsClosingshowModalTutorial] = useState(false);
    // const [showMaps, setShowMaps] = useState(false);
    // const [showModalFormFasilitas, setShowModalFormFasilitas] = useState(false);
    // const [isClosingFormFasilitas, setIsClosingFormFasilitas] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseMessageStatus, setResponseMessageStatus] = useState('');
    const [AlertaddImage, setAlertaddImage] = useState('');
    const [tahunSelected, setTahunSelected] = useState('');


    const [activeTab, setActiveTab] = useState('Detail Berita');
    const [listFasilitas, setListFasilitas] = useState([]);

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

    // const [formData, setFormData] = useState({
    //     tahun_data_pengunjung: '',
    //     bulan_data_pengunjung: '',
    //     jumlah_pengunjung_lokal: '',
    //     jumlah_pengunjung_mancanegara: '',
    //     jumlah_pegawai_laki: '',
    //     jumlah_pegawai_perempuan: '',
    // });

    // const [formDataEdit, setFormDataEdit] = useState({
    //     tahun_data_pengunjung: '',
    //     bulan_data_pengunjung: '',
    //     jumlah_pengunjung_lokal: '',
    //     jumlah_pengunjung_mancanegara: '',
    //     jumlah_pegawai_laki: '',
    //     jumlah_pegawai_perempuan: '',
    //     id: '',
    // });

    // const [DataDelete, setDataDelete] = useState({
    //     id: '',
    // });

    const [DataDetailAdmin, setDataDetailAdmin] = useState({
        jenis_detail: '',
        username: '',
        nama_lengkap: '',
        role: '',
        sampul_admin: ''
    });

    // const [DataFormVerifikasi, setDataFormVerifikasi] = useState({
    //     id_paket_homestay: '',
    //     id_admin: '',
    //     username: '',
    //     nama_lengkap: '',
    //     sampul_admin: '',
    //     status_verifikasi: ''
    // });

    // const [DataFormVerifikasiPengunjung, setDataFormVerifikasiPengunjung] = useState({
    //     id_data_pengunjung: '',
    //     id_admin: '',
    //     username: '',
    //     nama_lengkap: '',
    //     sampul_admin: '',
    //     status_verifikasi: ''
    // });

    // const [formDataEditMaps, setFormDataEditMaps] = useState({
    //     url: '',
    //     statusModal: '',
    //     id: '',
    // });

    // const [formDataEditFasilitas, setFormDataEditFasilitas] = useState({
    //     statusModal: '',
    //     id: '',
    // });

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
            const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/option/adminindustri`;

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
        setDataDetailBerita([]);
        try {
            if (role === "admin") {
                getDataOption();
            }
            
            const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/berita/detail/${id_berita}`;
    
            const response = await axios.get(url);
            if (response) {
                setDataDetailBerita(response.data.data);
                setLoadingMuatHalDetail(false);
                setLoading(false);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                navigate('/');
            }
            console.error(error.response || error);
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

    // useEffect(() => {
    //     if (showModal) {
    //         $('#id_admin').select2({
    //             placeholder: '--- Pilih Admin ---',
    //             allowClear: true,
    //         }).on('change', (e) => {
    //             const selectedValue = $(e.target).val();
    //             setFormData({ ...formData, id_admin: selectedValue });
    //         });
    //         return () => {
    //             $('#id_admin').select2('destroy');
    //         };
    //     }
    // }, [showModal]);

    // useEffect(() => {
    //     if (showModalFormVerifikasi) {
    //         $('#id_admin_verif').select2({
    //             placeholder: '--- Pilih Admin ---',
    //             allowClear: true,
    //         }).on('change', (e) => {
    //             const selectedValue = $(e.target).val();
    //             getDataDetailAdminDinas(selectedValue);
    //             setDataFormVerifikasi({ ...DataFormVerifikasi, id_admin: selectedValue });
    //         });
    //         return () => {
    //             $('#id_admin_verif').select2('destroy');
    //         };
    //     }
    // }, [showModalFormVerifikasi]);

    // useEffect(() => {
    //     if (showModalFormVerifikasiPengunjung) {
    //         $('#id_admin_verif_pengunjung').select2({
    //             placeholder: '--- Pilih Admin ---',
    //             allowClear: true,
    //         }).on('change', (e) => {
    //             const selectedValue = $(e.target).val();
    //             getDataDetailAdminDinas(selectedValue);
    //             setDataFormVerifikasiPengunjung({ ...DataFormVerifikasiPengunjung, id_admin: selectedValue });
    //         });
    //         return () => {
    //             $('#id_admin_verif_pengunjung').select2('destroy');
    //         };
    //     }
    // }, [showModalFormVerifikasiPengunjung]);

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

    // const openModalTutorialMaps = () => {
    //     setShowModalTutorial(true);
    //     setIsClosingshowModalTutorial(false);
    // };

    // const closeModalTutorialMaps = () => {
    //     setIsClosingshowModalTutorial(true);
    //     setTimeout(() => {
    //         setShowModalTutorial(false);
    //         setIsClosingshowModalTutorial(false);
    //     }, 500);
    // };

    // const openModalChangesMaps = (id_penginapan, status, url) => {
    //     if (status === "update") {
    //         setFormDataEditMaps({
    //             id: id_penginapan,
    //             statusModal: status,
    //             url: url
    //         })
    //         setShowMaps(true)
    //     } else {
    //         setFormDataEditMaps({
    //             id: id_penginapan,
    //             statusModal: status
    //         })
    //     }
    //     setShowModalFormMaps(true);
    //     setIsClosingFormMaps(false);
    // };

    // const closeModalChangesMaps = () => {
    //     setIsClosingFormMaps(true);
    //     setTimeout(() => {
    //         setShowModalFormMaps(false);
    //         setIsClosingFormMaps(false);
    //         setFormDataEditMaps({
    //             id: '',
    //             url: '',
    //             statusModal: ''
    //         })
    //     }, 500);
    // };

    // const openModalChangesFasilitas = (id_menu, status) => {
    //     if (status === "update") {
    //         setFormDataEditFasilitas({
    //             id: id_paket_homestay,
    //             statusModal: status
    //         })
    //     } else {
    //         setFormDataEditFasilitas({
    //             id: id_paket_homestay,
    //             statusModal: status
    //         })
    //     }
    //     setShowModalFormFasilitas(true);
    //     setIsClosingFormFasilitas(false);
    // };

    // const closeModalChangesFasilitas = () => {
    //     setIsClosingFormFasilitas(true);
    //     setTimeout(() => {
    //         setShowModalFormFasilitas(false);
    //         setIsClosingFormFasilitas(false);
    //         setFormDataEditFasilitas({
    //             id: '',
    //             statusModal: ''
    //         })
    //     }, 500);
    // };

    // const openModalEdit = (tahun_data_pengunjung, bulan_data_pengunjung, jumlah_pengunjung_lokal, jumlah_pengunjung_mancanegara, jumlah_pegawai_laki, jumlah_pegawai_perempuan, id) => {
    //     setFormDataEdit({
    //         tahun_data_pengunjung: tahun_data_pengunjung,
    //         bulan_data_pengunjung: bulan_data_pengunjung,
    //         jumlah_pengunjung_lokal: jumlah_pengunjung_lokal,
    //         jumlah_pengunjung_mancanegara: jumlah_pengunjung_mancanegara,
    //         jumlah_pegawai_laki: jumlah_pegawai_laki,
    //         jumlah_pegawai_perempuan: jumlah_pegawai_perempuan,
    //         id: id,
    //     });
    //     setShowModalEdit(true);
    //     setIsClosingEdit(false);
    // };

    // const closeModalEdit = () => {
    //     setIsClosingEdit(true);
    //     setTimeout(() => {
    //         setShowModalEdit(false);
    //         setIsClosingEdit(false);
    //     }, 500);
    // };

    // const openModalDelete = (id_data_pengunjung) => {
    //     setDataDelete({
    //         id: id_data_pengunjung
    //     });
    //     setShowModalDelete(true);
    //     setIsClosingDelete(false);
    // };

    // const closeModalDelete = () => {
    //     setIsClosingDelete(true);
    //     setTimeout(() => {
    //         setShowModalDelete(false);
    //         setIsClosingDelete(false);
    //         setDataDelete({
    //             id: ''
    //         });
    //     }, 500);
    // };

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

    // const openModalFormVerifikasi = (id_menu, status) => {
    //     if (role === "dinas") {
    //         setDataFormVerifikasi({
    //             id_admin: id_admin_login,
    //             id_menu: id_menu,
    //             status_verifikasi: status
    //         });
    //         getDataDetailAdminDinas(id_admin_login);
    //     } else {
    //         setDataFormVerifikasi({
    //             id_menu: id_menu,
    //             status_verifikasi: status
    //         });
    //     }
    //     setShowModalFormVerifikasi(true);
    //     setIsClosingFormVerifikasi(false);
    // };

    // const closeModalFormVerifikasi = () => {
    //     setIsClosingFormVerifikasi(true);
    //     setTimeout(() => {
    //         setShowModalFormVerifikasi(false);
    //         setIsClosingFormVerifikasi(false);
    //         setDataFormVerifikasi({
    //             id_paket_homestay: '',
    //             id_admin: '',
    //             username: '',
    //             nama_lengkap: '',
    //             sampul_admin: '',
    //             status_verifikasi: ''
    //         });
    //         setDataDetailAdminVerifikator([])
    //     }, 500);
    // };

    // const openModalFormVerifikasiPengunjung = (id_data_pengunjung, status) => {
    //     if (role === "dinas") {
    //         setDataFormVerifikasiPengunjung({
    //             id_admin: id_admin_login,
    //             id_data_pengunjung: id_data_pengunjung,
    //             status_verifikasi: status
    //         });
    //         getDataDetailAdminDinas(id_admin_login);
    //     } else {
    //         setDataFormVerifikasiPengunjung({
    //             id_data_pengunjung: id_data_pengunjung,
    //             status_verifikasi: status
    //         });
    //     }
    //     setShowModalFormVerifikasiPengunjung(true);
    //     setIsClosingFormVerifikasiPengunjung(false);
    // };

    // const closeModalFormVerifikasiPengunjung = () => {
    //     setIsClosingFormVerifikasiPengunjung(true);
    //     setTimeout(() => {
    //         setShowModalFormVerifikasiPengunjung(false);
    //         setIsClosingFormVerifikasiPengunjung(false);
    //         setDataFormVerifikasiPengunjung({
    //             id_data_pengunjung: '',
    //             id_admin: '',
    //             username: '',
    //             nama_lengkap: '',
    //             sampul_admin: '',
    //             status_verifikasi: ''
    //         });
    //         setDataDetailAdminVerifikator([])
    //     }, 500);
    // };

    // const handleInputChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData({ ...formData, [name]: value });
    // };

    // const handleInputChangeEdit = (e) => {
    //     const { name, value } = e.target;
    //     setFormDataEdit({ ...formDataEdit, [name]: value });
    // };

    // const handleInputChangeEditMaps = (e) => {
    //     setShowMaps(false)
    //     const { name, value } = e.target;
    //     setFormDataEditMaps({ ...formDataEditMaps, [name]: value });
    // };

    // const handleInputChangeFormVerifikasi = (e) => {
    //     const { name, value } = e.target;
    //     setDataFormVerifikasi({ ...DataFormVerifikasi, [name]: value });
    // };

    // const handleInputChangeFormVerifikasiPengunjung = (e) => {
    //     const { name, value } = e.target;
    //     setDataFormVerifikasiPengunjung({ ...DataFormVerifikasiPengunjung, [name]: value });
    // };

    const ButtonhandleSubmit = () => {
        document.getElementById('submit').click();
    };

    const ButtonhandleSubmitDelete = () => {
        document.getElementById('submitDelete').click();
    };

    const ButtonhandleSubmitUpdate = () => {
        document.getElementById('submitEdit').click();
    };
    // const ButtonhandleSubmitUpdateMaps = () => {
    //     document.getElementById('submitEditMaps').click();
    // };

    // const ButtonhandleSubmitVerifikasi = () => {
    //     document.getElementById('submitVerifikasi').click();
    // };

    // const ButtonhandleSubmitVerifikasiPengunjung = () => {
    //     document.getElementById('submitVerifikasiPengunjung').click();
    // };

    // const ButtonhandleSubmitUpdateFasilitas = () => {
    //     document.getElementById('submitEditFasilitas').click();
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/add_data/byAdmin?keywoard=tbl_penginapan`, {
    //             tahun_data_pengunjung: formData.tahun_data_pengunjung,
    //             bulan_data_pengunjung: formData.bulan_data_pengunjung,
    //             jumlah_pengunjung_lokal: formData.jumlah_pengunjung_lokal,
    //             jumlah_pengunjung_mancanegara: formData.jumlah_pengunjung_mancanegara,
    //             jumlah_pegawai_laki: formData.jumlah_pegawai_laki,
    //             jumlah_pegawai_perempuan: formData.jumlah_pegawai_perempuan,
    //             id_table: id_penginapan
    //         })
    //         if (response) {
    //             setResponseMessage(response.data.message);
    //             setResponseMessageStatus(response.data.status);
    //             closeModal();
    //             getData();
    //             setFormData({
    //                 tahun_data_pengunjung: '',
    //                 bulan_data_pengunjung: '',
    //                 jumlah_pengunjung_lokal: '',
    //                 jumlah_pengunjung_mancanegara: '',
    //                 jumlah_pegawai_laki: '',
    //                 jumlah_pegawai_perempuan: '',
    //             })
    //             setTimeout(() => {
    //                 setResponseMessage('');
    //                 setResponseMessageStatus('');
    //             }, 2000)
    //         }
    //     } catch (error) {
    //         if (error.response.status === 422) {
    //             closeModal();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             getData();
    //             setTimeout(() => {
    //                 setResponseMessage('');
    //             }, 2000)
    //         } else {
    //             closeModal();
    //             getData();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         }
    //     }
    // };

    // const handleSubmitUpdate = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/update/byAdmin/${formDataEdit.id}`, {
    //             tahun_data_pengunjung: formDataEdit.tahun_data_pengunjung,
    //             bulan_data_pengunjung: formDataEdit.bulan_data_pengunjung,
    //             jumlah_pengunjung_lokal: formDataEdit.jumlah_pengunjung_lokal,
    //             jumlah_pengunjung_mancanegara: formDataEdit.jumlah_pengunjung_mancanegara,
    //             jumlah_pegawai_laki: formDataEdit.jumlah_pegawai_laki,
    //             jumlah_pegawai_perempuan: formDataEdit.jumlah_pegawai_perempuan
    //         })
    //         if (response) {
    //             setResponseMessage(response.data.message);
    //             setResponseMessageStatus(response.data.status);
    //             closeModalEdit();
    //             getData();
    //             setFormDataEdit({
    //                 tahun_data_pengunjung: '',
    //                 bulan_data_pengunjung: '',
    //                 jumlah_pengunjung_aplikasi: '',
    //                 jumlah_pengunjung_lokal: '',
    //                 jumlah_pengunjung_mancanegara: '',
    //                 jumlah_pegawai_laki: '',
    //                 jumlah_pegawai_perempuan: '',
    //                 id: '',
    //             })
    //             setTimeout(() => {
    //                 setResponseMessage('');
    //                 setResponseMessageStatus('');
    //             }, 2000)
    //         }
    //     } catch (error) {
    //         if (error.response.status === 422) {
    //             closeModalEdit();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         } else {
    //             closeModalEdit();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         }
    //     }

    // };

    // const handleSubmitUpdateMaps = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/maps_penginapan/update/byAdmin/${formDataEditMaps.id}`, {
    //             url: formDataEditMaps.url
    //         })
    //         if (response) {
    //             setResponseMessage(response.data.message);
    //             setResponseMessageStatus(response.data.status);
    //             closeModalChangesMaps();
    //             getData();
    //             setFormDataEditMaps({
    //                 url: '',
    //                 statusModal: '',
    //                 id: '',
    //             })
    //             setTimeout(() => {
    //                 setResponseMessage('');
    //                 setResponseMessageStatus('');
    //             }, 2000)
    //         }
    //     } catch (error) {
    //         if (error.response.status === 422) {
    //             closeModalChangesMaps();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         } else {
    //             closeModalChangesMaps();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         }
    //     }

    // };

    // const handleSubmitDelete = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         const response = await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/delete/byAdmin/${DataDelete.id}`)
    //         if (response) {
    //             setResponseMessage(response.data.message);
    //             setResponseMessageStatus(response.data.status);
    //             closeModalDelete();
    //             getData();
    //             setTimeout(() => {
    //                 setResponseMessage('');
    //                 setResponseMessageStatus('');
    //             }, 2000)
    //         }
    //     } catch (error) {
    //         if (error.response.status === 422) {
    //             closeModalDelete();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessage('');
    //                 setResponseMessageStatus('');
    //             }, 2000)
    //         } else {
    //             closeModalDelete();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         }
    //     }

    // };

    // const handleSubmitUpdateVerifikasi = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/homestay/verif/byAdmin/${DataFormVerifikasi.id_paket_homestay}`, {
    //             id_admin: DataFormVerifikasi.id_admin,
    //             status_verifikasi: DataFormVerifikasi.status_verifikasi
    //         })
    //         if (response) {
    //             setResponseMessage(response.data.message);
    //             setResponseMessageStatus(response.data.status);
    //             closeModalFormVerifikasi();
    //             getData();
    //             setDataFormVerifikasi({
    //                 id_paket_homestay: '',
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

    // const handleSubmitUpdateVerifikasiPengunjung = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_URL}/api/pengunjung/verifikasi/byAdmin/${DataFormVerifikasiPengunjung.id_data_pengunjung}`, {
    //             id_admin: DataFormVerifikasiPengunjung.id_admin,
    //             status_verifikasi: DataFormVerifikasiPengunjung.status_verifikasi
    //         })
    //         if (response) {
    //             setResponseMessage(response.data.message);
    //             setResponseMessageStatus(response.data.status);
    //             closeModalFormVerifikasiPengunjung();
    //             getData();
    //             setDataFormVerifikasiPengunjung({
    //                 id_data_pengunjung: '',
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
    //             closeModalFormVerifikasiPengunjung();
    //             getData();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         } else {
    //             closeModalFormVerifikasiPengunjung();
    //             getData();
    //             setResponseMessageStatus(error.response.data.status);
    //             setResponseMessage(error.response.data.message);
    //             setTimeout(() => {
    //                 setResponseMessageStatus('');
    //                 setResponseMessage('');
    //             }, 2000)
    //         }
    //     }

    // };

    // const handleSubmitUpdateFasilitas = async (e) => { //MASALAH
    //     e.preventDefault();
    //     setLoading(true);

    //     try {
    //         console.log(listFasilitas);
    //         const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/homestay/add_fasilitas/byAdmin`, {
    //             id_paket_homestay: formDataEditFasilitas.id,
    //             valueFasilitas: listFasilitas
    //         })
    //         if (response) {
    //             closeModalChangesFasilitas();
    //             getData();
    //             setFormDataEditFasilitas({
    //                 id: '',
    //                 statusModal: ''
    //             })
    //         }
    //     } catch (error) {
    //         if (error.response.status === 422) {
    //             closeModalChangesFasilitas();
    //             getData();
    //             setFormDataEditFasilitas({
    //                 id: '',
    //                 statusModal: ''
    //             })
    //         } else {
    //             closeModalChangesFasilitas();
    //             getData();
    //             setFormDataEditFasilitas({
    //                 id: '',
    //                 statusModal: ''
    //             })
    //         }
    //     }

    // };

    const formatDate = (dateString) => {
        return moment(dateString).format('YYYY-MM-DD HH:mm');
    };

    const back = () => {
        navigate(-1)
    }

    // const handleCheckboxChange = (event) => {
    //     const { value, checked } = event.target;
    //     const updatedlistFasilitas = checked
    //         ? [...listFasilitas, parseInt(value)]
    //         : listFasilitas.filter((item) => item !== parseInt(value));

    //     setListFasilitas(updatedlistFasilitas);
    // };


    return (
        <div className="main-panel">
            <div className="content-wrapper">
                <div className="row">
                    <div className='d-flex w-100'>
                        <h4 className="card-title">Detail Berita</h4>
                    </div>

                    {showModalDetailAdmin && (
                        <div className={`modal ${isClosingDetailAdmin ? 'closing' : ''}`} onClick={closeModalDetailAdmin}>
                            <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Detail {DataDetailAdmin.jenis_detail === "admin" ? "Admin Kamar" : DataDetailAdmin.jenis_detail === "author" ? "Admin Author" : "Admin Verifikator"}</h3>
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

                    {/* {showModalFormVerifikasi && (
                        <div className={`modal ${isClosingFormVerifikasi ? 'closing' : ''}`} onClick={closeModalFormVerifikasi}>
                            <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                                <div className="modal-header">
                                    <h3>Verifikasi Kamar</h3>
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

            {showModalFormFasilitas && (
                        <div className={`modal ${isClosingFormFasilitas ? 'closing' : ''}`}>
                        <div className="modal-content slideDown" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Form {formDataEditFasilitas.statusModal === "add" ? "Tambah" : "Edit"} List Fasilitas</h3>
                                <div>
                                    <span className="close" onClick={closeModalChangesFasilitas}>&times;</span>
                                </div>
                            </div>
                            <div className="modal-body">
                                <form className="modal-form" onSubmit={handleSubmitUpdateFasilitas}>
                                    <div className="pl-2 d-flex flex-row">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value="1"
                                            id="defaultCheck1"
                                            onChange={handleCheckboxChange}
                                            checked={listFasilitas.includes(1)}
                                        />
                                        <span className='ml-2'>AC</span>
                                    </div>
                                    <div className="pl-2 py-3 d-flex flex-row">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value="2"
                                            id="defaultCheck1"
                                            onChange={handleCheckboxChange}
                                            checked={listFasilitas.includes(2)}
                                        />
                                        <span className='ml-2'>Restaurant</span>
                                    </div>
                                    <div className="pl-2 d-flex flex-row">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value="3"
                                            id="defaultCheck1"
                                            onChange={handleCheckboxChange}
                                            checked={listFasilitas.includes(3)}
                                        />
                                        <span className='ml-2'>Wifi</span>
                                    </div>
                                    <div className="pl-2 py-3 d-flex flex-row">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value="4"
                                            id="defaultCheck1"
                                            onChange={handleCheckboxChange}
                                            checked={listFasilitas.includes(4)}
                                        />
                                        <span className='ml-2'>Lift</span>
                                    </div>
                                    <div className="pl-2 d-flex flex-row">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value="5"
                                            id="defaultCheck1"
                                            onChange={handleCheckboxChange}
                                            checked={listFasilitas.includes(5)}
                                        />
                                        <span className='ml-2'>Pusat Kebugaran</span>
                                    </div>
                                    <div className="pl-2 d-flex flex-row">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value="6"
                                            id="defaultCheck1"
                                            onChange={handleCheckboxChange}
                                            checked={listFasilitas.includes(6)}
                                        />
                                        <span className='ml-2'>Parkiran</span>
                                    </div>
                                    <div className="pl-2 d-flex flex-row">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value="7"
                                            id="defaultCheck1"
                                            onChange={handleCheckboxChange}
                                            checked={listFasilitas.includes(7)}
                                        />
                                        <span className='ml-2'>Kolam Renang</span>
                                    </div>
                                    <div className="pl-2 d-flex flex-row">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            value="8"
                                            id="defaultCheck1"
                                            onChange={handleCheckboxChange}
                                            checked={listFasilitas.includes(8)}
                                        />
                                        <span className='ml-2'>Resepsionis 24 Jam</span>
                                    </div>
                                    <input
                                        type="submit"
                                        id="submitEditFasilitas"
                                        style={{ display: 'none' }}
                                    />
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="button good" onClick={ButtonhandleSubmitUpdateFasilitas}>Submit</button>
                            </div>
                        </div>
                    </div>
                )} */}

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
                                            {['Detail Berita'].map((tab) => (
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
  DataDetailBerita && (
    <div className='d-flex flex-column my-5'>
      <div className='cover-detail-content' style={{ display: activeTab === "Detail Berita" ? "" : "none" }}>
        <div className='detail-content'>
          <div className='detail-content-row'>
            <span className='title-name'>Judul Berita</span>
            <span>:</span>
            <span className='subtitle-name'>{DataDetailBerita.title}</span>
          </div>
          <div className='detail-content-row'>
            <span className='title-name'>Deskripsi</span>
            <span>:</span>
            <span className='subtitle-name' style={{ whiteSpace: 'pre-wrap', width: 850 }}>{DataDetailBerita.description}</span>
          </div>
          <div className='detail-content-row'>
            <span className='title-name' >Isi Content</span>
            <span>:</span>
            <div
              className='subtitle-name'
              dangerouslySetInnerHTML={{ __html: DataDetailBerita.content }}
              style={{ whiteSpace: 'pre-wrap', width: 850 }}
            />
          </div>
          <div className='detail-content-row'>
            <span className='title-name'>Sampul berita</span>
            <span>:</span>
            <img src={DataDetailBerita.sampul_berita} alt="Sampul" />
          </div>
          <div className='detail-content-row'>
            <span className='title-name'>Dibuat pada</span>
            <span>:</span>
            <span className='subtitle-name'>{formatDate(DataDetailBerita.createdAt)}</span>
          </div>
          <div className='detail-content-row'>
            <span className='title-name'>Diubah pada</span>
            <span>:</span>
            <span className='subtitle-name'>{formatDate(DataDetailBerita.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
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

export default DetailBerita;
