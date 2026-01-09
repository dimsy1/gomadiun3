import React from 'react';
import Footer from '../components/Footer';
import QRCodeScanner from '../components/qrScan';

const QrCodePage = () => {

    return (
        <div className="main-panel">
            <div className="content-wrapper">
                <div className="row">
                    <div className="col-lg-12 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <div className='mx-4 my-3 text-size-14'>Scan Barcode</div>
                                <QRCodeScanner/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default QrCodePage;
