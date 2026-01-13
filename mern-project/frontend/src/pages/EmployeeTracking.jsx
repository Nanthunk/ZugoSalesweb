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
  const accuracyCircleRef = useRef(null);

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
     INIT MAP (ONLY ONCE)
  ====================== */
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map("map").setView([11.0168, 76.9558], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(mapRef.current);
  }, []);

  /* ======================
     EMPLOYEE LIVE LOCATION
  ====================== */
  useEffect(() => {
    if (isAdmin || !mapRef.current) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        setLat(latitude);
        setLng(longitude);

        const latlng = [latitude, longitude];

        // ✅ CREATE MARKER ONCE
        if (!employeeMarkerRef.current) {
          employeeMarkerRef.current = L.marker(latlng, {
            icon: markerIcon,
          })
            .addTo(mapRef.current)
            .bindPopup(`<strong>${selectedEmployee}</strong>`)
            .openPopup();

          // Accuracy circle
          accuracyCircleRef.current = L.circle(latlng, {
            radius: accuracy,
            color: "#4f46e5",
            fillColor: "#6366f1",
            fillOpacity: 0.15,
          }).addTo(mapRef.current);
        } else {
          // MOVE MARKER (NO DUPLICATES)
          employeeMarkerRef.current.setLatLng(latlng);

          accuracyCircleRef.current.setLatLng(latlng);
          accuracyCircleRef.current.setRadius(accuracy);
        }

        // Smooth move
        mapRef.current.panTo(latlng, { animate: true });
      },
      (err) => console.error("Geo error:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isAdmin, selectedEmployee]);

  /* ======================
     ADMIN – TRACK EMPLOYEES
  ====================== */
  useEffect(() => {
    if (!isAdmin || !mapRef.current) return;

    const markers = {};

    const interval = setInterval(async () => {
      const res = await axios.get(
        "https://zugo-backend-trph.onrender.com/api/visits/live-locations"
      );

      res.data.forEach((emp) => {
        const latlng = [emp.lat, emp.lng];

        if (!markers[emp.employeeName]) {
          markers[emp.employeeName] = L.marker(latlng, {
            icon: markerIcon,
          })
            .addTo(mapRef.current)
            .bindPopup(`<strong>${emp.employeeName}</strong>`);
        } else {
          markers[emp.employeeName].setLatLng(latlng);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAdmin]);

  /* ======================
     CAMERA SECTION
     ❌ NOT TOUCHED ❌
  ====================== */
  // (Your existing camera code remains EXACTLY SAME)

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
