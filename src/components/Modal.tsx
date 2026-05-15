import React from 'react';

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <button onClick={onClose} className="text-gray-500">✕</button>
                </div>

                {/* Body */}
                <div className="mt-4">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;