import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Countdown = ({ targetDate, id_pembayaran }) => {
    const calculateTimeLeft = () => {
        const difference = new Date(targetDate) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    useEffect(() => {
        if (Object.keys(timeLeft).length === 0) {
            BatalkanPesanan(id_pembayaran);
        }
    }, [timeLeft, id_pembayaran]);

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval]) {
            return;
        }

        timerComponents.push(
            <span key={interval}>
                {timeLeft[interval]} {interval}{" "}
            </span>
        );
    });

    const formatTime = (value) => {
        return String(value).padStart(2, '0'); // Ensure two digits
    };

    const BatalkanPesanan = useCallback(async (id) => {
        try {
            const keyword = "Waktu pembayaran habis, pesanan dibatalkan oleh sistem";
            
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_API_URL}/api/pesanan/${id}?keterangan=${keyword}`);

            if (response) {
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }, []);

    return (
        <div>
            {timeLeft.days > 0 && <span>{timeLeft.days} days </span>}
            {timeLeft.hours !== undefined && (
                <div className='d-flex justify-content-center text-bold text-size-14'>
                    <span className='mx-3'>{formatTime(timeLeft.hours)}</span>:
                    <span className='mx-3'>{formatTime(timeLeft.minutes)}</span>:
                    <span className='mx-left-1'>{formatTime(timeLeft.seconds)}</span>
                </div>
            )}
            {Object.keys(timeLeft).length === 0 && <span>Waktu pembayaran berakhir</span>}
        </div>
    );
};

export default Countdown;
