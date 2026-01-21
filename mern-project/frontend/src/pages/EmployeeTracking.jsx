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
  const adminMarkersRef = useRef({});
  const firstFixRef = useRef(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const { name } = useParams();

let userRole = "employee";
let employeeName = "";

try {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    userRole = user?.role || "employee";

    // 🔥 Only set employeeName if NOT admin
    if (userRole !== "admin") {
      // ✅ Priority: URL param > localStorage user name > "Employee"
      employeeName = name || user?.name || "Employee";
    }
  }
} catch {
    // Silently ignore parsing errors
  }

// 🔥 DEBUG: Check if employee name is being set
console.log("🔍 EmployeeTracking Debug:", { userRole, employeeName, urlName: name });


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
     EMPLOYEE LIVE LOCATION
  ====================== */

useEffect(() => {
  if (isAdmin || !mapRef.current) return;

  let lastSent = 0;

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;

      // ✅ Always update location (DO NOT BLOCK)
      setLat(latitude);
      setLng(longitude);

      // ✅ Center map ONLY first time
      if (!firstFixRef.current) {
        mapRef.current.setView([latitude, longitude], 16);
        firstFixRef.current = true;
      }

      // ✅ Single marker + employee popup
      if (!employeeMarkerRef.current) {
        employeeMarkerRef.current = L.marker(
          [latitude, longitude],
          { icon: markerIcon }
        )
          .addTo(mapRef.current)
          .bindPopup(`👤 ${selectedEmployee}`)
          .openPopup();
      } else {
        employeeMarkerRef.current.setLatLng([latitude, longitude]);
      }

      // 🔥 Send live location to backend (every 5 sec)
      const now = Date.now();
      if (now - lastSent > 5000) {
        lastSent = now;

        axios.post(
          "https://zugo-backend-trph.onrender.com/api/visits/live-location",
          {
            employeeName: selectedEmployee,
            lat: latitude,
            lng: longitude,
            accuracy, // store but DON'T block
          }
        );
      }
    },
    (err) => {
      console.error("Geo error:", err);
      alert("Location permission denied / unavailable");
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000,
    }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, [isAdmin, selectedEmployee]);


  /* ======================
     ADMIN – VIEW EMPLOYEES
  ====================== */
  useEffect(() => {
    if (!isAdmin || !mapRef.current) return;

    const interval = setInterval(async () => {
      const res = await axios.get(
        "https://zugo-backend-trph.onrender.com/api/visits/live-locations"
      );

      res.data.forEach((emp) => {
        // ✅ Use employeeName as the key (it now contains the name)
        const empKey = emp.employeeName || emp._id || "Unknown";
        
        if (!adminMarkersRef.current[empKey]) {
          adminMarkersRef.current[empKey] = L.marker(
            [emp.lat, emp.lng],
            { icon: markerIcon }
          )
            .addTo(mapRef.current)
            .bindPopup(`👤 ${empKey}`);
        } else {
          adminMarkersRef.current[empKey].setLatLng([emp.lat, emp.lng]);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [isAdmin]);


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
          {camError && <div className="error-message">{camError}</div>}
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
