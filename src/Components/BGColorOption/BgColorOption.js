import { useState } from "react";
import CheckIcon from "../../Assets/Icons/CheckIcon";
import "./bgcolor.css"; // Import the CSS file

const colors = [
  "#ffffff", // Default
  "#faafa8",
  "#f39f76",
  "#fff8b8",
  "#e2f6d3",
  "#b4ddd3",
  "#d4e4ed",
  "#aeccdc",
  "#d3bfdb",
  "#e9e3d4",
];

const textColors = [
  "#000000", // Default
  "#faafa8",
  "#f39f76",
  "#fff8b8",
  "#e2f6d3",
  "#b4ddd3",
  "#d4e4ed",
  "#aeccdc",
  "#d3bfdb",
  "#e9e3d4",
];

const NoteBgColor = () => {
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [selectedTextColor, setSelectedTextColor] = useState("#ffffff");

  return (
    <div className="color-picker-container">
      <div className="color-choose">
        <div className="notebg-color">
          <h6>Note Bg Color:</h6>
          <div className="color-list">
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedColor(color)}
                className={`color-circle ${
                  selectedColor === color ? "selected" : ""
                }`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <CheckIcon className="check-icon" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="notebg-color">
          <h6>Note Text Color:</h6>
          <div className="color-list">
            {textColors.map((color, index) => (
              <button
                key={index}
                onClick={() => setSelectedTextColor(color)}
                className={`color-circle ${
                  selectedTextColor === color ? "selected" : ""
                } ${index === 0 && selectedTextColor === "#000000" ? "first-color" : ""}`}
                style={{ backgroundColor: color }}
              >
                {selectedTextColor === color && (
                  <CheckIcon className="check-icon" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteBgColor;
