// src/components/QRCodeScanner.js
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/id';

const suppressedWarnings = [
    'Support for defaultProps will be removed from function components'
];
const originalConsoleError = console.error;
console.error = (...args) => {
    if (!suppressedWarnings.some((warning) => args[0].includes(warning))) {
        originalConsoleError(...args);
    }
};


moment.locale('id');

const formatDateStringDay = (dateString) => {
    return moment(dateString).format('dddd, DD MMMM YYYY HH:mm');
};

const QRCodeScanner = () => {
    const [isScanning, setIsScanning] = useState(true);
    const [responseMessage, setResponseMessage] = useState('');
    const [responseMessageStatus, setResponseMessageStatus] = useState('');
    const [responseData, setResponseData] = useState(null);

    const handleScan = async (result) => {
        if (result) {
            setIsScanning(false);

            try {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/checkIn/destinasi/${result.text}`);
                if (response && response.data) {
                    setResponseMessageStatus(response.data.status);
                    setResponseMessage('Check in berhasil!');
                    setResponseData(response.data);
                }
            } catch (error) {
                console.error('Error making API request:', error);
                if (error.response.status === 422) {
                    setResponseMessage(error.response.data.message);
                    setResponseMessageStatus(error.response.data.status);
                    if (error.response.data.data) {
                        setResponseData(error.response.data);
                    }
                } else if (error.request) {
                    setResponseMessage('Error: No response received from server');
                } else {
                    setResponseMessage(error.message);
                }
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setIsScanning(false);
        setResponseMessage('Scanning error: ' + err.message);
    };

    const handleReset = () => {
        setIsScanning(true);
        setResponseMessage('');
        setResponseData(null);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {isScanning && (
                <div className="qr-reader-container my-5">
                    <QrReader
                        onResult={handleScan}
                        onError={handleError}
                        className="qr-reader"
                        constraints={{ facingMode: 'environment' }}
                    />
                    <div className="scanner-box">
                        <div className="scanner-box2"></div>
                        <div className="scanner-shadow"></div>
                        <div className="scanner-line"></div>
                    </div>
                </div>
            )}
            {responseMessage && (
                <div className="scan-result">
                    {responseMessageStatus === 'error' && (
                        <div className="alert alert-danger" role="alert">
                            {responseMessage}
                        </div>
                    )}
                    {responseMessageStatus === 'info' && (
                        <div className="alert alert-info" role="alert">
                            {responseMessage}
                        </div>
                    )}
                    {responseMessageStatus === 'success' && (
                        <div className="alert alert-success" role="alert">
                            {responseMessage}
                        </div>
                    )}
                    {responseData && (
                        <div className="response-details">
                            <h4>Detail Pesanan:</h4>
                            <p><strong>Kode Pesanan:</strong> {responseData.data.kode_pesanan}</p>
                            <p><strong>Total Pesanan:</strong> {Number(responseData.data.total_pesanan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                            <p><strong>Tanggal Pesanan:</strong>  {formatDateStringDay(responseData.data.tgl_pesanan)}</p>
                            <p><strong>Tanggal Check in:</strong> {formatDateStringDay(responseData.data.tgl_pesanan_selesai)}</p>

                            <h4 className='mt-4 font-weight-bold'>Detail Pemesan:</h4>
                            <p><strong>Nama:</strong> {responseData.data.data_wisatawan.name}</p>
                            <p><strong>No HP:</strong> {responseData.data.data_wisatawan.no_hp}</p>
                            <p><strong>Email:</strong> {responseData.data.data_wisatawan.email}</p>

                            <h4 className='mt-4 font-weight-bold'>Detail Pembayaran:</h4>
                            <p><strong>Kode Pembayaran:</strong> {responseData.data.data_pembayaran.kode_pembayaran}</p>
                            <p><strong>Tanggal Pembayaran:</strong> {formatDateStringDay(responseData.data.data_pembayaran.tgl_pembayaran)}</p>
                            {/* <p><strong>Metode Pembayaran:</strong> {responseData.data.data_pembayaran.metode_pembayaran}</p> */}
                            <p><strong>Status Pembayaran:</strong> {responseData.data.data_pembayaran.status_pembayaran}</p>

                            <h4 className='mt-4 font-weight-bold'>Detail Pesanan:</h4>
                            <p><strong>Nama Destinasi:</strong> {responseData.data.nama_destinasi}</p>
                            {responseData.data.detail_pesanan.map((item, index) => (
                                <div key={index} className="detail-item">
                                    <img src={item.sampul_menu} alt={item.nama_menu} style={{ width: '100px' }} />
                                    <div className='ml-3'>
                                        <p><strong>Produk:</strong> {item.nama_menu}</p>
                                        <p><strong>Jumlah:</strong> {item.jumlah}</p>
                                        <p><strong>Harga Satuan:</strong> {Number(item.harga_satuan).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!isScanning && (
                        <button onClick={handleReset}>Scan Again</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default QRCodeScanner;
