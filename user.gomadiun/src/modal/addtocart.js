
import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function AddtoCart({
    isOpen,
    isClose,
    closeModal,
    nama,
    img,
    harga,
    id_menu,
    id_destinasi,
    existPesanan,
    showAlert,
    messageAlert,
    nameAlert,
    statusLogin,
    openModal,
    openModalInfo
}) {
    const [jumlah, setJumlah] = useState(1);
    const [date, setDate] = useState('');

    const add = (e) => {
        setJumlah(jumlah + 1);
    }

    const min = (e) => {
        if (jumlah > 1) {
            setJumlah(jumlah - 1);
        }
    }

    useEffect(() => {
        setJumlah(1);
        setDate('');
    }, [closeModal])

    const AddKeranjang = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/add/menu`, {
                id_menu: id_menu,
                id_destinasi: id_destinasi,
                jumlah: jumlah,
                date: date
            });

            if (response) {
                closeModal();
                // openModalInfo()
                messageAlert(response.data.message);
                nameAlert('Success')
                showAlert();
            }
        } catch (error) {
            if (error.response.status === 422) {
                closeModal();
                messageAlert(error.response.data.message);
                nameAlert('Warning')
                showAlert();
            } else if (error.response.status === 401) {
                closeModal();
                openModal();
            } else {
                console.log(error);
            }
        }
    }



    const getData = useCallback(async () => {
        try {
            if (statusLogin === "login") {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/keranjang/check?filter[id_destinasi]=${id_destinasi}&filter[nama_destinasi]=tbl_kuliner&filter[id_menu]=${id_menu}`)
                if (response) {
                    setDate(response.data.data[0].tgl_booking)
                    setJumlah(response.data.data[0].detail_pesanan[0].jumlah)
                }
            }
        } catch (error) {
            //   if (error.response.status === 422) {
            console.log(error);
            //   }
        }
    }, [statusLogin, id_destinasi, id_menu])

    useEffect(() => {
        getData();
    }, [getData]);
    
    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        const dateWithTime = moment(selectedDate).set({ hour: 23, minute: 59, second: 0 }).format('YYYY-MM-DD HH:mm:ss');
        setDate(dateWithTime);
    };

    return (

        <div className={`modal ${isOpen ? 'open' : ''}`}>
            <div className={`modal-content ${isClose ? 'animasiDown' : 'animasiUp'}`}>
                <div className='cover-close'>
                    <span className='text-bold text-size-14' style={{ color: "#183A75" }}>Pesan Menu</span>
                    <span className="close" onClick={closeModal}>&times;</span>
                </div>
                <form className='form py-1'>
                    <div className='item-menu'>
                        <div className="cover-img">
                            <img className='rounded-10' src={img} alt={`Slide`} style={{ width: '100%', height: '50%' }} />
                        </div>
                        <div className='text-item-menu'>
                            <span className='text-bold text-size-14' style={{ color: "#183A75" }}>{nama}</span>
                            <span className='text-size-14' style={{ color: "#183A75" }}>{Number(harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</span>
                        </div>
                    </div>
                    <div className='jumlah_add'>
                        <span onClick={min}><i className="fa-solid fa-minus"></i></span>
                        <input className='w-10 border-none align-item-center' style={{ color: "#183A75" }} value={jumlah} onChange={(e) => setJumlah(e.target.value)}></input>
                        <span onClick={add}><i className="fa-solid fa-plus"></i></span>
                    </div>
                    {existPesanan && (
                        <div className='d-flex flex-column my-bottom-1'>
                            <label className='text-bold' style={{ color: "#183A75" }}>Pilih tanggal booking</label>
                            <input value={moment(date).format('YYYY-MM-DD')} className='date-style' type='date' onChange={handleDateChange}></input>
                        </div>
                    )}
                    <span className='button-form' onClick={AddKeranjang}>Masukkan di Keranjang
                    </span>

                </form>
            </div>
        </div>
    );
}

export default AddtoCart;
