import { React, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import ReactPaginate from 'react-paginate';
import Footer from '../../components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft, faArrowRight, faCheck, faEdit, faEye, faTimes, faTrash, faUserLock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2/dist/js/select2.min.js';


const TableHistoryHCI = ({ role, id_admin_login }) => {
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
      const [showPopup, setShowPopup] = useState(false);
  const [kecamatan, setKecamatan] = useState("");
  const [tahun, setTahun] = useState("");
  const [filename, setFilename] = useState("");
  const [isClosingExport, setIsClosingExport] = useState(false);
const [alertExport, setAlertExport] = useState('');

    const [showModalDelete, setShowModalDelete] = useState(false);
    const [isClosingDelete, setIsClosingDelete] = useState(false);
    const [searchTerm, setKeyword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [responseMessageStatus, setResponseMessageStatus] = useState('');
    const [AlertaddImage, setAlertaddImage] = useState('');
    const [listKecamatan, setListKecamatan] = useState([]);


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

    // State untuk modal export
const [showExportModal, setShowExportModal] = useState(false);
const [exportFilters, setExportFilters] = useState({
    kecamatan: '',
    tahun: '',
    filename: ''
});

const closeExportModal = () => {
  setIsClosingExport(true);
  setTimeout(() => {
    setShowExportModal(false);
    setIsClosingExport(false);
    setExportFilters({ kecamatan: '', tahun: '', filename: '' });
    setAlertExport('');
  }, 500);
};

useEffect(() => {
  const fetchKecamatan = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/kecamatan/get_all");
      setListKecamatan(res.data.data); // Ambil array-nya di sini
    } catch (err) {
      console.error("Gagal ambil kecamatan", err);
    }
  };

  fetchKecamatan();
}, []);




const handleExportSubmit = async (e) => {
  e.preventDefault();

  if (!exportFilters.kecamatan || !exportFilters.tahun || !exportFilters.filename) {
    setAlertExport("Semua field harus diisi!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append('kecamatan', exportFilters.kecamatan);
    formData.append('tahun', exportFilters.tahun);
    formData.append('filename', exportFilters.filename);

    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API_URL}/api/hci/export-history/`,
      formData,
      { responseType: 'blob' }
    );

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${exportFilters.filename || 'export'}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportModal(false);
    setExportFilters({ kecamatan: '', tahun: '', filename: '' });
    setAlertExport('');
  } catch (error) {
    console.error('Export gagal:', error);
    setAlertExport("Terjadi kesalahan saat ekspor data!");
  }
};
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
                url = `${process.env.REACT_APP_BACKEND_API_URL}/api/hci/get_all/?keyword=${searchTerm}`;
            }
            else {
                url = `${process.env.REACT_APP_BACKEND_API_URL}/api/hci/get_all/?keyword=${searchTerm}`;
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

//     const exportDataHCI = async () => {
//   try {
//     const formData = new FormData();
//     formData.append('kecamatan', kecamatan);
//     formData.append('tahun', tahun);
//     formData.append('filename', filename);

//     const response = await axios.post(
//       'http://localhost:3001/api/hci/export-history/',
//       formData,
//       { responseType: 'blob' }
//     );

//     const blob = new Blob([response.data], {
//       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//     });

//     const downloadUrl = window.URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = downloadUrl;
//     link.setAttribute('download', `${filename || 'export'}.xlsx`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     setShowPopup(false);
//   } catch (error) {
//     console.error('Export gagal:', error);
//     alert('Terjadi kesalahan saat mengekspor data!');
//   }
// };




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
        getData();
    }, []);

    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 10; // Tentukan jumlah item per halaman
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

    const openModalDelete = (id_hci, name_kecamatan) => {
        setDataDelete({
            id: id_hci,
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

    const ButtonhandleSubmitDelete = () => {
        document.getElementById('submitDelete').click();
    };



    const handleSubmitDelete = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND_API_URL}/api/hci/delete/${DataDelete.id}`)
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



    return (
        <div className="main-panel">
            <div className="content-wrapper">
                <div className="row">
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
      <h4 className="card-title">Tabel Data Perhitungan HCI</h4>

     

      {/* Pesan Response */}
      {responseMessage && (
        <div
          className={`alert ${responseMessageStatus === "success" ? "alert-success" : "alert-danger"}`}
          role="alert"
        >
          {responseMessage}
        </div>
      )}

      {/* Pop-up Filter Form */}
      {showExportModal && (
    <div className={`modal ${isClosingExport ? 'closing' : ''}`}>
        <div className="modal-content slideDown">
            {alertExport && (
                <div className="alert alert-warning" role="alert">
                    {alertExport}
                </div>
            )}
            <div className="modal-header">
                <h3>Export Data HCI</h3>
                <div>
                    <span className="close" onClick={closeExportModal}>&times;</span>
                </div>
            </div>
            <div className="modal-body">
                <form onSubmit={handleExportSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="kecamatan">Nama Kecamatan</label>
                       <select
        className="form-control"
        id="kecamatan"
        value={exportFilters.kecamatan}
        onChange={(e) =>
          setExportFilters({ ...exportFilters, kecamatan: e.target.value })
        }
        required
      >
        <option value="">-- Pilih Kecamatan --</option>
        {Array.isArray(listKecamatan) && listKecamatan.length > 0 ? (
          listKecamatan.map((item) => (
            <option key={item.id_kecamatan} value={item.id_kecamatan}>
              {item.nama_kecamatan}
            </option>
          ))
        ) : (
          <option disabled>Memuat data kecamatan...</option>
        )}
      </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="tahun">Tahun</label>
                        <input
                            type="text"
                            name="tahun"
                            value={exportFilters.tahun}
                            onChange={(e) => setExportFilters({ ...exportFilters, tahun: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="filename">Nama File</label>
                        <input
                            type="text"
                            name="filename"
                            value={exportFilters.filename}
                            onChange={(e) => setExportFilters({ ...exportFilters, filename: e.target.value })}
                            required
                        />
                    </div>
                    <input type="submit" id="submitExport" style={{ display: 'none' }} />
                </form>
            </div>
            <div className="modal-footer">
                <button className="button good" onClick={handleExportSubmit}>Export</button>
            </div>
        </div>
    </div>
)}


      {/* Export & Search Bar in One Row */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
  {/* Tombol Export */}
  <button
    type="button"
    className="button excel rounded"
    onClick={() => setShowExportModal(true)}
    style={{ padding: "8px 16px", fontSize: "14px" }}
  >
    <FontAwesomeIcon icon={faFileExcel} width={17} />
    <span className="mx-2">Export Data</span>
  </button>

  {/* Search Bar */}
  <div className="search-container">
    <input
      type="text"
      placeholder="Search..."
      value={searchTerm}
      onChange={searchKeyword}
    />
  </div>
</div>


      {/* Tabel Data */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Kecamatan</th>
              <th>Temperatur</th>
              <th>Awan</th>
              <th>Hujan</th>
              <th>Angin</th>
              <th>HCI Score</th>
              <th>HCI Kategori</th>
              <th>Tanggal</th>
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
                                                            <td>{item.kecamatan?.nama_kecamatan || '-'}</td>
                                                            <td>{item.temp}</td>
                                                            <td>{item.clouds}</td>
                                                            <td>{item.rain}</td>
                                                            <td>{item.wind}</td>
                                                            <td>{item.hci_score}</td>
                                                            <td>{item.hci_kategori}</td>
                                                            <td>{item.tanggal.slice(0, 10)}</td>
                                                            <td>
                                                                <FontAwesomeIcon icon={faTrash} onClick={() => openModalDelete(item.id_hci, item.kecamatan?.nama_kecamatan)} />
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

export default TableHistoryHCI;
