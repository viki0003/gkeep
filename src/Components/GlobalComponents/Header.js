import React from "react";
import Icon from "../../Assets/Icons/AllIcons";
import SearchBar from "../GlobalComponents/SearchBar";
import Logo from "../../Assets/Images/logo-xz.png";
import Loader from "../Loader/Loader";

const Header = ({ onSearch, onRefresh, loading }) => {
  return (
    <>
      <div className="header">
        <div className="logo">
          <img src={Logo} alt="logo" width={80} />
        </div>
        <SearchBar onSearch={onSearch} />
        <div className="refresh" onClick={onRefresh}>
          {loading ? <Loader /> : <Icon name="refresh" />}
        </div>
      </div>
    </>
  );
};

export default Header;
