import React, { useState } from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/js/not_found.json'
import AddtoCart from '../../../modal/addtocart';

function HeaderDetail({ 
    Detailkuliner, 
    kategori, 
    menuData, 
    id_destinasi,
    showAlert,
    messageAlert,
    nameAlert,
    statusLogin,
    openModal,
    openModalInfo
}) {
    const [activeTab, setActiveTab] = useState(kategori[0].nama_kategori_menu);
    const [open, setOpen] = useState(false);
    const [close, setClose] = useState(false);
    const [id_detail, setId] = useState();
    const [img_detail, setImg] = useState();
    const [harga_detail, setHarga] = useState();
    const [nama_detail, setNama] = useState();


    const handleOpenModal = (id, harga, nama, img) => {
        setId(id);
        setHarga(harga);
        setImg(img);
        setNama(nama);
        setOpen(true);
        setClose(false);
    };

    const handleCloseModal = () => {
        setClose(true);
        setTimeout(() => {
            setOpen(false);
        }, 180);
    };

    const openCity = (nama_kategori_menu) => {
        setActiveTab(nama_kategori_menu);
    };

    const getDataByCategory = (nama_kategori_menu) => {
        return menuData.filter(item => item.nama_kategori_menu === nama_kategori_menu);
    };

    return (
        <div>
            <div className="cover-kuliner">
                <div>
                    {Detailkuliner.map((item, index) => {
                        return (
                            <div key={index}>
                                <div className='d-flex flex-row'>
                                    <span className='mx-4 text-bold text-size-18' style={{ color: "#313131" }}>Pilihan Menu di {item.nama}</span>
                                </div>

                                <div className="category-menu-container">
                                    {kategori.map((item) => (
                                        <button
                                        key={item.nama_kategori_menu}
                                        className={`category-menu-button ${activeTab === item.nama_kategori_menu ? 'active' : ''}`}
                                        onClick={() => openCity(item.nama_kategori_menu)}
                                        >
                                        {item.nama_kategori_menu}
                                        </button>
                                    ))}
                                    </div>
                                    
                                {kategori.map((item, index) => {
                                    return (
                                        <div
                                            key={item.nama_kategori_menu}
                                            className="w3-container city"
                                            style={{ display: activeTab === item.nama_kategori_menu ? 'flex' : 'none', flexWrap: 'wrap' }}
                                        >
                                            {getDataByCategory(item.nama_kategori_menu).length === 0 ? (
                                                <div className='w-100 d-flex py-5 flex-column align-item-center'>
                                                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                                                        <Lottie
                                                            animationData={animationData}
                                                            loop={true}
                                                            autoplay={true}
                                                        />
                                                    </div>
                                                    <p className='text-default text-size-14 text-bold'>Menu belum tersedia</p>
                                                </div>
                                            ) : (
                                                <>
                                                  <div className="menu-card-container">
                                                    {getDataByCategory(item.nama_kategori_menu).map((data, index) => (
                                                        <div className="menu-card-horizontal" key={index}>
                                                        <div className="menu-image-horizontal">
                                                            <img src={data.img} alt={data.nama} />
                                                        </div>
                                                        <div className="menu-details">
                                                            <h3>{data.nama}</h3>
                                                            <p>{Number(data.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                                                        </div>
                                                        <button className="cart-button-horizontal" onClick={() => handleOpenModal(data.id, data.harga, data.nama, data.img)}>
                                                            <i className="fa-solid fa-cart-shopping"></i>
                                                        </button>
                                                        </div>
                                                    ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )
                    })}
                </div>
            </div>

            {id_detail && nama_detail && harga_detail && img_detail ? (
                <AddtoCart 
                existPesanan={true} 
                id_destinasi={id_destinasi} 
                id_menu={id_detail} 
                isOpen={open} 
                isClose={close} 
                closeModal={handleCloseModal} 
                nama={nama_detail} 
                img={img_detail} 
                harga={harga_detail}
                showAlert={showAlert}
                messageAlert={messageAlert}
                nameAlert={nameAlert}
                statusLogin={statusLogin}
                openModal={openModal}
                openModalInfo={openModalInfo}
                />
            ) : (
                <></>
            )}
        </div>
    );
};

export default HeaderDetail;
