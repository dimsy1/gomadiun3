import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Footer from '../components/Footer';
import { Chart, registerables } from 'chart.js';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

const Dashboard = ({ name, role }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const chartInstances = useRef({});

  const [dataCharts, setDataCharts] = useState({
    desaWisata: { labels: [], data: [], max: 0 },
    wisata: { labels: [], data: [], max: 0 },
    penginapan: { labels: [], data: [], max: 0 },
    kuliner: { labels: [], data: [], max: 0 },
  });

  const getData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/admin/dashboard`, { withCredentials: true });
      if (response.data) {
        setDataCharts({
          desaWisata: {
            labels: response.data.data_desawisata.map(i => i.nama_desaWisata),
            data: response.data.data_desawisata.map(i => i.total_pengunjung),
            max: response.data.data_desawisata_terbanyak + 5
          },
          wisata: {
            labels: response.data.data_wisata.map(i => i.nama_destinasi),
            data: response.data.data_wisata.map(i => i.total_pengunjung_destinasi),
            max: response.data.data_wisata_terbanyak + 10
          },
          penginapan: {
            labels: response.data.data_penginapan.map(i => i.nama_penginapan),
            data: response.data.data_penginapan.map(i => i.total_pengunjung_penginapan),
            max: response.data.data_penginapan_terbanyak + 10
          },
          kuliner: {
            labels: response.data.data_kuliner.map(i => i.nama_kuliner),
            data: response.data.data_kuliner.map(i => i.total_pengunjung_kuliner),
            max: response.data.data_kuliner_terbanyak + 10
          }
        });
      }
      setLoading(false);
    } catch (err) {
      if (err.response?.status === 401) navigate('/');
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
    return () => Object.values(chartInstances.current).forEach(c => c.destroy());
  }, []);

  const renderChart = (id, key, labels, data, color, max) => {
    const canvas = document.getElementById(id);
    if (!canvas || labels.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (chartInstances.current[key]) chartInstances.current[key].destroy();

    chartInstances.current[key] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: color,
          borderRadius: 12,
          barThickness: 25
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, max: max || 10, ticks: { stepSize: 1 }, grid: { color: '#f0f0f0' } },
          x: { grid: { display: false } }
        }
      }
    });
  };

  useEffect(() => {
    if (!loading) {
      renderChart('ch-desa', 'desa', dataCharts.desaWisata.labels, dataCharts.desaWisata.data, '#4B49AC', dataCharts.desaWisata.max);
      renderChart('ch-wisata', 'wisata', dataCharts.wisata.labels, dataCharts.wisata.data, '#7DA0FA', dataCharts.wisata.max);
      renderChart('ch-hotel', 'hotel', dataCharts.penginapan.labels, dataCharts.penginapan.data, '#F09397', dataCharts.penginapan.max);
      renderChart('ch-food', 'food', dataCharts.kuliner.labels, dataCharts.kuliner.data, '#FFC100', dataCharts.kuliner.max);
    }
  }, [loading, dataCharts]);

  const shouldShow = (type) => {
    const map = {
      admin: ['desaWisata', 'wisata', 'penginapan', 'kuliner'],
      dinas: ['desaWisata', 'wisata', 'penginapan', 'kuliner'],
      'admin pengelola': ['desaWisata', 'wisata'],
      'user pengelola': ['wisata'],
      'admin industri': ['desaWisata', 'penginapan', 'kuliner'],
      'user industri': ['penginapan', 'kuliner'],
    };
    return map[role]?.includes(type);
  };

  const displayRole = {
    admin: 'Super Admin', dinas: 'Dinas', 'admin pengelola': 'Admin Pengelola',
    'user pengelola': 'User Pengelola', 'admin industri': 'Admin Industri', 'user industri': 'User Industri'
  }[role] || 'User';

  return (
    <div className="main-panel">
      <div className="content-wrapper" style={{ background: '#f8f9fe', minHeight: '100vh' }}>
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: '20px', background: 'linear-gradient(90deg, #4B49AC, #7DA0FA)' }}>
              <div className="card-body p-4 text-white d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="font-weight-bold mb-1">Hallo, {name}</h2>
                  <p className="opacity-75 mb-0">Hak Akses: <strong>{displayRole}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {[
            { id: 'desaWisata', canvas: 'ch-desa', title: 'Data Desa Wisata', key: 'desaWisata' },
            { id: 'wisata', canvas: 'ch-wisata', title: 'Data Destinasi Wisata', key: 'wisata' },
            { id: 'penginapan', canvas: 'ch-hotel', title: 'Data Penginapan', key: 'penginapan' },
            { id: 'kuliner', canvas: 'ch-food', title: 'Data Kuliner', key: 'kuliner' }
          ].map((chart) => (
            shouldShow(chart.id) && (
              <div className="col-md-6 grid-margin stretch-card" key={chart.id}>
                <div className="card shadow-sm border-0" style={{ borderRadius: '20px' }}>
                  <div className="card-body p-4">
                    <h5 className="font-weight-bold mb-4">{chart.icon} {chart.title}</h5>
                    <div style={{ height: '280px', position: 'relative' }}>
                      {dataCharts[chart.key].labels.length === 0 ? (
                        <div className="d-flex align-items-center justify-content-center h-100 bg-light rounded" style={{border: '1px dashed #ccc'}}>
                          <p className="text-muted">Tidak ada data transaksi</p>
                        </div>
                      ) : <canvas id={chart.canvas}></canvas>}
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;