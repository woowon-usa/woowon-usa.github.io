import { useEffect, useState } from "react";
import { useGeolocated } from "react-geolocated";
import axios from "axios";
import ReactGoogleAutocomplete from "react-google-autocomplete";

function GeolocationWidget({ manual, onLocationGet }: { manual: boolean, onLocationGet: (lat: number, lng: number, address: string) => void; }) {
    const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: false,
        },
        userDecisionTimeout: 5000,
        suppressLocationOnMount: true
    });

    const [fetchingAddress, setFetchingAddress] = useState(false);
    const [address, setAddress] = useState("");

    useEffect(() => {
        if (coords) {
            const fetchAddress = async () => {
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`;

                try {
                    setFetchingAddress(true);
                    const response = await axios.get(url, {
                        headers: {
                            'Accept': 'application/json',
                        }
                    });
                    if (response.data && response.data.display_name) {
                        setAddress(response.data.display_name);
                    } else {
                        setAddress("Address not found");
                    }
                } catch (error) {
                    console.error("Error fetching address:", error);
                } finally {
                    setFetchingAddress(false);
                }
            };
            fetchAddress();
        }
    }, [coords]);

    useEffect(() => {
        if(!manual) {
            getPosition();
        }
    }, [manual]);

    useEffect(() => {
        if (coords) {
            onLocationGet(coords.latitude, coords.longitude, address);
        }
    }, [coords, address])

    if (manual) {
        return <div className="form-group w-100">
            <ReactGoogleAutocomplete
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                onPlaceSelected={(place) => {
                    if (!place) return;

                    const address = place.formatted_address || place.name;
                    const lat = place.geometry?.location?.lat();
                    const lng = place.geometry?.location?.lng();
                    if (lat && lng) {
                        onLocationGet(lat, lng, address);
                    }
                }}
                options={{
                    types: ["address"],
                    componentRestrictions: { country: "us" },
                    fields: ["formatted_address", "geometry", "name"],
                }}
                placeholder="Enter address"
                className="form-control"
                style={{ width: "100%" }}
            />
        </div>
    } else {
        return <div className="card">
            <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    {
                        !isGeolocationAvailable ? (
                            <div>Your browser does not support location</div>
                        ) : !isGeolocationEnabled ? (
                            <div>Please enable access to your device's location!</div>
                        ) : fetchingAddress ? (
                            <div className="d-flex align-items-center column-gap-2">
                                <div className="spinner-border me-2 " role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <span>Fetching address...</span>
                            </div>
                        ) : address ? <>
                            <div>{address}</div>
                            <div>({coords!.latitude}, {coords!.longitude})</div>
                        </> : coords ? <>
                            <div>({coords!.latitude}, {coords!.longitude})</div>
                        </> : (
                            <div className="d-flex align-items-center column-gap-2">
                                <div className="spinner-border me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <span>Loading location...</span>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    }
}

export default GeolocationWidget
