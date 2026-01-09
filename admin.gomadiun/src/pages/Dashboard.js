import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';
import { Chart, registerables } from 'chart.js';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

const Dashboard = ({ name, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [maxDesaWisata, setMaxDesaWisata] = useState(0);
  const [dataDesaWisata, setDataDesaWisata] = useState([]);
  const [labelDesaWisata, setLabelDesaWisata] = useState([]);
  const [maxWisata, setMaxWisata] = useState(false);
  const [dataWisata, setDataWisata] = useState([]);
  const [labelWisata, setLabelWisata] = useState([]);
  const [maxPenginapan, setMaxPenginapan] = useState(false);
  const [dataPenginapan, setDataPenginapan] = useState([]);
  const [labelPenginapan, setLabelPenginapan] = useState([]);
  const [maxKuliner, setMaxKuliner] = useState(false);
  const [dataKuliner, setDataKuliner] = useState([]);
  const [labelKuliner, setLabelKuliner] = useState([]);
  

  const getData = async () => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_BACKEND_API_URL}/api/admin/dashboard`;
      const response = await axios.get(url);

      if (response) {

        // Desa Wisata
        const maxDesaWisata = response.data.data_desawisata_terbanyak + 5;
        setMaxDesaWisata(maxDesaWisata);

        const desawisatalabel = response.data.data_desawisata.map((item) => item.nama_desaWisata);
        setLabelDesaWisata(desawisatalabel);

        const desawisata = response.data.data_desawisata.map((item) => item.total_pengunjung);
        setDataDesaWisata(desawisata);

        // Wisata
        const maxWisata = response.data.data_wisata_terbanyak + 10;
        setMaxWisata(maxWisata);

        const wisatalabel = response.data.data_wisata.map((item) => item.nama_destinasi);
        setLabelWisata(wisatalabel);

        const wisata = response.data.data_wisata.map((item) => item.total_pengunjung_destinasi);
        setDataWisata(wisata);

        // Penginapan
        const maxPenginapan = response.data.data_penginapan_terbanyak + 10;
        setMaxPenginapan(maxPenginapan);

        const penginapanlabel = response.data.data_penginapan.map((item) => item.nama_penginapan);
        setLabelPenginapan(penginapanlabel);

        const penginapan = response.data.data_penginapan.map((item) => item.total_pengunjung_penginapan);
        setDataPenginapan(penginapan);

        // Kuliner
        const maxKuliner = response.data.data_kuliner_terbanyak + 10;
        setMaxKuliner(maxKuliner);

        const kulinerlabel = response.data.data_kuliner.map((item) => item.nama_kuliner);
        setLabelKuliner(kulinerlabel);

        const kuliner = response.data.data_kuliner.map((item) => item.total_pengunjung_kuliner);
        setDataKuliner(kuliner);

        console.log(response.data);
        setLoading(false);
      }
    } catch (error) {
      if (error.response.status === 401) {
        navigate('/');
        setLoading(false);
      } else {
        console.log(error.response);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const shouldShowChart = (chartType) => {
    const roleChartMapping = {
      admin: ['desaWisata', 'wisata', 'penginapan', 'kuliner'],
      dinas: ['desaWisata', 'wisata', 'penginapan', 'kuliner'],
      'admin pengelola': ['desaWisata', 'wisata'],
      'user pengelola': ['desaWisata', 'wisata'],
      'admin industri': ['desaWisata', 'penginapan', 'kuliner'],
      'user industri': ['desaWisata', 'penginapan', 'kuliner'],
    };
    return roleChartMapping[role]?.includes(chartType);
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Super Admin';
      case 'dinas':
        return 'Admin Dinas';
      case 'admin pengelola':
        return 'Admin Pengelola';
      case 'user pengelola':
        return 'User Pengelola';
      case 'admin industri':
        return 'Admin Industri';
      case 'user industri':
        return 'User Industri';
      default:
        return 'User';
    }
  };

  const roleDisplayName = getRoleDisplayName(role);

  useEffect(() => {
    if (dataDesaWisata.length === 0 || dataWisata.length === 0 || dataPenginapan.length === 0 || dataKuliner.length === 0) return; // Ensure data is loaded

    // Chart untuk Desa Wisata
    const salesChartCanvas = document.getElementById('sales-chart');
    if (salesChartCanvas) {
      const context = salesChartCanvas.getContext('2d');
      new Chart(context, {
        type: 'bar',
        data: {
          labels: labelDesaWisata,
          datasets: [{
            label: 'Data Pengunjung',
            data: dataDesaWisata,
            backgroundColor: '#4B49AC',
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          layout: { padding: { left: 0, right: 0, top: 20, bottom: 0 } },
          scales: {
            y: {
              display: true,
              grid: { display: true, drawBorder: false, color: "#F2F2F2" },
              ticks: { display: true, min: 0, max: maxDesaWisata || 0, autoSkip: true, maxTicksLimit: 10, color: "#6C7383" },
            },
            x: {
              ticks: { beginAtZero: true, color: "#6C7383" },
              grid: { color: "rgba(0, 0, 0, 0)", display: false },
              barPercentage: 1,
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
              },
            },
          },
        },
      });
    }

    const wisataChartCanvas = document.getElementById('sales-charts');
  if (wisataChartCanvas) {
    const context = wisataChartCanvas.getContext('2d');
    new Chart(context, {
      type: 'bar',
      data: {
        labels: labelWisata,
        datasets: [{
          label: 'Data Pengunjung',
          data: dataWisata,
          backgroundColor: '#98BDFF',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {padding: { left: 0, right: 0, top: 20, bottom: 0 } },
        scales: {
          y: {
            display: true,
            grid: { display: true, drawBorder: false, color: "#F2F2F2" },
            ticks: { display: true, min: 0, max: maxWisata || 0, autoSkip: true, maxTicksLimit: 10, color: "#6C7383", stepSize: 1 },
          },
          x: {
            ticks: { beginAtZero: true, color: "#6C7383" },
            grid: { color: "rgba(0, 0, 0, 0)", display: false },
            barPercentage: 1,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
            },
          },
        },
      },
    });
  }

    // Chart untuk Penginapan
    const penginapanChartCanvas = document.getElementById('penginapan-chart');
  if (penginapanChartCanvas) {
    const context = penginapanChartCanvas.getContext('2d');
    new Chart(context, {
      type: 'bar',
      data: {
        labels: labelPenginapan,
        datasets: [{
          label: 'Data Pengunjung',
          data: dataPenginapan,
          backgroundColor: '#98BDFF',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { left: 0, right: 0, top: 20, bottom: 0 },
        },
        scales: {
          y: {
            display: true,
            grid: { display: true, drawBorder: false, color: "#F2F2F2" },
            ticks: { display: true, min: 0, max: maxPenginapan || 0, autoSkip: true, maxTicksLimit: 10, color: "#6C7383", stepSize: 1},
          },
          x: {
            ticks: { beginAtZero: true, color: "#6C7383" },
            grid: { color: "rgba(0, 0, 0, 0)", display: false },
            barPercentage: 1,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
            },
          },
        },
      },
    });
  }

    // Chart untuk Kuliner
    const kulinerChartCanvas = document.getElementById('kuliner-chart');
  if (kulinerChartCanvas) {
    const context = kulinerChartCanvas.getContext('2d');
    new Chart(context, {
      type: 'bar',
      data: {
        labels: labelKuliner,
        datasets: [{
          label: 'Data Pengunjung',
          data: dataKuliner,
          backgroundColor: '#98BDFF',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        layout: {
          padding: { left: 0, right: 0, top: 20, bottom: 0 },
        },
        scales: {
          y: {
            display: true,
            grid: { display: true, drawBorder: false, color: "#F2F2F2" },
            ticks: { display: true, min: 0, max: maxKuliner || 0, autoSkip: true, maxTicksLimit: 10, color: "#6C7383", stepSize: 1 },
          },
          x: {
            ticks: { beginAtZero: true, color: "#6C7383" },
            grid: { color: "rgba(0, 0, 0, 0)", display: false },
            barPercentage: 1,
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`,
            },
          },
        },
      },
    });
  }
  }, 
  
  [dataDesaWisata, dataWisata, dataPenginapan, dataKuliner, labelDesaWisata, labelWisata, labelPenginapan, labelKuliner, maxDesaWisata, maxWisata, maxPenginapan, maxKuliner]);


  return (
    <div className="main-panel">
      <div className="content-wrapper">
        <div className="row">
          <div className="col-md-12 grid-margin">
            <div className="row">
              <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                <h3 className="font-weight-bold">Welcome, {name}</h3>
                <h6 className="font-weight-normal mb-0">
                  Role : {roleDisplayName}
                </h6>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          {shouldShowChart('desaWisata') && (
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Data Pengunjung Desa Wisata</h4>
                  <canvas id="sales-chart"></canvas>
                </div>
              </div>
            </div>
          )}
          {shouldShowChart('wisata') && (
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Data Pengunjung Wisata</h4>
                  <canvas id="sales-charts"></canvas>
                </div>
              </div>
            </div>
          )}
          {shouldShowChart('penginapan') && (
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Data Pengunjung Penginapan</h4>
                  <canvas id="penginapan-chart"></canvas>
                </div>
              </div>
            </div>
          )}
          {shouldShowChart('kuliner') && (
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Data Pengunjung Tempat Kuliner</h4>
                  <canvas id="kuliner-chart"></canvas>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        <Footer />
    </div>
  );
};

export default Dashboard;
