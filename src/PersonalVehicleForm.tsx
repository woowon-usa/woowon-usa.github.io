import { useState } from "react";
import GeolocationWidget from "./GeolocationWidget"
import axios from "axios";

interface FormData {
    datetime: string;
    start_latitude: number | null;
    start_longitude: number | null;
    start_location_str: string | null;
    purpose: string;
    driver: string;
    start_mileage: number | undefined;
    end_mileage: number | undefined;
}

function PersonalVehicleForm({ onBack }: { onBack: (message?: string) => void }) {
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - offset * 60000);
        return local.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState<FormData>({
        datetime: getCurrentDateTimeLocal(),
        start_latitude: null,
        start_longitude: null,
        start_location_str: null,
        purpose: '',
        driver: '',
        start_mileage: undefined,
        end_mileage: undefined,
    });
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleStartLocationGet = (lat: number, lng: number, address: string) => {
        setFormData((prev) => ({
            ...prev,
            'start_latitude': lat,
            'start_longitude': lng,
            'start_location_str': address
        }));
    }

    const canSubmit = (): boolean => {
        return (
            !!formData.datetime &&
            formData.start_latitude !== null &&
            formData.start_longitude !== null &&
            formData.purpose.trim() !== "" &&
            formData.driver.trim() !== "" &&
            formData.start_mileage !== undefined &&
            formData.end_mileage !== undefined
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

    return <>
        <form>
            <h1 className="my-3">Personal Vehicle Log</h1>
            <div className="form-group mb-3">
                <label className="d-flex justify-content-between align-items-center">
                    Date and Time
                </label>
                <input
                    className="form-control"
                    type="datetime-local"
                    name='datetime'
                    value={formData.datetime}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group mb-3">
                <label className="d-flex justify-content-between align-items-center">
                    Start Location
                </label>
                <GeolocationWidget manual={true} onLocationGet={handleStartLocationGet} />
            </div>
            <div className="form-group mb-3">
                <label htmlFor="purpose">Purpose</label>
                <textarea className="form-control" name="purpose" placeholder="Customer name and/or business purpose (e.g. meeting, test, site visit, etc.)" rows={3} value={formData.purpose} onChange={handleChange} />
            </div>
            <div className="form-group mb-3">
                <label htmlFor="driver">Driver</label>
                <input name="driver" className="form-control" type="text" value={formData.driver} onChange={handleChange} />
            </div>
            <div className="form-group mb-3">
                <label htmlFor="start_mileage">Start Mileage</label>
                <input name="start_mileage" className="form-control" type="number" value={formData.start_mileage} onChange={handleChange} placeholder="Type start mileage" />
            </div>
            <div className="form-group mb-3">
                <label htmlFor="end_mileage">End Mileage</label>
                <input name="end_mileage" className="form-control" type="number" value={formData.end_mileage} onChange={handleChange} placeholder="Type end mileage" />
            </div>
            <div className="d-grid mt-3 gap-2">
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!canSubmit()}
                    onClick={() => setShowModal(true)}
                >
                    Submit</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => onBack()}>Back</button>
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
                                        <td><b>Start Location</b></td>
                                        <td>{formData.start_location_str ? `${formData.start_location_str} (${formData.start_latitude}, ${formData.start_longitude})` : `${formData.start_latitude}, ${formData.start_longitude}`}</td>
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
                                        <td><b>Start Mileage</b></td>
                                        <td>{formData.start_mileage}</td>
                                    </tr>
                                    <tr>
                                        <td><b>End Mileage</b></td>
                                        <td>{formData.end_mileage}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Mileage Difference</b></td>
                                        <td>{formData.end_mileage! - formData.start_mileage!}</td>
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
