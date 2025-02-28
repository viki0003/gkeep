import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Toast } from "primereact/toast";
import Loader from "./Loader/Loader";
import BgColorOption from "./BGColorOption/BgColorOption";
import FileUploader from "./FileUpload";
import { IoClose } from "react-icons/io5"; // Close icon
import ContentEditable from "react-contenteditable";
import { Tooltip } from "primereact/tooltip";

const API_URL = "https://gkeepbackend.campingx.net/postNote/";
const API_TOKEN = "As#Jjjjj4qjo4r90m*NG&h8ha_839";

const CreateNote = ({ fetchNotes }) => {
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isBodyVisible, setIsBodyVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [fileUploads, setFileUploads] = useState([]);
  const [bgColor, setBgColor] = useState("#ffffff"); // Default color
  const [textColor, setTextColor] = useState("#000000"); // Default color
  const toast = useRef(null);
  const colorPickerRef = useRef(null);
  const contentEditableRef = useRef(null);

  const handleAddNote = async () => {
    if (!title.trim() && !textContent.trim() && fileUploads.length === 0)
      return;
    setLoading(true);
    try {
      // const color = getColorBasedOnTitleLength(title);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("text_content", textContent);
      formData.append("color", textColor);
      formData.append("bg_color", bgColor); // Use selected color
      formData.append("textContentHtml", "test");
      formData.append("userEditedTimestampUsec", "Test1");
      formData.append("createdTimestampUsec", "Test2");
      formData.append("sharees", "test3");

      // Attach files
      fileUploads.forEach((file) => {
        formData.append("file_uploads", file);
      });

      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        fetchNotes();
        setTitle("");
        setTextContent("");
        setFileUploads([]);
        setBgColor("#ffffff"); // Reset to default
        setTextColor("#000000"); // Reset to default
        setIsBodyVisible(false);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatTextWithLinks = (text) => {
    if (!text) return "";

    const strippedText = text.replace(/<a[^>]*>(.*?)<\/a>/g, "$1");

    const urlRegex =
      /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/g;

    return strippedText.replace(urlRegex, (url) => {
      if (url.includes("<a") || url.includes("</a>")) return url;

      const fullUrl = url.startsWith("www.") ? `http://${url}` : url;
      const finalUrl = fullUrl.startsWith("http")
        ? fullUrl
        : `http://${fullUrl}`;
      return `<a href="${finalUrl}" class="url-link" data-pr-tooltip="Click to open ${url}" data-pr-position="top">${url}</a>`;
    });
  };

  const handleContentChange = (evt) => {
    const text = evt.target.value;
    if (text !== textContent) {
      const formattedText = formatTextWithLinks(text);
      setTextContent(formattedText);
    }
  };

  const removeFile = (index) => {
    setFileUploads((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (loading) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [loading]);

  return (
    <>
      <div className="create-note" style={{ backgroundColor: bgColor }}>
        <div className="cn-header">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onFocus={() => setIsBodyVisible(true)}
            onChange={(e) => setTitle(e.target.value)}
            style={{ color: textColor }}
          />
        </div>
        {isBodyVisible && (
          <div className="cn-body">
            {/* <textarea
              placeholder="Take a note..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              style={{ color: textColor }}
            /> */}

            <Tooltip target=".url-link" />
            <div className="ce-wrapper">
            {(!textContent || textContent === '<br>') && (
              <p onClick={() => contentEditableRef.current?.focus()}>Take a note...</p>
            )}
              <ContentEditable
               innerRef={contentEditableRef}
                html={textContent}
                disabled={false}
                onChange={handleContentChange}
                placeholder="Take a note..."
                tagName="div"
                className="content-editable create-note-textarea"
                style={{
                  width: "100%",
                  minHeight: "50px",
                  color: textColor,
                  backgroundColor: bgColor,
                  resize: "none",
                }}
                onClick={(e) => {
                  if (e.target.tagName === "A") {
                    window.open(e.target.href, "_blank");
                    e.preventDefault();
                  }
                }}
              />
            </div>
            {/* Display Uploaded Files */}
            {fileUploads.length > 0 && (
              <div className="uploaded-files">
                {fileUploads.map((file, index) => (
                  <div key={index} className="file-preview">
                    {file.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(file)} alt={file.name} />
                    ) : (
                      <div className="file-info">
                        <span>{file.name}</span>
                      </div>
                    )}
                    <button
                      className="remove-file-btn"
                      onClick={() => removeFile(index)}
                    >
                      <IoClose />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="create-note-ftr">
              <div className="cn-ftr-icons-left">
                <div className="bg-color-options" ref={colorPickerRef}>
                  <div
                    className="bg-color-icon"
                    title="Change color"
                    onClick={() => setIsVisible(!isVisible)}
                  ></div>
                  {isVisible && (
                    <BgColorOption
                      setBgColor={setBgColor}
                      setTextColor={setTextColor}
                    />
                  )}
                </div>
                <div className="attach-file">
                  <FileUploader setFileUploads={setFileUploads} />
                </div>
              </div>
              <div className="cn-ftr-btn">
                <button onClick={handleAddNote} className="add-Btn">
                  Create
                </button>
                <button
                  onClick={() => {
                    setTitle("");
                    setTextContent("");
                    setFileUploads([]);
                    setIsBodyVisible(false);
                    setBgColor("#ffffff"); // Reset to default background color
                    setTextColor("#000000"); // Reset to default text color
                  }}
                  className="close-Btn"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <Toast ref={toast} />
      </div>
      {loading && <Loader />}
    </>
  );
};

export default CreateNote;
