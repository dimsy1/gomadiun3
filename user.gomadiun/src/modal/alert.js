import React from 'react';

const Alert = ({ show, onClose, status, message }) => {

    return (
        <div className={`alert ${show ? 'show' : 'hide'} showAlert ${status === "Success" ? 'success' : status === "Warning" ? 'warning' : status === "Info" ? 'info' : status === "Error" ? 'error' : ''}`}>
            {status === "Success" && (
                <span className="fa-solid fa-circle-check"></span>
            )}
            {status === "Warning" && (
                <span className="fas fa-exclamation-circle"></span>
            )}
            {status === "Error" && (
                <span className="fas fa-exclamation-circle error"></span>
            )}
            {status === "Info" && (
                <span className="fa-solid fa-circle-info"></span>
            )}
            <span className="msg">{status}: {message}</span>
            <div className="close-btn" onClick={onClose}>
                <span className="fas fa-times"></span>
            </div>
        </div>
    );
};

export default Alert;
