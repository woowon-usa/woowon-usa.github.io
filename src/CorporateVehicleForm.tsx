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
        setFormData((prev: FormData) => ({ ...prev, [name]: value }));
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
                { headers: { "
