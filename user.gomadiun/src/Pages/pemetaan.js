import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./pemetaan.css";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import moment from "moment";
import Marker_Wisata1 from "../landingPage/assets/img/markerwisata1.png"; // alam
import Marker_Wisata2 from "../landingPage/assets/img/markerwisata2.png"; // buatan
import Marker_Wisata3 from "../landingPage/assets/img/markerwisata3.png"; // religi
import Marker_Wisata4 from "../landingPage/assets/img/markerwisata4.png"; // senibudaya
import Marker_Desa from "../landingPage/assets/img/markerdesa.png";
import Marker_Penginapan from "../landingPage/assets/img/markerpenginapan.png";
import Marker_Kuliner from "../landingPage/assets/img/markerkuliner.png";

const userLocationIcon = L.divIcon({
  html: '<div class="user-location-icon"></div>',
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const MapEvents = ({ userPosition, selectedDestination, routeGeoJson, focusCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (userPosition && selectedDestination && routeGeoJson) {
      const bounds = L.latLngBounds([userPosition, selectedDestination]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } 
    else if (userPosition && !selectedDestination && !focusCoords) {
      map.flyTo(userPosition, 14);
    }
  }, [map, userPosition, selectedDestination, routeGeoJson]);

  useEffect(() => {
    if (focusCoords) {
      map.flyTo(focusCoords, 17, {
        animate: true,
        duration: 1.5 
      });
    }
  }, [map, focusCoords]);

  return null;
};

const Pemetaan = () => {
  const [geoData, setGeoData] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [wisata, setWisata] = useState([]);
  const [penginapan, setPenginapan] = useState([]);
  const [kuliner, setKuliner] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [showLegend, setShowLegend] = useState(false);
  const [geoJsonKey, setGeoJsonKey] = useState(Date.now());
  const [showFilter, setShowFilter] = useState(false);
  const [cuacaBuruk, setCuacaBuruk] = useState(false);
  const [tanggalCuacaBuruk, setTanggalCuacaBuruk] = useState([]);
  const [userPosition, setUserPosition] = useState(null); 
  const [routeGeoJson, setRouteGeoJson] = useState(null); 
  const [selectedDestination, setSelectedDestination] = useState(null); 
  const today = moment().startOf("day");
  const [routeInfo, setRouteInfo] = useState(null); 
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [focusCoords, setFocusCoords] = useState(null);

  const tanggalCuacaBurukBaru = tanggalCuacaBuruk
    .map((t) => moment(t))
    .filter((t) => t.isSameOrAfter(today))
    .sort((a, b) => a - b);

  const cuacaBurukTerbaru =
    tanggalCuacaBurukBaru.length > 0 ? tanggalCuacaBurukBaru[0] : null;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [resWisata, resPenginapan, resKuliner] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisata/get_all`),
          axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/penginapan/get_all`),
          axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/kuliner/get_all`),
        ]);
        setWisata(resWisata.data.data);
        setPenginapan(resPenginapan.data.data);
        setKuliner(resKuliner.data.data);
      } catch (err) {
        console.error("Gagal fetch semua data:", err);
      }
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
        },
        (error) => {
          console.error("Error mendapatkan lokasi pengguna:", error);
          alert(
            "Gagal mendapatkan lokasi Anda. Pastikan izin lokasi telah diberikan."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      alert("Geolocation tidak didukung oleh browser ini.");
    }
  }, []);

  function getTodayDate() {
    // Menggunakan moment() agar sesuai dengan zona waktu lokal (WIB/WITA/WIT)
    return moment().format("YYYY-MM-DD");
  }

  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  function getNextFiveDates() {
    const dates = [];
    for (let i = 0; i < 6; i++) {
      // Menggunakan moment() untuk menambahkan hari dengan aman
      dates.push(moment().add(i, "days").format("YYYY-MM-DD"));
    }
    return dates;
  }

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d * 1000;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const getMarkerByKategori = (kategori) => {
    switch (kategori.toLowerCase()) {
      case "alam": return Marker_Wisata1;
      case "buatan": return Marker_Wisata2;
      case "religi": return Marker_Wisata3;
      case "senibudaya": return Marker_Wisata4;
      default: return Marker_Wisata1;
    }
  };

  useEffect(() => {
    const fetchKecamatan = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_API_URL}/api/kecamatan/get_all?tanggal=${selectedDate}`
        );
        const data = response.data.data;

        let isBadWeather = false;
        let tanggalBurukSet = new Set();
        data.forEach((item) => {
          if (Array.isArray(item.hci_history)) {
            item.hci_history.forEach((h) => {
              const kategori = h.hci_kategori;
              if (
                [
                  "Tidak Baik",
                  "Sangat Tidak Baik",
                  "Sangat Ekstrem",
                  "Tidak Memungkinkan",
                ].includes(kategori)
              ) {
                isBadWeather = true;
                tanggalBurukSet.add(h.tanggal.split("T")[0]);
              }
            });
          }
        });
        setCuacaBuruk(isBadWeather);
        setTanggalCuacaBuruk([...tanggalBurukSet]);

        const allFeatures = data.flatMap((item) => {
          const geojson = item.geojson;
          if (!geojson || !geojson.features) return [];

          let hci = null;
          if (Array.isArray(item.hci_history)) {
            hci = item.hci_history.find((h) => {
              const tanggalData = new Date(h.tanggal)
                .toISOString()
                .split("T")[0];
              return tanggalData === selectedDate;
            });
          }

          // PERBAIKAN: Menambahkan data detail cuaca ke properti GeoJSON
          return geojson.features.map((feature) => ({
            ...feature,
            properties: {
              ...feature.properties,
              nama: item.nama_kecamatan,
              hci: hci ? hci.hci_score : null,
              kategori: hci ? hci.hci_kategori : "Tidak Ada Data",
              temp: hci ? hci.temp : null,
              wind: hci ? hci.wind : null,
              pressure: hci ? hci.pressure : null,
              humidity: hci ? hci.humidity : null,
              visibility: hci ? hci.visibility : null,
            },
          }));
        });

        const geojson = {
          type: "FeatureCollection",
          features: allFeatures,
        };

        setGeoData(geojson);
        setGeoJsonKey(Date.now());
      } catch (err) {
        console.error("Gagal fetch data kecamatan:", err);
      }
    };

    if (selectedDate) {
      fetchKecamatan();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!userPosition || !selectedDestination) {
      setRouteGeoJson(null);
      setRouteInfo(null);
      return;
    }

    const fetchRoute = async () => {
      const [userLat, userLng] = userPosition;
      const [destLat, destLng] = selectedDestination;
      const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${destLng},${destLat}?geometries=geojson`;

      try {
        const response = await axios.get(url, { withCredentials: false });
        if (response.data && response.data.routes && response.data.routes.length > 0) {
          const routeData = response.data.routes[0];
          setRouteGeoJson(routeData.geometry);
          setRouteInfo({
            distance: routeData.distance,
            duration: routeData.duration,
          });
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
  }, [userPosition, selectedDestination]);

  useEffect(() => {
    if (userPosition && selectedDestination) {
      const [userLat, userLng] = userPosition;
      const [destLat, destLng] = selectedDestination;
      const distanceToDest = getDistanceFromLatLonInKm(userLat, userLng, destLat, destLng);

      if (distanceToDest < 50) {
        alert("🎉 Anda telah sampai di lokasi tujuan!");
        handleClearRoute();
      }
    }
  }, [userPosition, selectedDestination]);

  const toggleFilter = () => setShowFilter(!showFilter);

  const getColorByHCI = (kategori) => {
    switch (kategori) {
      case "Ideal": return "#218838";
      case "Sangat Baik": return "#28a745";
      case "Baik": return "#8BC34A";
      case "Cukup Baik": return "#f1c40f";
      case "Ditoleransi": return "#f39c12";
      case "Batas Kondisi Ditoleransi (Umum)": return "#e67e22";
      case "Tidak Baik": return "#e74c3c";
      case "Sangat Tidak Baik": return "#c0392b";
      case "Sangat Ekstrem": return "#8e44ad";
      case "Tidak Memungkinkan": return "#34495e";
      default: return "#bdc3c7";
    }
  };

  const getDeskripsiByKategori = (kategori) => {
    switch (kategori) {
      case "Ideal": return "Kondisi iklim sempurna. Sangat ideal untuk semua jenis aktivitas wisata di luar ruangan.";
      case "Sangat Baik": return "Kondisi sangat nyaman untuk berwisata. Hampir sempurna dan sangat direkomendasikan.";
      case "Baik": return "Kondisi iklim yang menyenangkan untuk berlibur, nyaman untuk sebagian besar aktivitas.";
      case "Cukup Baik": return "Kondisi iklim dapat diterima, meskipun beberapa faktor cuaca mungkin tidak terasa optimal.";
      case "Ditoleransi": return "Kondisi masih bisa ditoleransi, namun faktor seperti panas atau kelembaban mulai terasa mengganggu.";
      case "Batas Kondisi Ditoleransi (Umum)": return "Kondisi iklim berada di batas toleransi umum, kurang nyaman untuk kegiatan yang lama di luar ruangan.";
      case "Tidak Baik": return "Kondisi iklim tidak baik dan tidak mendukung kenyamanan wisata. Rencana kegiatan luar ruangan mungkin perlu disesuaikan.";
      case "Sangat Tidak Baik": return "Kondisi sangat tidak nyaman. Potensi cuaca (panas, hujan, angin) yang mengganggu rencana wisata sangat tinggi.";
      case "Sangat Ekstrem": return "Kondisi iklim sangat ekstrem dan berisiko. Kegiatan di luar ruangan harus dihindari.";
      case "Tidak Memungkinkan": return "Mustahil untuk melakukan kegiatan wisata di luar ruangan karena kondisi cuaca yang berat.";
      default: return "Informasi kategori tidak tersedia.";
    }
  };

  const handleFindRoute = (destinationCoords) => {
    if (!userPosition) {
      alert("Gagal mendapatkan lokasi Anda. Pastikan GPS/Lokasi diizinkan.");
      return;
    }
    const map = document.querySelector(".leaflet-container");
    if (map) map.click();
    setSelectedDestination(destinationCoords);
  };

  const getIconByHCIString = (kategori) => {
    const basePath = "/assets/img/weather/";
    const getFileName = (kat) => {
      switch (kat) {
        case "Ideal": return "clear-day.svg";
        case "Sangat Baik": return "partly-cloudy-day.svg";
        case "Baik": return "cloudy.svg";
        case "Cukup Baik": return "overcast-day.svg";
        case "Ditoleransi": return "partly-cloudy-day-rain.svg";
        case "Batas Kondisi Ditoleransi (Umum)": return "rain.svg";
        case "Tidak Baik": return "thunderstorms-day.svg";
        case "Sangat Tidak Baik": return "thunderstorms-day-rain.svg";
        case "Sangat Ekstrem": return "hurricane.svg";
        case "Tidak Memungkinkan": return "not-available.svg";
        default: return "not-available.svg";
      }
    };
    return `<img src="${basePath}${getFileName(kategori)}" class="cuaca-weather-icon" alt="${kategori}" />`;
  };

  // PERBAIKAN: Menggunakan Class CSS terpisah dari pemetaan.css
  const onEachFeature = (feature, layer) => {
    const { nama, hci, kategori, temp, wind, pressure, humidity, visibility } = feature.properties || {};
    const color = getColorByHCI(kategori);
    const deskripsi = getDeskripsiByKategori(kategori);

    layer.setStyle({
      color: "white",
      weight: 0.5,
      fillOpacity: 0.4,
      fillColor: color,
    });

    if (nama && hci && kategori) {
      const displayTemp = temp ? Math.round(temp) : "-";
      const displayWind = wind !== null ? wind : "-";
      const displayPressure = pressure !== null ? pressure : "-";
      const displayHumidity = humidity !== null ? humidity : "-";
      const displayVisibility = visibility !== null ? (visibility / 1000).toFixed(1) : "-";
      const formatTanggal = new Date(selectedDate).toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

      const popupContent = `
        <div class="cuaca-popup-container">
          <h3 class="cuaca-popup-title">
            Kec. ${nama}
          </h3>
          <p class="cuaca-popup-date">
            ${formatTanggal}
          </p>

          <div class="cuaca-main-info">
            <div class="cuaca-icon-wrapper">
                 ${getIconByHCIString(kategori)}
            </div>
            <span class="cuaca-temp">
              ${displayTemp}°C
            </span>
          </div>

          <div class="cuaca-hci-desc">
            Status: ${kategori}
          </div>

          <hr class="cuaca-divider" />

          <div class="cuaca-metrics-grid">
            <div class="cuaca-metric-item">
              <i class="fas fa-wind cuaca-metric-icon"></i>
              <span>${displayWind} km/h</span>
            </div>
            <div class="cuaca-metric-item">
              <i class="fas fa-tachometer-alt cuaca-metric-icon"></i>
              <span>${displayPressure} hPa</span>
            </div>
            <div class="cuaca-metric-item">
              <i class="fas fa-tint cuaca-metric-icon"></i>
              <span>${displayHumidity}%</span>
            </div>
            <div class="cuaca-metric-item">
              <i class="fas fa-eye cuaca-metric-icon"></i>
              <span>${displayVisibility} km</span>
            </div>
          </div>

          <div class="cuaca-footer-desc">
            <strong>Keterangan:</strong> ${deskripsi}
          </div>
        </div>
      `;

      layer.bindPopup(popupContent);
    }
  };

  const handleClearRoute = () => {
    setRouteGeoJson(null);
    setSelectedDestination(null);
    setRouteInfo(null);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0 menit';
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      return `${hours} jam ${remainingMins} mnt`;
    }
    return `${minutes} menit`;
  };

  const formatDistance = (meters) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  useEffect(() => {
    if (globalSearchTerm.trim() === "") {
      setGlobalSearchResults([]);
      return;
    }

    const allData = [
      ...wisata.map(item => ({ ...item, type: "Wisata", label: item.kategori })),
      ...penginapan.map(item => ({ ...item, type: "Penginapan", label: item.kategori_penginapan })),
      ...kuliner.map(item => ({ ...item, type: "Kuliner", label: "Kuliner" }))
    ];

    const results = allData.filter(item => 
      item.nama.toLowerCase().includes(globalSearchTerm.toLowerCase())
    );

    setGlobalSearchResults(results.slice(0, 10));
  }, [globalSearchTerm, wisata, penginapan, kuliner]);

  const handleGlobalSearchSelect = (lat, lng, nama) => {
    setFocusCoords([lat, lng]);
    setGlobalSearchTerm(nama);
    setGlobalSearchResults([]);
  };

  return (
    <div className="map-container">
      <div className="global-search-container">
        <input 
          type="text" 
          className="global-search-input"
          placeholder="Cari lokasi (Wisata, Kuliner, Penginapan)..."
          value={globalSearchTerm}
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
        />
        {globalSearchResults.length > 0 && (
          <ul className="global-search-results">
            {globalSearchResults.map((item, index) => (
              <li 
                key={index} 
                onClick={() => handleGlobalSearchSelect(item.latitude, item.longitude, item.nama)}
              >
                <span className="result-name">{item.nama}</span>
                <span className="result-type">{item.type} • {item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button className="toggle-filter-btn" onClick={toggleFilter}>
        {showFilter ? "Tutup Filter" : "🔍 Filter"}
      </button>

      <button
        className="back-button-map"
        onClick={() => { window.location.href = "/"; }}
      >
        Kembali ke Dashboard
      </button>

      {routeGeoJson && (
        <button className="clear-route-btn" onClick={handleClearRoute}>
          ✕ Hapus Rute
        </button>
      )}

      <div className={`search-filter-wrapper ${showFilter ? "show" : "hide"}`}>
        <p className="search-title">Cari tempat tujuan anda</p>
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Cari destinasi wisata, kuliner, atau penginapan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <div className="tanggal-filter-container">
            <p className="filter-title">Filter HCI per tanggal</p>
            <div className="tanggal-button-group">
              {getNextFiveDates().map((date, index) => (
                <button
                  key={index}
                  className={`tanggal-button ${selectedDate === date ? "active" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {new Date(date).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </button>
              ))}
            </div>
          </div>

          <p className="filter-title">Filter destinasi wisata</p>
          <select
            className="filter-select"
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            <option value="buatan">Buatan</option>
            <option value="alam">Alam</option>
            <option value="religi">Religi</option>
            <option value="senibudaya">Seni Budaya</option>
          </select>
        </div>
      </div>

      <MapContainer
        center={[-7.6323, 111.6486]}
        zoom={11}
        style={{ height: "100vh", width: "100%" }}
      >
        {wisata
          .filter(
            (item) =>
              item.nama.toLowerCase().includes(searchTerm.toLowerCase()) &&
              (!selectedKategori || item.kategori.toLowerCase() === selectedKategori.toLowerCase())
          )
          .map((item, index) => (
            <Marker
              key={`wisata-${index}`}
              position={[item.latitude, item.longitude]}
              icon={L.icon({
                iconUrl: getMarkerByKategori(item.kategori),
                iconSize: [35, 35],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
              })}
            >
              <Popup className="wisata-popup">
                <div className="wisata-popup-card">
                  <img src={item.imageUrl} alt={item.nama_destinasi} className="wisata-popup-image" />
                  <div className="wisata-popup-content">
                    <p className="wisata-popup-kategori" style={{ marginBottom: "-10px" }}>{item.kategori}</p>
                    <p className="wisata-popup-title" style={{ marginBottom: "-10px" }}>{item.nama}</p>
                    <p className="wisata-popup-alamat">{item.alamat}</p>
                    <div className="popup-link">
                      <Link to={`/wisata/${item.id}`} className="wisata-popup-detail-btn">Lihat Detail</Link>
                      <button
                        className="wisata-popup-route-btn"
                        onClick={() => handleFindRoute([item.latitude, item.longitude])}
                      >
                        Cari Rute
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {penginapan
          .filter((item) => item.nama.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((item, index) => (
            <Marker
              key={`penginapan-${index}`}
              position={[item.latitude, item.longitude]}
              icon={L.icon({
                iconUrl: Marker_Penginapan,
                iconSize: [35, 35],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
              })}
            >
              <Popup className="penginapan-popup">
                <div className="penginapan-popup-card">
                  <img src={item.imageUrl} alt={item.nama} className="penginapan-popup-image" />
                  <div className="penginapan-popup-content">
                    <p className="penginapan-popup-kategori" style={{ marginBottom: "9px" }}>{item.kategori_penginapan}</p>
                    <h4 className="penginapan-popup-title" style={{ marginBottom: "-6px" }}>{item.nama}</h4>
                    <p className="penginapan-popup-alamat">{item.alamat}</p>
                    <div className="popup-link">
                      <Link to={`/penginapan/${item.id}`} className="penginapan-popup-detail-btn">Lihat Detail</Link>
                      <button
                        className="wisata-popup-route-btn"
                        onClick={() => handleFindRoute([item.latitude, item.longitude])}
                      >
                        Cari Rute
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {kuliner
          .filter((item) => item.nama.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((item, index) => (
            <Marker
              key={`kuliner-${index}`}
              position={[item.latitude, item.longitude]}
              icon={L.icon({
                iconUrl: Marker_Kuliner,
                iconSize: [35, 35],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
              })}
            >
              <Popup className="kuliner-popup">
                <div className="kuliner-popup-card">
                  <img src={item.imageUrl} alt={item.nama} className="kuliner-popup-image" />
                  <div className="kuliner-popup-content">
                    <p className="kuliner-popup-status" style={{ marginBottom: "9px" }}>Sedang {item.status_buka}</p>
                    <h4 className="kuliner-popup-title" style={{ marginBottom: "-10px" }}>{item.nama}</h4>
                    <p className="kuliner-popup-alamat">{item.alamat}</p>
                    <div className="popup-link">
                      <Link to={`/kuliner/${item.id}`} className="kuliner-popup-detail-btn">Lihat Detail</Link>
                      <button
                        className="wisata-popup-route-btn"
                        onClick={() => handleFindRoute([item.latitude, item.longitude])}
                      >
                        Cari Rute
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {geoData && (
          <GeoJSON
            key={geoJsonKey}
            data={geoData}
            onEachFeature={onEachFeature}
            style={(feature) => {
              const kategori = feature.properties?.kategori || "Lainnya";
              return {
                fillColor: getColorByHCI(kategori),
                color: "white",
                weight: 0.5,
                fillOpacity: 0.4,
              };
            }}
          />
        )}

        {userPosition && (
          <Marker position={userPosition} icon={userLocationIcon}>
            <Popup>Lokasi Anda Saat Ini</Popup>
          </Marker>
        )}

        {routeGeoJson && (
          <GeoJSON
            key={JSON.stringify(routeGeoJson)}
            data={routeGeoJson}
            style={{
              color: "#3388ff",
              weight: 6,
              opacity: 0.7,
            }}
          />
        )}

        <MapEvents
          userPosition={userPosition}
          selectedDestination={selectedDestination}
          routeGeoJson={routeGeoJson}
          focusCoords={focusCoords}
        />

        {cuacaBurukTerbaru && (
          <div className="alert-cuaca-buruk">
            ⚠️ Prediksi cuaca buruk terdeteksi. Pertimbangkan untuk menyesuaikan rencana wisata Anda.
          </div>
        )}

        {routeInfo && routeGeoJson && (
          <div className="route-info-panel">
            <div className="route-info-item">
              <span className="route-label">Estimasi Waktu</span>
              <span className="route-value">{formatDuration(routeInfo.duration)}</span>
            </div>
            <div className="route-separator">|</div>
            <div className="route-info-item">
              <span className="route-label">Jarak Tempuh</span>
              <span className="route-value">{formatDistance(routeInfo.distance)}</span>
            </div>
          </div>
        )}
      </MapContainer>

      {!showLegend && (
        <button className="legend-toggle-button" onClick={() => setShowLegend(true)}>
          Lihat Informasi Peta
        </button>
      )}

      {showLegend && (
        <div className="legend-container">
          <button className="legend-close-button" onClick={() => setShowLegend(false)}>✕</button>
          <div className="legend-marker">
            <h4>Legenda Marker</h4>
            <div><img src={Marker_Penginapan} alt="Penginapan" className="legend-icon" /> Penginapan</div>
            <div><img src={Marker_Kuliner} alt="Kuliner" className="legend-icon" /> Kuliner</div>
            <div><img src={Marker_Desa} alt="Desa Wisata" className="legend-icon" /> Desa Wisata</div>
            <div><img src={Marker_Wisata1} alt="Alam" className="legend-icon" /> Wisata Alam</div>
            <div><img src={Marker_Wisata2} alt="Buatan" className="legend-icon" /> Wisata Buatan</div>
            <div><img src={Marker_Wisata3} alt="Religi" className="legend-icon" /> Wisata Religi</div>
            <div><img src={Marker_Wisata4} alt="Seni Budaya" className="legend-icon" /> Wisata Seni Budaya</div>
          </div>

          <div className="legend-hci">
            <div className="legend-header">
              <h4>Kategori HCI</h4>
              <button className="info-button" onClick={() => setShowInfo(true)}>?</button>
            </div>
            <div><span style={{ background: "#218838" }}></span> Ideal</div>
            <div><span style={{ background: "#28a745" }}></span> Sangat Baik</div>
            <div><span style={{ background: "#8BC34A" }}></span> Baik</div>
            <div><span style={{ background: "#f1c40f" }}></span> Cukup Baik</div>
            <div><span style={{ background: "#f39c12" }}></span> Ditoleransi</div>
            <div><span style={{ background: "#e67e22" }}></span> Batas Kondisi Ditoleransi (Umum)</div>
            <div><span style={{ background: "#e74c3c" }}></span> Tidak Baik</div>
            <div><span style={{ background: "#c0392b" }}></span> Sangat Tidak Baik</div>
            <div><span style={{ background: "#8e44ad" }}></span> Sangat Ekstrem</div>
            <div><span style={{ background: "#34495e" }}></span> Tidak Memungkinkan</div>
          </div>
        </div>
      )}

      {showInfo && (
        <div className="info-modal">
          <div className="info-content">
            <h4><strong>Apa itu Holiday Climate Index (HCI)?</strong></h4>
            <p><strong>HCI (Holiday Climate Index)</strong> adalah sebuah skor yang mengukur tingkat kenyamanan iklim suatu lokasi untuk kegiatan pariwisata. Skor ini dihitung berdasarkan kombinasi parameter cuaca seperti suhu, curah hujan, tutupan awan, dan kecepatan angin.</p>
            <h4>Keterangan Kategori:</h4>
            <ul className="hci-info-list">
              <li><span style={{ background: "#218838" }}></span> <strong>Ideal:</strong> Kondisi iklim sempurna untuk semua jenis aktivitas wisata.</li>
              <li><span style={{ background: "#28a745" }}></span> <strong>Sangat Baik:</strong> Kondisi sangat nyaman dan ideal untuk berwisata.</li>
              <li><span style={{ background: "#8BC34A" }}></span> <strong>Baik:</strong> Kondisi iklim yang menyenangkan untuk berlibur.</li>
              <li><span style={{ background: "#f1c40f" }}></span> <strong>Cukup Baik:</strong> Kondisi dapat diterima, walau beberapa faktor iklim mungkin tidak optimal.</li>
              <li><span style={{ background: "#f39c12" }}></span> <strong>Ditoleransi:</strong> Kondisi masih bisa ditoleransi, namun faktor seperti panas atau kelembaban mulai terasa mengganggu.</li>
              <li><span style={{ background: "#e67e22" }}></span> <strong>Batas Kondisi Ditoleransi (Umum):</strong> Di batas toleransi umum, kurang nyaman untuk aktivitas lama di luar ruangan.</li>
              <li><span style={{ background: "#e74c3c" }}></span> <strong>Tidak Baik:</strong> Kondisi tidak baik dan tidak mendukung kenyamanan wisata.</li>
              <li><span style={{ background: "#c0392b" }}></span> <strong>Sangat Tidak Baik:</strong> Kondisi sangat tidak nyaman, berpotensi tinggi mengganggu rencana wisata.</li>
              <li><span style={{ background: "#8e44ad" }}></span> <strong>Sangat Ekstrem:</strong> Kondisi iklim sangat ekstrem dan berisiko, kegiatan di luar ruangan harus dihindari.</li>
              <li><span style={{ background: "#34495e" }}></span> <strong>Tidak Memungkinkan:</strong> Mustahil untuk melakukan wisata di luar ruangan karena kondisi cuaca yang berat.</li>
            </ul>
            <p><em>*Klik pada salah satu wilayah di peta untuk melihat detail HCI harian.</em></p>
            <button className="tutup-button-main" onClick={() => setShowInfo(false)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pemetaan;