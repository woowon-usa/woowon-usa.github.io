import { useEffect, useState } from "react";
import GeolocationWidget from "./GeolocationWidget"
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
}

function CorporateVehicleForm({ onBack }: { onBack: (message?: string) => void }) {
    const getCurrentDateTimeLocal = () => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const local = new Date(now.getTime() - offset * 60000);
        return local.toISOString().slice(0, 16);
    };

    const [formData, setFormData] = useState<FormData>({
        datetime: getCurrentDateTimeLocal(),
        latitude: null,
        longitude: null,
        location_str: null,
        destination: "",
        driver: "",
        vehicle: "",
        mileage: "",
        manualDatetime: false,
        manualLocation: false
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingSubmit, setLoadingSubmit] = useState<boolean>(false);
    const [controlDataSuccess, setControlDataSuccess] = useState<boolean>(false);
    const [drivers, setDrivers] = useState<string[]>([]);
    const [vehicles, setVehicles] = useState<string[]>([]);
    const [destinations, setDestinations] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchControlData = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_ENDPOINT);
                const json = await response.json();
                setDrivers(json['drivers']);
                setVehicles(json['vehicles']);
                setDestinations(json['destinations']);
                setControlDataSuccess(true);
            } catch (error) {
                console.error("Error fetching control data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchControlData();
    }, []);

    useEffect(() => {
        if (!formData.manualDatetime) {
            setFormData({
                ...formData,
                datetime: getCurrentDateTimeLocal()
            });
        }
    }, [formData.manualDatetime])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleLocationGet = (lat: number, lng: number, address: string) => {
        setFormData((prev) => ({
            ...prev,
            'latitude': lat,
            'longitude': lng,
            'location_str': address
        }));
    }

    const canSubmit = (): boolean => {
        return (
            !!formData.datetime &&
            formData.latitude !== null &&
            formData.longitude !== null &&
            formData.destination.trim() !== "" &&
            formData.driver.trim() !== "" &&
            formData.vehicle.trim() !== "" &&
            formData.mileage.trim() !== ""
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

    if (loading) {
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

    if (!controlDataSuccess) {
        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
            <div>Error: failed to fetch data from API.</div>
        </div>
    }

    return <>
        <form>
            <h1 className="my-3">Corporate Vehicle Log</h1>
            <div className="form-group mb-3">
                <label className="d-flex justify-content-between align-items-center">
                    <span>Date and Time</span>
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
            <div className="form-group mb-3">
                <label className="d-flex justify-content-between align-items-center">
                    <span>Start Location</span>
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
                <GeolocationWidget manual={formData.manualLocation} onLocationGet={handleLocationGet} />
            </div>
            <div className="form-group mb-3">
                <label htmlFor="driver">Destination</label>
                <select
                    name="destination"
                    className="form-select"
                    value={formData.destination}
                    onChange={handleChange}
                >
                    <option selected>Select destination</option>
                    {
                        destinations.map((d) => <option value={d}>{d}</option>)
                    }
                </select>
            </div>
            <div className="form-group mb-3">
                <label htmlFor="driver">Driver</label>
                <select
                    name="driver"
                    className="form-select"
                    value={formData.driver}
                    onChange={handleChange}
                >
                    <option selected>Select driver</option>
                    {
                        drivers.map((d) => <option value={d}>{d}</option>)
                    }
                </select>
            </div>
            <div className="form-group mb-3">
                <label htmlFor="vehicle">Vehicle</label>
                <select
                    name="vehicle"
                    className="form-select"
                    value={formData.vehicle}
                    onChange={handleChange}
                >
                    <option selected>Select vehicle</option>
                    {
                        vehicles.map((v) => <option value={v}>{v}</option>)
                    }
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="mileage">Mileage</label>
                <input name="mileage" className="form-control" type="number" value={formData.mileage} onChange={handleChange} placeholder="Type current mileage" />
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
                            Are you sure you want to submit this <b>corporate vehicle log</b>?

                            <table className="table mt-3">
                                <tbody>
                                    <tr>
                                        <td><b>Date/Time</b></td>
                                        <td>{formData.datetime}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Start Location</b></td>
                                        <td>{formData.location_str ? `${formData.location_str} (${formData.latitude}, ${formData.longitude})` : `${formData.latitude}, ${formData.longitude}`}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Destination</b></td>
                                        <td>{formData.destination}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Driver</b></td>
                                        <td>{formData.driver}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Vehicle</b></td>
                                        <td>{formData.vehicle}</td>
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

export default CorporateVehicleForm
