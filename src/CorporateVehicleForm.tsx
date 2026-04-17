import { useEffect, useState } from "react";
import axios from "axios";

interface FormData {
    datetime: string;
    latitude: number | null;
    longitude: number | null;
    location_str: string | null;
    destination: string;
    driver: string;
    vehicle: string;
    mileage: string;
    manualDatetime: boolean;
    manualLocation: boolean;
    manualDestination: boolean;
}

const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

const initialData: FormData = {
    datetime: getCurrentDateTimeLocal(),
    latitude: null,
    longitude: null,
    location_str: null,
    destination: "",
    driver: "",
    vehicle: "",
    mileage: "",
    manualDatetime: false,
    manualLocation: false,
    manualDestination: false
};

function CorporateVehicleForm({ onBack, controlData, controlDataLoading }: { onBack: (message?: string) => void, controlData: any, controlDataLoading: boolean }) {
    const localData = localStorage.getItem("woowon.corporate_form");
    const parsedLocal = localData ? JSON.parse(localData) : null;
    const [formData, setFormData] = useState<FormData>(parsedLocal ? { ...initialData, ...parsedLocal } : initialData);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!formData.manualDatetime) {
            setFormData((prev: FormData) => ({
                ...prev,
                datetime: getCurrentDateTimeLocal()
            }));
        }
    }, [formData.manualDatetime]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: FormData) => ({
            ...prev,
            [name]: value,
        }));
    };

    const canSubmit = (): boolean => {
        return (
            !!formData.datetime &&
            (formData.destination || "").trim() !== "" &&
            (formData.driver || "").trim() !== "" &&
            (formData.vehicle || "").trim() !== "" &&
            (formData.mileage || "").trim() !== ""
        );
    };

    const handleConfirmSubmit = async () => {
        try {
            setLoadingSubmit(true);
            const response = await axios.post(
                import.meta.env.VITE_GOOGLE_APPS_SCRIPT_ENDPOINT,
                { ...formData, type: 'corporate' },
                {
                    headers: { "Content-Type": "text/plain;charset=utf-8" }
                },
            );

            if (response.data.status === "success") {
                onBack("Successfully submitted!");
                localStorage.setItem('woowon.corporate_form', JSON.stringify(formData));
            } else {
                alert("Error submitting form: " + response.data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to submit form. Check console for details.");
        } finally {
            setLoadingSubmit(false);
            setShowModal(false);
        }
    };

    const clearForm = () => {
        localStorage.removeItem('woowon.corporate_form');
        setFormData(initialData);
    };

    if (controlDataLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                <div className="d-flex flex-column align-items-center">
                    <div className="spinner-border mb-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>Fetching latest data...</div>
                </div>
            </div>
        );
    }

    return <>
        <form>
            <h1 className="my-3">Corporate Vehicle Log</h1>
            <div className="form-group mb-4">
                <label className="d-flex justify-content-between align-items-center">
                    <b>Date and Time</b>
                    <span className="form-check">
                        <input
                            className="form-check-input me-1"
                            type="checkbox"
                            id="manualDatetime"
                            checked={formData.manualDatetime || false}
                            onChange={(e) =>
                                setFormData((prev: FormData) => ({ ...prev, manualDatetime: e.target.checked }))
                            }
                        />
                        <label className="form-check-label" htmlFor="manualDatetime">Manual</label>
                    </span>
                </label>
                <input
                    className="form-control"
                    type="datetime-local"
                    name='datetime'
                    value={formData.datetime}
                    onChange={handleChange}
                    disabled={!formData.manualDatetime}
                />
            </div>
            <div className="form-group mb-4">
                <label className="d-flex justify-content-between align-items-center">
                    <span><b>Destination (목적지)</b></span>
                    <span className="form-check">
                        <input
                            className="form-check-input me-1"
                            type="checkbox"
                            id="manualDestination"
                            checked={formData.manualDestination || false}
                            onChange={(e) =>
                                setFormData((prev: FormData) => ({ ...prev, manualDestination: e.target.checked }))
                            }
                        />
                        <label className="form-check-label" htmlFor="manualDestination">Manual</label>
                    </span>
                </label>
                {formData.manualDestination ?
                    <input className="form-control" name="destination" type="text" placeholder="Enter destination" value={formData.destination} onChange={handleChange} /> :
                    <select name="destination" className="form-select" value={formData.destination} onChange={handleChange}>
                        <option value="">Select destination</option>
                        {controlData['destinations'].map((d: any) => <option key={d} value={d}>{d}</option>)}
                    </select>
                }
            </div>
            <div className="form-group mb-4">
                <label htmlFor="driver"><b>Driver (운전자)</b></label>
                <div className="form-text">
                    <small>
                        If your name is not listed below, you must not drive. <br />
                        리스트에 본인의 이름이 없으면 운전할수 없습니다.
                    </small>
                </div>
                <select name="driver" className="form-select" value={formData.driver} onChange={handleChange}>
                    <option value="">Select driver</option>
                    {controlData['drivers'].map((d: any) => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="form-group mb-4">
                <label htmlFor="vehicle"><b>Vehicle (차량)</b></label>
                <select name="vehicle" className="form-select" value={formData.vehicle} onChange={handleChange}>
                    <option value="">Select vehicle</option>
                    {controlData['vehicles'].map((v: any) => <option key={v} value={v}>{v}</option>)}
                </select>
            </
