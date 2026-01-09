
import React from 'react';

function Informasi({
    isOpen,
    isClose,
    closeModal,
}) {

    return (

        <div className={`modal ${isOpen ? 'open' : ''}`}>
            <div className={`modal-content ${isClose ? 'animasiDown' : 'animasiUp'}`}>
                <div className='cover-close'>
                    <span className='text-bold text-size-14'>Informasi</span>
                    <span className="close" onClick={closeModal}>&times;</span>
                </div>
                <div className="modal-body">
                    <div className="detail-item mt-0">
                        <div className='ml-3'>
                            <p>Mohon maaf untuk fitur ini masih tahap pengembangan</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Informasi;
