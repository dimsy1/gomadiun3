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


const HCIDatapengunjung = ({ role, id_admin_login }) => {
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
    const [isClosingExport, setIsClosingExport] = useState(false);
    const [alertExport, setAlertExport] = useState('');
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [isClosingDelete, setIsClosingDelete] = useState(false);
    const [searchTerm, setKeyword] = useState('');
    const [responseMessage, setResponseMessage] = useState('');
    const [responseMessageStatus, setResponseMessageStatus] = useState('');
    const [listKecamatan, setListKecamatan] = useState([]);
    const [kecamatan, setKecamatan] = useState('');
    const [tahun, setTahun] = useState('');
    // const [file, setFile] = useState(null);
    const [alert, setAlert] = useState('');
    const [result, setResult] = useState(null);
    const [fileHCI, setFileHCI] = useState(null);
    const [filePengunjung, setFilePengunjung] = useState(null);
    const [filename, setFilename] = useState('');



    const [DataDetailAdmin, setDataDetailAdmin] = useState({
        jenis_detail: '',
        username: '',
        nama_lengkap: '',
        role: '',
        sampul_admin: ''
    });

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!fileHCI || !filePengunjung || !filename) {
    setAlert('Semua data (HCI, Pengunjung, dan nama file) wajib diisi.');
    return;
  }

  const formData = new FormData();
  formData.append('hci', fileHCI);
  formData.append('kunjungan', filePengunjung);
  formData.append('filename', filename);

  try {
    setLoading(true);
    setAlert('');
    setResult(null);

    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API_URL}/api/hci/hitung-korelasi`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    setResult(response.data); // tampilkan respon JSON
  } catch (error) {
    console.error('ERROR submit:', error);
    setAlert('Terjadi kesalahan saat menghitung korelasi');
  } finally {
    setLoading(false);
  }
};


const handleExportExcel = async () => {
  const formData = new FormData();
  formData.append('hci', fileHCI);
  formData.append('kunjungan', filePengunjung);
  formData.append('filename', filename);

  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_API_URL}/api/korelasi`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob',
      }
    );

    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    alert('Gagal mengekspor file Excel');
  }
};



console.log('fileHCI:', fileHCI);
console.log('filePengunjung:', filePengunjung);
console.log('filename:', filename, typeof filename);



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




   return (
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="card p-4">
          <h4 className="mb-3">Upload Data & Hitung Korelasi HCI</h4>

          {alert && <div className="alert alert-warning">{alert}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
            </div>
            <div className="form-group mb-3">
  <label>Nama File Output (tanpa ekstensi)</label>
<input
  type="text"
  className="form-control"
  value={filename}
  onChange={(e) => setFilename(e.target.value)}
  required
/>

</div>

            <div className="form-group mb-3">
  <label>Upload File Data HCI (CSV / XLSX)</label>
  <input
    type="file"
    className="form-control"
    onChange={(e) => setFileHCI(e.target.files[0])}
    accept=".csv,.xlsx"
    required
  />
</div>

<div className="form-group mb-3">
  <label>Upload File Data Pengunjung (CSV / XLSX)</label>
  <input
    type="file"
    className="form-control"
    onChange={(e) => setFilePengunjung(e.target.files[0])}
    accept=".csv,.xlsx"
    required
  />
</div>

            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Menghitung...' : (
                <>
                  <FontAwesomeIcon icon={faFileExcel} className="me-2" style={{ marginRight : "10px" }}/>
                  Hitung Korelasi
                </>
              )}
            </button>
          </form>

{result && (
  <div className="mt-4">
    <div className="alert alert-info w-100" style={{ maxWidth: '600px' }}>
      <h5>Hasil Perhitungan Korelasi:</h5>
      <div className="table-responsive">
        <table className="table table-bordered table-sm w-auto">
          <tbody>
            <tr>
              <th>Status</th>
              <td>{result.status}</td>
            </tr>
            <tr>
              <th>Pearson</th>
              <td>{result.pearson}</td>
            </tr>
            <tr>
              <th>Spearman</th>
              <td>{result.spearman}</td>
            </tr>
            <tr>
              <th>Akurasi</th>
              <td>{result.accuracy}</td>
            </tr>
            <tr>
              <th>Precision</th>
              <td>{result.precision}</td>
            </tr>
            <tr>
              <th>Recall</th>
              <td>{result.recall}</td>
            </tr>
            <tr>
              <th>F1 Score</th>
              <td>{result.f1}</td>
            </tr>
            <tr>
              <th>Confusion Matrix</th>
              <td>
                <table className="table table-bordered table-sm mb-0 w-auto">
                  <thead>
                    <tr>
                      <th>TP</th>
                      <th>FP</th>
                      <th>FN</th>
                      <th>TN</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{result.confusionMatrix?.TP}</td>
                      <td>{result.confusionMatrix?.FP}</td>
                      <td>{result.confusionMatrix?.FN}</td>
                      <td>{result.confusionMatrix?.TN}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
            <tr>
  <th>Kesimpulan</th>
  <td style={{
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxWidth: '400px',
    lineHeight: '1.5'
  }}>
    {result.kesimpulan}
  </td>
</tr>

          </tbody>
        </table>
      </div>
    </div>

    <button onClick={handleExportExcel} className="btn btn-outline-primary mt-2">
      <FontAwesomeIcon icon={faFileExcel} className="me-2" style={{ marginRight : "10px" }}/>
      Export ke Excel
    </button>
  </div>
)}






        </div>
      </div>
    </div>
  );
};


export default HCIDatapengunjung;
