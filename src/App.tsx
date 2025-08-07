import { useEffect, useState } from 'react'
import companyLogo from './assets/logo.png'
import CorporateVehicleForm from './CorporateVehicleForm';
import PersonalVehicleForm from './PersonalVehicleForm';

type Page = "home" | "corporate" | "personal"

function App() {
  const [message, setMessage] = useState<string | undefined>();
  const [page, setPage] = useState<Page>("home");
  const [controlData, setControlData] = useState();
  const [controlDataLoading, setControlDataLoading] = useState(true);

  const handleFormBack = (message?: string) => {
    setMessage(message);
    setPage('home');
  }

  useEffect(() => {
    const fetchControlData = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_GOOGLE_APPS_SCRIPT_ENDPOINT);
        const json = await response.json();
        setControlData(json);
      } catch (error) {
        console.error("Error fetching control data:", error);
      } finally {
        setControlDataLoading(false);
      }
    };

    fetchControlData();
  }, []);

  return <div className='container-sm'>
    {page === "home" && (
      <div className="d-flex flex-column justify-content-between align-items-center vh-100">
        <div className="d-grid w-100 mt-3">
          {message && <div className="alert alert-primary" role="alert">
            {message}
          </div>}
        </div>
        <div className="d-flex flex-column justify-content-between align-items-center vh-100">
          <div className="d-flex justify-content-center align-items-center flex-grow-1 flex-column">
            <img src={companyLogo} style={{ maxWidth: "150px" }} alt="Company Logo" />
            <h1 className="mt-3 text-center">Vehicle Log Submission</h1>
            <h2>미국법인 차계부</h2>
            <div className="d-grid gap-2 w-100 my-4">
              <button type="button" className="btn btn-primary" onClick={() => setPage("corporate")}>
                New Corporate Submission
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setPage("personal")}>
                New Personal Submission
              </button>
            </div>
          </div>


        </div>
      </div>

    )}

    {page === "corporate" && (
      <CorporateVehicleForm onBack={handleFormBack} controlDataLoading={controlDataLoading} controlData={controlData} />
    )}

    {page === "personal" && (
      <PersonalVehicleForm onBack={handleFormBack} controlDataLoading={controlDataLoading} controlData={controlData} />
    )}
  </div>
}

export default App
