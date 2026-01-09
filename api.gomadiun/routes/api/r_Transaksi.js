const router = require('express').Router();

const {
    get_all_keranjang,
    post_newAddTocart_tiket,
    post_newAddTocart_menu,
    remove_cart,
    CheckExistKeranjangPesanan,
    AddPesanan,
    Get_Pesanan_belumBayar,
    Get_Pesanan_Eticket,
    Get_Pesanan_selesai,
    Get_Pesanan_batalkan,
    Post_Pesanan_dibatalkan,
    Post_Pesanan_dibayar,
    trxNotif,
    check_Pesanan_dibayar,
    Post_checkIn_destinasi,
    post_newAddTocart_paketwisata,
    post_newAddTocart_kamar,
    post_newAddTocart_homestay,
    // Add_Pesanan_belumBayar
    // MidtransCallback
    // Post_Pesanan_Pembayaran
    Post_Reopen_Payment

} = require('../../controllers/PesanController')

router.get("/keranjang/get_all/keranjang", get_all_keranjang);
router.post("/keranjang/add/ticket", post_newAddTocart_tiket);
router.post("/keranjang/add/paket_wisata", post_newAddTocart_paketwisata);
router.post("/keranjang/add/kamar", post_newAddTocart_kamar);
router.post("/keranjang/add/homestay", post_newAddTocart_homestay);
router.post("/keranjang/add/menu", post_newAddTocart_menu);
router.delete("/keranjang/remove/:id_detail_pesanan", remove_cart);
router.get("/keranjang/check", CheckExistKeranjangPesanan);

router.post("/pesanan/create", AddPesanan);
router.get("/pesanan/belum_bayar", Get_Pesanan_belumBayar);
router.get("/pesanan/eticket", Get_Pesanan_Eticket);
router.get("/pesanan/selesai", Get_Pesanan_selesai);
router.get("/pesanan/dibatalkan", Get_Pesanan_batalkan);
router.post("/pesanan/:id_pembayaran", Post_Pesanan_dibatalkan);
router.post("/pesanan/bayar/:id_pembayaran", Post_Pesanan_dibayar);
router.post("/pembayaran/notification", trxNotif);
router.get("/pesanan/bayar/:id_pembayaran", check_Pesanan_dibayar);
router.post("/reopen-payment/:id_pembayaran", Post_Reopen_Payment);
// router.post("/pesanan/belum_bayar/create", Add_Pesanan_belumBayar);
// router.post("/pesanan/pembayaran", Post_Pesanan_Pembayaran);
// router.get("/cekstatus/bayar/", cekStatusMidtrans);
router.post("/checkIn/destinasi/:kode_qr", Post_checkIn_destinasi);
router.post('/notification', trxNotif);

module.exports = router;