import React, { useRef, useState } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import Loader from "./Loader/Loader";

const API_URL = "https://gkeepbackend.campingx.net/postNote/";
const API_TOKEN = "As#Jjjjj4qjo4r90m*NG&h8ha_839";

const CreateNote = ({ onAddNote, fetchNotes }) => {
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isBodyVisible, setIsBodyVisible] = useState(false); // Controls visibility
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  const getColorBasedOnTitleLength = (title) => {
    const wordCount = title.trim().split(/\s+/).length;
    if (wordCount >= 1 && wordCount <= 5) return "#faafa8";
    if (wordCount >= 6 && wordCount <= 8) return "#f39f76";
    if (wordCount >= 9 && wordCount <= 12) return "#fff8b8";
    if (wordCount >= 12 && wordCount <= 18) return "#e2f6d3";
    if (wordCount >= 19 && wordCount <= 25) return "#b4ddd3";
    if (wordCount >= 26 && wordCount <= 30) return "#d4e4ed";
    if (wordCount >= 31 && wordCount <= 40) return "#aeccdc";
    if (wordCount >= 41 && wordCount <= 60) return "#d3bfdb";
    if (wordCount >= 60 && wordCount <= 80) return "#e9e3d4";
    return "#ffffff"; // Default color
  };

  const handleAddNote = async () => {
    if (!title.trim() && !textContent.trim()) return;
    setLoading(true);
    try {
      const color = getColorBasedOnTitleLength(title);
      let request = {
        title,
        textContent,
        color,
        textContentHtml: "test",
        userEditedTimestampUsec: "Test1",
        createdTimestampUsec: "Test2",
        sharees: "test3",
      };

      const response = await axios.post(API_URL, request, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      if (response.status === 201) {
        fetchNotes();
        setTitle("");
        setTextContent("");
        setIsBodyVisible(false); // Hide after adding note
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Note successfully created.",
        });
      }
    } catch (error) {
      console.error("Error adding note:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create note",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="create-note">
        <div className="cn-header">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onFocus={() => setIsBodyVisible(true)} // Show on focus
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        {isBodyVisible && ( // Conditionally render .cn-body
          <div className="cn-body">
            <textarea
              placeholder="Take a note..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <div className="cn-ftr-btn">
              <button onClick={handleAddNote} className="add-Btn">
                Create
              </button>
              <button
                onClick={() => {
                  setTitle("");
                  setTextContent("");
                  setIsBodyVisible(false); // Hide on close
                }}
                className="close-Btn"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <Toast ref={toast} />
      </div>
      {loading && (
        <div className="loader-container">
          <Loader />
        </div>
      )}
    </>
  );
};

export default CreateNote;
