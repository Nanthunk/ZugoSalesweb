import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import UserMenu from "../components/UserMenu";

const ViewActivity = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // fetch sales member details
    axios.get(`http://localhost:5000/api/sales/${id}`)
      .then(res => setMember(res.data))
      .catch(() => alert("Error fetching member"));

    // fetch activity logs
    axios.get(`http://localhost:5000/api/activity/employee/${id}`)
      .then(res => setLogs(res.data))
      .catch(() => console.log("No logs found"));
  }, [id]);

  return (
    <div className="view-activity-container">
      <UserMenu />

      {member ? (
        <>
          <h2>{member.name} — Activity Log</h2>
          <p>Role: {member.role}</p>

          <div className="logs-list">
            {logs.length === 0 ? (
              <p>No activity found</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="log-item">
                  <span>{log.month} / {log.year}</span>
                  <span>Booked: {log.clients}</span>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ViewActivity;
