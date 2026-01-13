import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "../styles/EmployeeTracking.css";
import UserMenu from "../components/UserMenu";

/* ======================
   MARKER ICON
====================== */
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function EmployeeTracking() {
  const mapRef = useRef(null);
  const employeeMarkerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { name } = useParams();

  /* ======================
     ROLE CHECK
  ====================== */
  let userRole = "employee";
  let employeeName = name || "";
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userRole = user?.role || "employee";
      if (!employeeName) employeeName = user?.name || "Employee";
    }
  } catch {}

  const isAdmin = userRole === "admin";

  /* ======================
     STATES
  ====================== */
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [selectedEmployee] = useState(employeeName);
  const [cameraOn, setCameraOn] = useState(false);
  const [image, setImage] = useState(null);
  const [camError, setCamError] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientFeedback, setClientFeedback] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [saving, setSaving] = useState(false);

  /* ======================
     INIT MAP
  ====================== */
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map("map").setView([11.0168, 76.9558], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapRef.current);
  }, []);

  /* ======================
     EMPLOYEE GEOLOCATION
  ====================== */
  useEffect(() => {
    if (isAdmin || !mapRef.current) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        setLat(latitude);
        setLng(longitude);

        if (!employeeMarkerRef.current) {
          employeeMarkerRef.current = L.marker(
            [latitude, longitude],
            { icon: markerIcon }
          )
            .addTo(mapRef.current)
            .bindPopup(`<strong>${selectedEmployee}</strong>`)
            .openPopup();
        } else {
          employeeMarkerRef.current.setLatLng([latitude, longitude]);
        }

        mapRef.current.setView([latitude, longitude], 15);
      },
      (err) => console.error("Geo error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isAdmin, selectedEmployee]);

  /* ======================
     CAMERA FUNCTIONS
  ====================== */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraOn(true);
      setCamError("");
    } catch {
      setCamError("Camera not accessible");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
    setImage(null);
    setClientName("");
    setClientPhone("");
    setClientFeedback("");
    setNextVisit("");
  };

  const capturePhoto = () => {
    if (!lat || !lng) {
      alert("Location not ready. Please wait...");
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.fillText(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`, 10, canvas.height - 45);
    ctx.fillText(`⏰ ${new Date().toLocaleString()}`, 10, canvas.height - 20);

    // 🔥 REDUCED QUALITY (IMPORTANT)
    setImage(canvas.toDataURL("image/jpeg", 0.5));
  };

  /* ======================
     SAVE IMAGE + DETAILS
  ====================== */
  const savePhoto = async () => {
    if (!image) {
      alert("Capture image first");
      return;
    }

    try {
      setSaving(true);

      await axios.post(
        "https://zugo-backend-trph.onrender.com/api/visits",
        {
          employeeName,
          clientName,
          clientPhone,
          clientFeedback,
          nextVisit,
          lat,
          lng,
          imageBase64: image,
        }
      );

      alert("Visit saved successfully ✅");
      stopCamera();
    } catch (err) {
      console.error(err);
      alert("Save failed ❌");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tracking-container">
      <UserMenu />

      <h2>Employee Tracking</h2>
      <div id="map" className="map-container"></div>

      {!isAdmin && (
        <div className="camera-section">
          {!image ? (
            <video ref={videoRef} muted playsInline />
          ) : (
            <div className="preview-section">
              <img src={image} alt="preview" />
              <button onClick={() => setImage(null)}>Delete / Retake</button>
            </div>
          )}

          <div className="controls">
            {!cameraOn && <button onClick={startCamera}>Camera ON</button>}
            {cameraOn && !image && <button onClick={capturePhoto}>Capture</button>}
            {cameraOn && <button onClick={stopCamera}>Camera OFF</button>}

            {image && (
              <>
                <input
                  placeholder="Client Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
                <input
                  placeholder="Client Phone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
                <textarea
                  placeholder="Client Feedback Message"
                  value={clientFeedback}
                  onChange={(e) => setClientFeedback(e.target.value)}
                />
                <input
                  type="date"
                  value={nextVisit}
                  onChange={(e) => setNextVisit(e.target.value)}
                />
                <input value={selectedEmployee} disabled />
                <button onClick={savePhoto} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </>
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      )}
    </div>
  );
}
