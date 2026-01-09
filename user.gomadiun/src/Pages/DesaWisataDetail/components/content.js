import { React, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Wisata from './Wisata';
import PaketWisata from './PaketWisata';
import Kuliner from './Kuliner';
import Penginapan from './Penginapan';

import Lottie from 'lottie-react';
import animationData from '../../assets/js/loading.json'
import not_found from '../../assets/js/not_found.json'

function ContentDetailDesaWisata({ nama_desa, id }) {
    const [loadingPaketWisata, setloadingPaketWisata] = useState(true);
    const [loadingWisata, setloadingWisata] = useState(true);
    const [loadingKuliner, setloadingKuliner] = useState(true);
    const [loadingPenginapan, setloadingPenginapan] = useState(true);

    const [DataPaketWisata, setDataPaketWisata] = useState([]);
    const [DataWisata, setDataWisata] = useState([]);
    const [DataKuliner, setDataKuliner] = useState([]);
    const [DataPenginapan, setDataPenginapan] = useState([]);

    const getData = useCallback(async () => {
        setloadingWisata(true)
        setloadingPaketWisata(true)
        setloadingKuliner(true)
        setloadingPenginapan(true)
        try {
            const response_paket_wisata = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/paket_wisata/get_all/${id}`)
            if (response_paket_wisata) {
                setDataPaketWisata(response_paket_wisata.data.data);
                setloadingPaketWisata(false)
            }
        } catch (error) {
            if (error.response.status === 422) {
                setDataPaketWisata(error.response.data.data);
                setloadingPaketWisata(false)
            }
        }


        try {
            const response_wisata = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/wisata/get_all/${id}`)
            if (response_wisata) {
                setDataWisata(response_wisata.data.data);
                setloadingWisata(false)
            }
        } catch (error) {
            if (error.response.status === 422) {
                setDataWisata(error.response.data.data);
                setloadingWisata(false)
            }
        }


        try {
            const response_kuliner = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/kuliner/get_all/${id}`)
            if (response_kuliner) {
                setDataKuliner(response_kuliner.data.data)
                setloadingKuliner(false)

            }
        } catch (error) {
            if (error.response.status === 422) {
                setDataKuliner(error.response.data.data);
                setloadingKuliner(false)
            }
        }

        
        try {
            const response_penginapan = await axios.get(`${process.env.REACT_APP_BACKEND_API_URL}/api/penginapan/get_all/${id}`)
            if (response_penginapan) {
                setDataPenginapan(response_penginapan.data.data)
                setloadingPenginapan(false)
            }
        } catch (error) {
            if (error.response.status === 422) {
                setDataPenginapan(error.response.data.data);
                setloadingPenginapan(false)
            }
        }
    }, [id])

    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <div className='d-flex flex-column w-100'>
            {loadingPaketWisata ? (
                <div>
                    <div className="cover">
                        <div className='d-flex flex-row'>
                            <span className='mx-1 text-bold text-size-14'>Paket Wisata Desa {nama_desa}</span>
                        </div>
                        <div className='w-100 d-flex py-1 flex-column align-item-center'>
                            <div className='d-flex' style={{ height: 200, width: 200 }}>
                                <Lottie
                                    animationData={animationData}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {DataPaketWisata !== null ? (
                        <PaketWisata dataPaketWisata={DataPaketWisata} nama_desa={nama_desa} />
                    ) : (
                        <div>
                            <div className="cover">
                                <div className='d-flex flex-row'>
                                    <span className='mx-1 text-bold text-size-14'>Paket Wisata Desa {nama_desa}</span>
                                </div>
                                <div className='w-100 d-flex py-3 flex-column align-item-center'>
                                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                                        <Lottie
                                            animationData={not_found}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                <p className='text-default text-size-14 text-bold my-bottom-3'>Data paket wisata tidak tersedia</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}


            {loadingWisata ? (
                <div>
                    <div className="cover">
                        <div className='d-flex flex-row'>
                            <span className='mx-1 text-bold text-size-14'>Tempat Wisata Desa {nama_desa}</span>
                        </div>
                        <div className='w-100 d-flex py-1 flex-column align-item-center'>
                            <div className='d-flex' style={{ height: 200, width: 200 }}>
                                <Lottie
                                    animationData={animationData}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {DataWisata !== null ? (
                        <Wisata dataWisata={DataWisata} nama_desa={nama_desa} />
                    ) : (
                        <div>
                            <div className="cover">
                                <div className='d-flex flex-row'>
                                    <span className='mx-1 text-bold text-size-14'>Tempat Wisata {nama_desa}</span>
                                </div>
                                <div className='w-100 d-flex py-3 flex-column align-item-center'>
                                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                                        <Lottie
                                            animationData={not_found}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                <p className='text-default text-size-14 text-bold my-bottom-3'>Data wisata tidak tersedia</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}


            {loadingKuliner ? (
                <div>
                    <div className="cover">
                        <div className='d-flex flex-row'>
                            <span className='mx-1 text-bold text-size-14'>Tempat Kuliner {nama_desa}</span>
                        </div>
                        <div className='w-100 d-flex py-1 flex-column align-item-center'>
                            <div className='d-flex' style={{ height: 200, width: 200 }}>
                                <Lottie
                                    animationData={animationData}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {DataKuliner !== null ? (
                        <Kuliner datakuliner={DataKuliner} nama_desa={nama_desa} />
                    ) : (
                        <div>
                            <div className="cover">
                                <div className='d-flex flex-row'>
                                    <span className='mx-1 text-bold text-size-14'>Tempat Kuliner {nama_desa}</span>
                                </div>
                                <div className='w-100 d-flex py-3 flex-column align-item-center'>
                                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                                        <Lottie
                                            animationData={not_found}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                <p className='text-default text-size-14 text-bold my-bottom-3'>Data kuliner tidak tersedia</p>
                                </div>
                            </div>
                        </div>
                    )}

                </>
            )}


            {loadingPenginapan ? (
                <div>
                    <div className="cover">
                        <div className='d-flex flex-row'>
                            <span className='mx-1 text-bold text-size-14'>Tempat Penginapan {nama_desa}</span>
                        </div>
                        <div className='w-100 d-flex py-1 flex-column align-item-center'>
                            <div className='d-flex' style={{ height: 200, width: 200 }}>
                                <Lottie
                                    animationData={animationData}
                                    loop={true}
                                    autoplay={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>

                    {DataPenginapan !== null ? (
                        <Penginapan dataPenginapan={DataPenginapan} nama_desa={nama_desa} />
                    ) : (
                        <div>
                            <div className="cover">
                                <div className='d-flex flex-row'>
                                    <span className='mx-1 text-bold text-size-14'>Tempat Penginapan {nama_desa}</span>
                                </div>
                                <div className='w-100 d-flex py-3 flex-column align-item-center'>
                                    <div className='d-flex' style={{ height: 200, width: 200 }}>
                                        <Lottie
                                            animationData={not_found}
                                            loop={true}
                                            autoplay={true}
                                        />
                                    </div>
                                <p className='text-default text-size-14 text-bold my-bottom-3'>Data penginapan tidak tersedia</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}


        </div>
    );
}

export default ContentDetailDesaWisata;
