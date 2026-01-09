import React from 'react';
import Lottie from 'lottie-react';
import animationData from './assets/js/qWj5USLVdu.json';

function ComingSoon() {
    return (
        <section>
            <div className='bg-dark' style={{height: '5rem'}}></div>
            <div className='d-flex flex-column justify-content-center align-item-center' style={{height: '70vh'}}>
                <div style={{height: 300, width: 300}}>
                <Lottie
                    animationData={animationData}
                    loop={true}
                    autoplay={true}
                />
                </div>
                <span>Mohon maaf halaman sedang proses pengembangan</span>
            </div>
        </section>
    );
}

export default ComingSoon;
