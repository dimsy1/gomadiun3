import React, { useState, useEffect } from 'react';

function HeaderDetail({ Detailpaketwisata }) {

    return (
        <div>
            <div className="cover">
                <div>
                    {Detailpaketwisata.map((item, index) => {
                        return (
                            <div key={index}>
                                <div className='d-flex flex-row'>
                                    <span className='mx-1 text-bold text-size-14'>Tentang {item.nama}</span>
                                </div>
                                <div>
                                    <p className='px-1 py-3' style={{ whiteSpace: 'pre-wrap' }}>{item.deskripsi}</p>
                                </div>

                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default HeaderDetail;
