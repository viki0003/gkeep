import React, { useEffect, useRef, useState } from "react";
import Icon from "../../Assets/Icons/AllIcons";
import SearchBar from "../GlobalComponents/SearchBar";
import Logo from "../../Assets/Images/logo-xz.png";
import Loader from "../Loader/Loader";
import { Link, useNavigate } from "react-router-dom";
import ArchiveIcon from "../../Assets/Icons/ArchiveIcon";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import LogOutIcon from "../../Assets/Icons/LogOutIkon";

const Header = ({ onSearch, onRefresh, loading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const toast = useRef(null);

  // Store default credentials if not present
  useEffect(() => {
    if (!localStorage.getItem("userEmail")) {
      localStorage.setItem("userEmail", "admin@gmail.com");
    }
    if (!localStorage.getItem("userPassword")) {
      localStorage.setItem("userPassword", "admin123");
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const storedEmail = localStorage.getItem("userEmail");
    const storedPassword = localStorage.getItem("userPassword");

    if (email === storedEmail && password === storedPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true"); // Persist authentication
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Login successful",
      });
      setEmail("");
      setPassword("");
      setVisible(false);
      navigate("/archived-notes"); // Changed navigation path
    } else {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Invalid credentials",
      });
    }
  };

  // Add logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated"); // Clear authentication
    navigate("/");
    toast.current.show({
      severity: "info",
      summary: "Logged Out",
      detail: "Successfully logged out",
    });
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="header">
        <div className="logo">
          <Link to="/">
            <img src={Logo} alt="logo" width={80} />
          </Link>
        </div>
        <SearchBar onSearch={onSearch} />
        <div className="header-right">
          {!isAuthenticated ? (
            <Link
              to="#"
              className="archived-notes-header"
              onClick={() => setVisible(true)}
            >
              <ArchiveIcon />
            </Link>
          ) : (
            <span className="logout-icon" onClick={handleLogout}>
              <LogOutIcon />
            </span>
          )}
          <div className="refresh" onClick={onRefresh}>
            {loading ? <Loader /> : <Icon name="refresh" />}
          </div>
        </div>
      </div>

      <Dialog
        header="Login"
        visible={visible}
        className="dialogArchive"
        onHide={() => setVisible(false)}
        draggable={false}
        style={{ width: "30vw" }}
      >
        <form className="form" onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className="input-container">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <button className="submit mt-3" type="submit">
            Sign in
          </button>
        </form>
      </Dialog>
    </>
  );
};

export default Header;
