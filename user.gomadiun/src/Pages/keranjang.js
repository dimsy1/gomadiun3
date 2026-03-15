import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import animationData from "./assets/js/cart_empty.json";
import loadingAnimation from "./assets/js/loading.json";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import useSnap from "./hooks/useSnap";
import Alert from "./../modal/alert"; // pastikan path benar

function KeranjangPage({ showAlert, messageAlert, nameAlert }) {
  const [DataKeranjang, setDataKeranjang] = useState([]);
  const [loading, setLoading] = useState(false);
  const [OpenSnap, setOpenSnap] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { snapEmbed } = useSnap();

  // 🧠 Konfigurasi axios global agar cookie dikirim otomatis
  axios.defaults.withCredentials = true;

  // ✅ Fungsi ambil data keranjang
const getData = useCallback(async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/get_all/keranjang?userId=${userId}`,
        {
          withCredentials: true,
        }
      );
      if (response?.data?.success) {
        setDataKeranjang(response.data.data);
      } else {
        setDataKeranjang([]);
        setMessage(response.data.message || "Keranjang kosong");
      }
    } catch (error) {
      console.error("⚠️ getData Error:", error);
      if (error.response?.status === 401) {
        messageAlert("Sesi login telah berakhir, silakan login ulang.");
        nameAlert("Error");
        showAlert();
        navigate("/");
      } else if (error.response?.status === 422) {
        setDataKeranjang([]);
        setMessage(error.response.data.message || "Keranjang masih kosong");
      } else {
        setMessage("Gagal memuat data keranjang.");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, messageAlert, nameAlert, showAlert]);

  useEffect(() => {
    getData();
  }, [getData]);

  // ✅ Hapus item dari keranjang
  const RemoveKeranjang = async (id) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/remove/${id}`,
        { withCredentials: true }
      );
      getData();
    } catch (error) {
      console.error("RemoveKeranjang error:", error);
    }
  };

  // ✅ Buat pesanan
  const BuatPesanan = async () => {
    setLoading(true);
    try {
      const dataId = DataKeranjang.flatMap((item) =>
        item.list_keranjang.map((inner) => inner.id_pesanan)
      );

      const dataTotalPembayaran = DataKeranjang.flatMap((item) =>
        item.detail_transaksi.map((inner) => inner.total_pembayaran)
      ).reduce((acc, curr) => acc + curr, 0);

      if (!dataId.length) {
        nameAlert("Error");
        messageAlert("Tidak ada pesanan dalam keranjang!");
        showAlert();
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_API_URL}/api/pesanan/create`,
        { dataId, dataTotalPembayaran },
        { withCredentials: true }
      );

      if (response?.data?.success) {
        nameAlert("Success");
        messageAlert("Pesanan berhasil dibuat!");
        showAlert();
        navigate("/pesananku");
      } else {
        nameAlert("Error");
        messageAlert(response?.data?.message || "Gagal membuat pesanan");
        showAlert();
      }
    } catch (error) {
      console.error("BuatPesanan Error:", error);
      nameAlert("Error");
      messageAlert("Gagal membuat pesanan, coba lagi!");
      showAlert();
    } finally {
      setLoading(false);
    }
  };

  const Navigate = (href) => navigate(href);
  const formatDate = (dateString) => moment(dateString).format("YYYY-MM-DD");

  return (
    <section>
      <div className="desawisata-header"></div>
      <h2
        className="text-center my-top-3"
        style={{ color: "#313131", fontFamily: "Poppins", fontWeight: "600" }}
      >
        Keranjang Anda
      </h2>

      {loading ? (
        <div
          className="d-flex flex-column justify-content-center align-item-center w-100 my-top-3"
          style={{ height: "50vh" }}
        >
          <div className="d-flex" style={{ height: 200, width: 200 }}>
            <Lottie animationData={loadingAnimation} loop autoplay />
          </div>
        </div>
      ) : DataKeranjang.length === 0 ? (
        <div
          className="d-flex flex-column justify-content-center align-item-center w-100"
          style={{ height: "60vh" }}
        >
          <div style={{ height: 200, width: 200 }}>
            <Lottie animationData={animationData} loop autoplay />
          </div>
          <p className="text-default text-size-14 text-bold my-top-2">
            {message}
          </p>
          <span
            onClick={() => Navigate("/")}
            className="button-form w-25"
            style={{ backgroundColor: "#06647B" }}
          >
            Mulai cari destinasimu!
          </span>
        </div>
      ) : (
        DataKeranjang.map((data, i) => (
          <div className="cover-keranjang" key={i}>
            <div className="cover-items-keranjang">
              {data.list_keranjang.map((item, j) => (
                <div className="card-keranjang" key={j}>
                  <div className="d-flex justify-content-beetwen my-bottom-1">
                    <div className="d-flex flex-column">
                      <span
                        className="text-size-14 text-bold"
                        style={{ color: "#313131" }}
                      >
                        {item.nama_destinasi}
                      </span>
                      <span
                        className="text-size-12"
                        style={{ color: "#616161" }}
                      >
                        Tgl Booking: {formatDate(item.tgl_booking)}
                      </span>
                    </div>
                    <div className="d-flex flex-column">
                      <span
                        className="text-size-12"
                        style={{ color: "#616161" }}
                      >
                        Total pesanan:
                      </span>
                      <span
                        className="text-size-14 text-bold"
                        style={{ color: "#313131" }}
                      >
                        {Number(item.total_pesanan).toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </span>
                    </div>
                  </div>

                  {item.detail_pesanan.map((detail, k) => (
                    <div className="item-card" key={k}>
                      <div className="cover-img">
                        <img src={detail.sampul_menu} alt="foto" />
                      </div>
                      <div className="text-child">
                        <h4>{detail.nama_menu}</h4>
                        <p>Jumlah : {detail.jumlah}</p>
                        <p>
                          Harga satuan :{" "}
                          {Number(detail.harga_satuan).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </p>
                        <button
                          className="btn-list"
                          onClick={() =>
                            RemoveKeranjang(detail.id_detail_pesanan)
                          }
                        >
                          <i className="fa fa-trash"></i>
                          <span> Batalkan pesanan</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {data.detail_transaksi.map((trx, l) => (
              <div className="card-pembayaran" key={l}>
                {!OpenSnap ? (
                  <>
                    <h4 style={{ fontWeight: "600" }}>Rincian Pembayaran</h4>
                    <div className="detail-pembayaran">
                      <div className="d-flex justify-content-beetwen">
                        <span>Subtotal pemesanan</span>
                        <span>
                          {Number(trx.total_pemesanan).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })}
                        </span>
                      </div>
                    </div>
                    <div
                      className="d-flex justify-content-beetwen text-bold"
                      style={{ color: "#F0A44F" }}
                    >
                      <span>Total pembayaran</span>
                      <span>
                        {Number(trx.total_pembayaran).toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                      </span>
                    </div>
                    <button
                      className="button-form my-top-1 my-bottom-1"
                      style={{ backgroundColor: "#06647B" }}
                      onClick={BuatPesanan}
                    >
                      Buat pesanan
                    </button>
                  </>
                ) : (
                  <div className="d-flex justify-content-center w-100">
                    <div id="snap-container"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </section>
  );
}

export default KeranjangPage;
