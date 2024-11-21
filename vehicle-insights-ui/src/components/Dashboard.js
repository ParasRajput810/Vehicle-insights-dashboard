import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "./Dashboard.css";
import Image1 from "../assets/ss2.PNG";
import Image2 from "../assets/ss3.PNG";
import Image3 from "../assets/ss4.PNG";
import Video from "../assets/WhatsApp Video 2024-10-23 at 11.55.02 AM (1).mp4";
import Image12 from "../assets/Group 4530.png";
import Image11 from "../assets/Tx Pad for Animation_2 1.png";

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  arrows: true,
};

const Joystick = ({ onMove }) => {
  const joystickRef = useRef(null);
  const buttonRef = useRef(null);

  const [isMoving, setIsMoving] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const joystick = joystickRef.current;

    const mouseDownHandler = (e) => {
      setIsMoving(true);
      updatePosition(e);
    };

    const mouseMoveHandler = (e) => {
      if (isMoving) {
        updatePosition(e);
      }
    };

    const mouseUpHandler = () => {
      setIsMoving(false);
      setPosition({ x: 0, y: 0 });
    };

    joystick.addEventListener("mousedown", mouseDownHandler);
    joystick.addEventListener("mousemove", mouseMoveHandler);
    joystick.addEventListener("mouseup", mouseUpHandler);
    joystick.addEventListener("mouseleave", mouseUpHandler);

    return () => {
      joystick.removeEventListener("mousedown", mouseDownHandler);
      joystick.removeEventListener("mousemove", mouseMoveHandler);
      joystick.removeEventListener("mouseup", mouseUpHandler);
      joystick.removeEventListener("mouseleave", mouseUpHandler);
    };
  }, [isMoving]);

  const updatePosition = (e) => {
    const joystick = joystickRef.current.getBoundingClientRect();
    const mouseX = e.clientX - joystick.left;
    const mouseY = e.clientY - joystick.top;

    const centerX = joystick.width / 2;
    const centerY = joystick.height / 2;

    const distX = mouseX - centerX;
    const distY = mouseY - centerY;

    const maxDistance = joystick.width / 2 - buttonRef.current.offsetWidth / 2;

    const distance = Math.min(Math.sqrt(distX * distX + distY * distY), maxDistance);

    const angle = Math.atan2(distY, distX);

    const finalX = distance * Math.cos(angle);
    const finalY = distance * Math.sin(angle);

    setPosition({ x: finalX, y: finalY });

    onMove(finalX, finalY);
  };

  return (
    <div ref={joystickRef} className="joystick-container">
      <div
        ref={buttonRef}
        className={`joystick-button ${!isMoving ? "animate-joystick" : ""}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isMoving ? "none" : "transform 0.1s ease",
        }}
      />
    </div>
  );
};

const Dashboard = () => {
  const [charging, setCharging] = useState(100);
  const [speed, setSpeed] = useState(100);
  const [temperature, setTemperature] = useState(100);

  const [mapCenter, setMapCenter] = useState({ lat: 40.748817, lng: -73.985428 });
  const [zoomLevel, setZoomLevel] = useState(12);
  const [markerPosition, setMarkerPosition] = useState({ lat: 40.748817, lng: -73.985428 });

  const mapRef = useRef();

  const fetchData = () => {
    setTimeout(() => {
      setCharging(80);
      setSpeed(60);
      setTemperature(28);
    }, 3000);
  };

  useEffect(() => {
    fetchData();
    const animateValues = () => {
      setCharging(100);
      setSpeed(100);
      setTemperature(100);

      setTimeout(() => {
        setCharging(0);
        setSpeed(0);
        setTemperature(0);
      }, 100);
    };

    animateValues();
    return () => {};
  }, []);

  const handleJoystickMove = (x, y) => {
    const movementFactor = 0.0001;

    setMapCenter((prevCenter) => ({
      lat: prevCenter.lat - y * movementFactor,
      lng: prevCenter.lng + x * movementFactor,
    }));

    setMarkerPosition((prevPosition) => ({
      lat: prevPosition.lat - y * movementFactor,
      lng: prevPosition.lng + x * movementFactor,
    }));
  };

  return (
    <div className="dashboard">
      <div className="chart-section">
        <h3 style={{ textAlign: "center", fontSize: "24px" }}>Analytics</h3>
        <canvas id="chart"></canvas>
      </div>

      <div className="pictures-section">
        <div>
          <h3 id="chargetext">Steps for how to charge</h3>
          <Slider {...sliderSettings} className="image-slider">
            <div>
              <img src={Image3} alt="Vehicle 1" className="slider-image images" />
            </div>
            <div>
              <img src={Image1} alt="Vehicle 2" className="slider-image images" />
            </div>
            <div>
              <img src={Image2} alt="Vehicle 3" className="slider-image images" />
            </div>
          </Slider>
        </div>
        <div className="side-images">
          <img
            src={Image11}
            alt="Vehicle 1"
            className="side-image"
            style={{ width: "100px", height: "100px" }}
          />
          <div style={{ height: "300px", width: "300px" }}>
            <MapContainer
              center={mapCenter}
              zoom={zoomLevel}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "15px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                animation: "mapAnimation 2s ease-in-out infinite",
              }}
              zoomControl={false}
              whenCreated={(map) => (mapRef.current = map)}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={markerPosition}
                icon={L.icon({
                  iconUrl: "https://img.icons8.com/?size=100&id=xkHMsLdFzUdr&format=png&color=000000",
                  iconSize: [30, 30],
                  iconAnchor: [15, 30],
                })}
              >
                <Popup>Current location</Popup>
              </Marker>
              <ZoomControl position="topright" />
            </MapContainer>
          </div>
          <Joystick onMove={handleJoystickMove} />
        </div>
      </div>

      <div className="video-parameters-container">
        <div className="video-section">
          <h3>Live Feed</h3>
          <video autoPlay loop muted className="video" src={Video}></video>
        </div>
        <div className="parameters-section">
          <h3>Real-Time Parameters</h3>
          <ul>
            <li>Charging: {charging}%</li>
            <li>Speed: {speed} km/h</li>
            <li>Temperature: {temperature}°C</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
