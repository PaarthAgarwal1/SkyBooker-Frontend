import React from 'react';

interface Props {
    formData: any;
    setFormData: any;
    onSubmit: (e: React.FormEvent) => void;
}

const AirlineForm: React.FC<Props> = ({ formData, setFormData, onSubmit }) => {
    return (
        <form onSubmit={onSubmit} className="space-y-4">

            <input
                type="text"
                placeholder="Airline Name"
                required
                value={formData.airlineName}
                onChange={(e) =>
                    setFormData({ ...formData, airlineName: e.target.value })
                }
                className="w-full border p-2 rounded"
            />

            <input
                type="text"
                placeholder="IATA Code"
                required
                value={formData.iataCode}
                onChange={(e) =>
                    setFormData({ ...formData, iataCode: e.target.value.toUpperCase() })
                }
                className="w-full border p-2 rounded"
            />

            <input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                }
                className="w-full border p-2 rounded"
            />

            <input
                type="url"
                placeholder="Logo URL"
                value={formData.logoUrl}
                onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                }
                className="w-full border p-2 rounded"
            />

            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded"
            >
                Submit
            </button>
        </form>
    );
};

export default AirlineForm;