import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faInfoCircle, faQrcode, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ role }) => {
    const location = useLocation();
    const [isAuthExpanded, setIsAuthExpanded] = useState(false);
    const [isAuthExpandedDestinasi, setIsAuthExpandedDestinasi] = useState(false);

    const [dataAvailability, setDataAvailability] = useState({
        kamarHotel: false,
        kuliner: false,
        menuKuliner: false,
        penginapan: false,
        kamarHomestay:false,
    });

    useEffect(() => {
        const fetchDataAvailability = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_API_URL}/api/userindustri/availability`, {
                    method: 'GET',
                    credentials: 'include', // Tambahkan ini agar cookie dikirim
                });
        
                if (!response.ok) {
                    throw new Error('Failed to fetch data availability');
                }
        
                const availability = await response.json();
                console.log('Fetched Availability:', availability);
                setDataAvailability(availability);
            } catch (error) {
                console.error('Error fetching data availability:', error);
            }
        };

        fetchDataAvailability();
    }, []);

    useEffect(() => {
        console.log('Updated Data Availability:', dataAvailability); // Memeriksa apakah state diperbarui dengan benar
    }, [dataAvailability]);
    

    useEffect(() => {
        if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/dinas') || location.pathname.startsWith('/industri') || location.pathname.startsWith('/pengelola') || location.pathname.startsWith('/users-pengelola')) {
            setIsAuthExpanded(true);
            setIsAuthExpandedDestinasi(false);
        } else {
            setIsAuthExpanded(false);
        }
        if (location.pathname.startsWith('/desawisata') || location.pathname.startsWith('/wisata') || location.pathname.startsWith('/kuliner') || location.pathname.startsWith('/penginapan') || location.pathname.startsWith('/kamar')|| location.pathname.startsWith('/paket_homestay') || location.pathname.startsWith ('/paketwisata')) {
            setIsAuthExpandedDestinasi(true);
            setIsAuthExpanded(false);
        } else {
            setIsAuthExpandedDestinasi(false);
        }
    }, [location.pathname]);

    const handleAuthClick = () => {
        setIsAuthExpandedDestinasi(false);
        if (isAuthExpanded) {
            setIsAuthExpanded(!isAuthExpanded);
        }
    };


    const handleAuthClickDestinasi = () => {
        setIsAuthExpanded(false);
        if (isAuthExpandedDestinasi) {
            setIsAuthExpandedDestinasi(!isAuthExpandedDestinasi);
        }
    };

    return (
        <nav className="sidebar sidebar-offcanvas" id="sidebar">
            <ul className="nav">

                <li className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    <Link className="nav-link" to="/dashboard">
                        <i className="menu-icon">  <FontAwesomeIcon icon={faHome} /></i>
                        <span className="menu-title">Dashboard</span>
                    </Link>
                </li>

                {role === 'admin' && (
                    <li className="nav-item">
                        <a
                            className={`nav-link ${isAuthExpanded ? 'expanded' : ''}`}
                            data-toggle="collapse"
                            href="#auth"
                            aria-expanded={isAuthExpanded}
                            aria-controls="auth"
                            onClick={handleAuthClick}
                        >
                            <i className="icon-head menu-icon"></i>
                            <span className="menu-title">Users</span>
                            <i className="menu-arrow"></i>
                        </a>
                        <div className={`collapse ${isAuthExpanded ? 'show' : ''}`} id="auth">
                            <ul className="nav flex-column sub-menu">
                                <li className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/admin">Admin</Link>
                                </li>
                                <li className={`nav-item ${location.pathname === '/dinas' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/dinas">Admin Dinas</Link>
                                </li>
                                <li className={`nav-item ${location.pathname === '/pengelola' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/pengelola">Admin Pengelola</Link>
                                </li>
                                <li className={`nav-item ${location.pathname === '/industri' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/industri">Admin Industri</Link>
                                </li>
                                <li className={`nav-item ${location.pathname === '/users-pengelola' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/users-pengelola">Users Pengelola</Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                )}


                {(role === 'admin pengelola' || role === 'admin industri') && (
                    <li className="nav-item">
                        <a
                            className={`nav-link ${isAuthExpanded ? 'expanded' : ''}`}
                            data-toggle="collapse"
                            href="#auth"
                            aria-expanded={isAuthExpanded}
                            aria-controls="auth"
                            onClick={handleAuthClick}
                        >
                            <i className="icon-head menu-icon"></i>
                            <span className="menu-title">Users</span>
                            <i className="menu-arrow"></i>
                        </a>
                        <div className={`collapse ${isAuthExpanded ? 'show' : ''}`} id="auth">
                            <ul className="nav flex-column sub-menu">
                                <li className={`nav-item ${location.pathname === '/users-pengelola' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/users-pengelola">Users Pengelola</Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                )}


        {(role === 'admin' || role === 'dinas') && (
                    <li className="nav-item">
                        <a
                            className={`nav-link ${isAuthExpandedDestinasi ? 'expanded' : ''}`}
                            data-toggle="collapse"
                            href="#destinasi"
                            aria-expanded={isAuthExpandedDestinasi}
                            aria-controls="auth"
                            onClick={handleAuthClickDestinasi}
                        >
                            <i className="icon-layout menu-icon"></i>
                            <span className="menu-title">Destinasi</span>
                            <i className="menu-arrow"></i>
                        </a>
                        <div className={`collapse ${isAuthExpandedDestinasi ? 'show' : ''}`} id="destinasi">
                            <ul className="nav flex-column sub-menu">
                            <li className={`nav-item ${location.pathname === '/berita' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/berita">Berita</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/hci' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/hci">HCI History Data</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/kecamatan' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/kecamatan">Kecamatan</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/desawisata' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/desawisata">Desa Wisata</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/wisata' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/wisata">Wisata</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/paketwisata' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/paketwisata">Paket Wisata</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/kuliner' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/kuliner">Kuliner</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/menu' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/menu">Menu Kuliner</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/penginapan' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/penginapan">Penginapan</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/kamar' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/kamar">Kamar Hotel</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/homestay' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/homestay">Kamar Homestay</Link>
                            </li>
                         </ul>
                    </div>
                    </li>
                )}




                {(role === 'admin pengelola') && (
                    <li className="nav-item">
                        <a
                            className={`nav-link ${isAuthExpandedDestinasi ? 'expanded' : ''}`}
                            data-toggle="collapse"
                            href="#destinasi"
                            aria-expanded={isAuthExpandedDestinasi}
                            aria-controls="auth"
                            onClick={handleAuthClickDestinasi}
                        >
                            <i className="icon-layout menu-icon"></i>
                            <span className="menu-title">Destinasi</span>
                            <i className="menu-arrow"></i>
                        </a>
                        <div className={`collapse ${isAuthExpandedDestinasi ? 'show' : ''}`} id="destinasi">
                            <ul className="nav flex-column sub-menu">
                                <li className={`nav-item ${location.pathname === '/desawisata' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/desawisata">Desa Wisata</Link>
                                </li>
                                <li className={`nav-item ${location.pathname === '/wisata' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/wisata">Wisata</Link>
                                </li>
                                <li className={`nav-item ${location.pathname === '/paketwisata' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/paketwisata">Paket Wisata</Link>
                                </li>
                            </ul>
                        </div>
                    </li>
                )}


                {(role === 'user pengelola') && (
                    <li className="nav-item">
                        <a
                            className={`nav-link ${isAuthExpandedDestinasi ? 'expanded' : ''}`}
                            data-toggle="collapse"
                            href="#destinasi"
                            aria-expanded={isAuthExpandedDestinasi}
                            aria-controls="auth"
                            onClick={handleAuthClickDestinasi}
                        >
                            <i className="icon-layout menu-icon"></i>
                            <span className="menu-title">Destinasi</span>
                            <i className="menu-arrow"></i>
                        </a>
                        <div className={`collapse ${isAuthExpandedDestinasi ? 'show' : ''}`} id="destinasi">
                            <ul className="nav flex-column sub-menu">
                                <li className={`nav-item ${location.pathname === '/wisata' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/wisata">Wisata</Link>
                                {/* </li>
                                <li className={`nav-item ${location.pathname === '/kuliner' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/kuliner">Kuliner</Link>
                            </li>
                            <li className={`nav-item ${location.pathname === '/menu' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/menu">Menu Kuliner</Link>
                            </li>
                                <li className={`nav-item ${location.pathname === '/penginapan' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/penginapan">Penginapan</Link>
                            </li>
                                <li className={`nav-item ${location.pathname === '/kamar' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/kamar">Kamar Hotel</Link>
                            </li>
                                <li className={`nav-item ${location.pathname === '/homestay' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/homestay">Kamar Homestay</Link> */}
                            </li>
                                <li className={`nav-item ${location.pathname === '/paketwisata' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/paketwisata">Paket Wisata</Link>
                            </li>
                         </ul>
                        </div>
                    </li>
                )}

                {(role === 'admin industri') && (
                    <li className="nav-item">
                        <a
                            className={`nav-link ${isAuthExpandedDestinasi ? 'expanded' : ''}`}
                            data-toggle="collapse"
                            href="#destinasi"
                            aria-expanded={isAuthExpandedDestinasi}
                            aria-controls="auth"
                            onClick={handleAuthClickDestinasi}
                        >
                            <i className="icon-layout menu-icon"></i>
                            <span className="menu-title">Destinasi</span>
                            <i className="menu-arrow"></i>
                        </a>
                        <div className={`collapse ${isAuthExpandedDestinasi ? 'show' : ''}`} id="destinasi">
                            <ul className="nav flex-column sub-menu">
                                <li className={`nav-item ${location.pathname === '/kuliner' ? 'active' : ''}`}>
                                    <Link className="nav-link" to="/kuliner">Kuliner</Link>
                                </li>
                            <li className={`nav-item ${location.pathname === '/menu' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/menu">Menu Kuliner</Link>
                            </li>
                                <li className={`nav-item ${location.pathname === '/penginapan' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/penginapan">Penginapan</Link>
                            </li>
                                <li className={`nav-item ${location.pathname === '/kamar' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/kamar">Kamar Hotel</Link>
                            </li>
                                <li className={`nav-item ${location.pathname === '/homestay' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/homestay">Kamar Homestay</Link>
                            {/* </li>
                                <li className={`nav-item ${location.pathname === '/paketwisata' ? 'active' : ''}`}>
                                <Link className="nav-link" to="/paketwisata">Paket Wisata</Link> */}
                            </li>
                         </ul>
                        </div>
                    </li>
                )}


{(role === 'user industri') && (
    <li className="nav-item">
        <a
            className={`nav-link ${isAuthExpandedDestinasi ? 'expanded' : ''}`}
            data-toggle="collapse"
            href="#destinasi"
            aria-expanded={isAuthExpandedDestinasi}
            aria-controls="auth"
            onClick={handleAuthClickDestinasi}
        >
            <i className="icon-layout menu-icon"></i>
            <span className="menu-title">Destinasi</span>
            <i className="menu-arrow"></i>
        </a>
        <div className={`collapse ${isAuthExpandedDestinasi ? 'show' : ''}`} id="destinasi">
            <ul className="nav flex-column sub-menu">
                {dataAvailability.kuliner && (
                    <li className={`nav-item ${location.pathname === '/kuliner' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/kuliner">Kuliner</Link>
                    </li>
                )}
                {dataAvailability.menuKuliner && (
                    <li className={`nav-item ${location.pathname === '/menu' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/menu">Menu Kuliner</Link>
                    </li>
                )}
                {dataAvailability.penginapan && (
                    <li className={`nav-item ${location.pathname === '/penginapan' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/penginapan">Penginapan</Link>
                    </li>
                )}
                {dataAvailability.kamarHotel && (
                    <li className={`nav-item ${location.pathname === '/kamar' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/kamar">Kamar Hotel</Link>
                    </li>
                )}
                {dataAvailability.kamarHomestay && (
                    <li className={`nav-item ${location.pathname === '/homestay' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/homestay">Kamar Homestay</Link>
                    </li>
                )}
            </ul>
        </div>
    </li>
)}


                {(role === 'admin pengelola' || role === 'admin industri' || role === 'user pengelola' || role === 'user industri') && (

                    <li className={`nav-item ${location.pathname === '/qrcode-scan' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/qrcode-scan">
                            <i className="menu-icon"> <FontAwesomeIcon icon={faQrcode} /> </i>

                            <span className="menu-title">Scan QRcode</span>
                        </Link>
                    </li>
                )}


                {(role === 'admin' || role === 'dinas') && (

                    <li className={`nav-item ${location.pathname === '/cekkorelasi' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/cekkorelasi">
                            <i className="menu-icon">  <FontAwesomeIcon icon={faProjectDiagram}/></i>
                            <span className="menu-title">Cek Korelasi</span>
                        </Link>
                    </li>
                )}

                {(role === 'admin' || role === 'dinas') && (

                    <li className={`nav-item ${location.pathname === '/pengumuman' ? 'active' : ''}`}>
                        <Link className="nav-link" to="/pengumuman">
                            <i className="menu-icon">  <FontAwesomeIcon icon={faInfoCircle} /></i>
                            <span className="menu-title">Pengumuman</span>
                        </Link>
                    </li>
                )}


            </ul>
        </nav>
    );
}

export default Sidebar;
