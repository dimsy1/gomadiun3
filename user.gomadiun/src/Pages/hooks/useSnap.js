import { useEffect, useState } from "react";

const useSnap = () => {
    const [snap, setSnap] = useState(null);

    useEffect(() => {
        const myMidtransClientKey = process.env.REACT_APP_MY_MIDTRANS_CLIENT_KEY;
        const scriptId = "midtrans-script";
        
        // Cek apakah script sudah ada agar tidak double load
        let script = document.getElementById(scriptId);

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://app.sandbox.midtrans.com/snap/snap.js"; // Ganti ke production URL jika sudah live
            script.setAttribute('data-client-key', myMidtransClientKey);
            script.onload = () => {
                setSnap(window.snap);
            };
            document.body.appendChild(script);
        } else {
            // Jika script sudah ada, langsung set snap
            setSnap(window.snap);
        }

        return () => {
            // Opsional: Biasanya script midtrans dibiarkan saja, 
            // tapi jika ingin cleanup bisa uncomment baris di bawah:
            // const scriptToRemove = document.getElementById(scriptId);
            // if (scriptToRemove) document.body.removeChild(scriptToRemove);
        }
    }, []);

    // Fungsi untuk Popup (Standard)
    const snapPay = (snap_token, action) => {
        if (snap) {
            snap.pay(snap_token, {
                onSuccess: function (result) {
                    console.log("Payment Success:", result);
                    action.onSuccess(result); // Pass result agar bisa dibaca di component
                },
                onPending: function (result) {
                    console.log("Payment Pending:", result);
                    action.onPending(result);
                },
                onError: function (result) {
                    console.log("Payment Error:", result);
                    action.onError ? action.onError(result) : alert("Pembayaran Gagal");
                },
                onClose: function () {
                    console.log("Customer closed the popup");
                    action.onClose();
                }
            });
        }
    };

    // Fungsi untuk Embed (Jika Anda ingin menanam tampilan pembayaran di dalam div)
    const snapEmbed = (snap_token, embedId, action) => {
        if (snap) {
            snap.embed(snap_token, {
                embedId,
                onSuccess: function (result) {
                    action.onSuccess(result);
                },
                onPending: function (result) {
                    action.onPending(result);
                },
                onError: function (result) {
                    action.onError ? action.onError(result) : alert("Pembayaran Gagal");
                },
                onClose: function () {
                    action.onClose();
                }
            });
        }
    };

    return { snapPay, snapEmbed };
}

export default useSnap;