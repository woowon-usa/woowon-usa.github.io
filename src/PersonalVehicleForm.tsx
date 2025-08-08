import { useState } from "react";
import axios from "axios";

const getCurrentDateTimeLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
};

interface FormData {
    datetime: string;
    start_latitude: number | null;
    start_longitude: number | null;
    start_location_str: string | null;
    destination: string;
    purpose: string;
    driver: string;
    mileage: number | null;
    manualLocation: boolean;
    manualPurpose: boolean;
    manualDatetime: boolean;
    manualDestination: boolean;
}

const initialData = {
    datetime: getCurrentDateTimeLocal(),
    start_latitude: null,
    start_longitude: null,
    start_location_str: null,
    destination: '',
    purpose: '',
    driver: '',
    mileage: null,
    manualLocation: false,
    manualPurpose: false,
    manualDatetime: false,
    manualDestination: false
};

function PersonalVehicleForm({ onBack, controlData, controlDataLoading }: { onBack: (message?: string) => void, controlData: any, controlDataLoading: boolean }) {
    const [formData, setFormData] = useState<FormData>(initialData);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // const handleStartLocationGet = (lat: number, lng: number, address: string) => {
    //     setFormData((prev) => ({
    //         ...prev,
    //         'start_latitude': lat,
    //         'start_longitude': lng,
    //         'start_location_str': address
    //     }));
    // }

    const canSubmit = (): boolean => {
        return (
            !!formData.datetime &&
            formData.destination.trim() !== "" &&
            formData.purpose.trim() !== "" &&
            formData.driver.trim() !== "" &&
            formData.mileage != null
        );
    };

    const handleConfirmSubmit = async () => {
        try {
            setLoadingSubmit(true);
            const response = await axios.post(
                import.meta.env.VITE_GOOGLE_APPS_SCRIPT_ENDPOINT,
                { ...formData, type: 'personal' },
                {
                    headers: { "Content-Type": "text/plain;charset=utf-8" }
                },
            );

            if (response.data.status === "success") {
                onBack("Sucessfully submitted!")
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
        setFormData(initialData);
    }

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
            <h1 className="my-3">Personal Vehicle Log</h1>
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
                                setFormData((prev) => ({ ...prev, manualDatetime: e.target.checked }))
                            }
                        />
                        <label className="form-check-label" htmlFor="manualDatetime">
                            Manual
                        </label>
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
            {/* <div className="form-group mb-4">
                <label className="d-flex justify-content-between align-items-center">
                    <span><b>Start Location</b></span>
                    <span className="form-check">
                        <input
                            className="form-check-input me-1"
                            type="checkbox"
                            id="manualLocation"
                            checked={formData.manualLocation || false}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, manualLocation: e.target.checked }))
                            }
                        />
                        <label className="form-check-label" htmlFor="manualLocation">
                            Manual
                        </label>
                    </span>
                </label>
                <GeolocationWidget manual={formData.manualLocation} onLocationGet={handleStartLocationGet} />
            </div> */}
            <div className="form-group mb-4">
                <label className="d-flex justify-content-between align-items-center">
                    <span><b><b>Destination</b></b></span>
                    <span className="form-check">
                        <input
                            className="form-check-input me-1"
                            type="checkbox"
                            id="manualDestination"
                            checked={formData.manualDestination || false}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, manualDestination: e.target.checked }))
                            }
                        />
                        <label className="form-check-label" htmlFor="manualDestination">
                            Manual
                        </label>
                    </span>
                </label>
                {formData.manualDestination ? <input className="form-control" name="destination" type="text" placeholder="Enter destination" /> :
                    <select
                        name="destination"
                        className="form-select"
                        value={formData.destination}
                        onChange={handleChange}
                    >
                        <option selected>Select destination</option>
                        {
                            controlData['destinations'].map((d: any) => <option value={d}>{d}</option>)
                        }
                    </select>
                }
            </div>
            <div className="form-group mb-4">
                <label className="d-flex justify-content-between align-items-center">
                    <span><b>Purpose</b></span>
                    <span className="form-check">
                        <input
                            className="form-check-input me-1"
                            type="checkbox"
                            id="manualPurpose"
                            checked={formData.manualPurpose || false}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, manualPurpose: e.target.checked }))
                            }
                        />
                        <label className="form-check-label" htmlFor="manualPurpose">
                            Manual
                        </label>
                    </span>
                </label>
                {formData.manualPurpose ? <input className="form-control" name="purpose" type="text" placeholder="Enter purpose" /> :
                    <select
                        name="purpose"
                        className="form-select"
                        value={formData.purpose}
                        onChange={handleChange}
                    >
                        <option selected>Select purpose</option>
                        {
                            controlData['purpose'].map((v: any) => <option value={v}>{v}</option>)
                        }
                    </select>
                }
            </div>
            <div className="form-group mb-4">
                <label htmlFor="driver"><b>Driver</b></label>
                <input name="driver" className="form-control" type="text" value={formData.driver} onChange={handleChange} />
            </div>
            <div className="form-group mb-4">
                <label htmlFor="mileage"><b>Mileage Usage</b></label>
                <input name="mileage" className="form-control" type="number" value={formData.mileage ?? ''} onChange={handleChange} placeholder="Type mileage usage" />
            </div>
            <div className="d-grid mt-3 gap-2">
                <button
                    type="button"
                    className="btn btn-primary mb-3"
                    disabled={!canSubmit()}
                    onClick={() => setShowModal(true)}
                >
                    Submit</button>
                <button type="button" className="btn btn-outline-secondary mb-3" onClick={() => onBack()}>Back</button>
                <button type="button" className="btn btn-outline-danger" onClick={clearForm}>Clear</button>
            </div>

        </form>

        {showModal && (
            <div
                className="modal fade show"
                style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
            >
                <div className="modal-dialog modal-fullscreen">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Confirm Submission</h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                                disabled={loadingSubmit}
                            ></button>
                        </div>
                        <div className="modal-body">
                            Are you sure you want to submit this <b>personal vehicle log</b>?

                            <table className="table mt-3">
                                <tbody>
                                    <tr>
                                        <td><b>Date/Time</b></td>
                                        <td>{formData.datetime}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Destination</b></td>
                                        <td>{formData.destination}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Purpose</b></td>
                                        <td>{formData.purpose}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Driver</b></td>
                                        <td>{formData.driver}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Mileage</b></td>
                                        <td>{formData.mileage}</td>
                                    </tr>
                                </tbody>
                            </table>
                            {loadingSubmit &&
                                <div className="progress" style={{ height: "20px" }}>
                                    <div
                                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                                        role="progressbar"
                                        style={{ width: "100%" }}
                                    ></div>
                                </div>
                            }

                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                                disabled={loadingSubmit}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleConfirmSubmit}
                                disabled={loadingSubmit}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
}

export default PersonalVehicleForm
