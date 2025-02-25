import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import BgColorOption from "./BGColorOption/BgColorOption";
import axios from "axios";
import Loader from "./Loader/Loader";
import FileUpload from "./FileUpload";
import { BsTrash } from "react-icons/bs";

const NoteDialog = ({ visible, onHide, selectedNote, onUpdate, onDelete }) => {
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setTextContent(selectedNote.text_content);
      setBgColor(selectedNote.bg_color);
      setTextColor(selectedNote.color);
      setFiles(selectedNote.file_uploads || []); // Fix: Correctly setting files from API response
    }
  }, [selectedNote]);


  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(
        `https://gkeepbackend.campingx.net/updateNote/?id=${selectedNote.id}`,
        {
          title,
          text_content: textContent,
          bg_color: bgColor,
          color: textColor,
          file_uploads: files,
        },
        {
          headers: {
            Authorization: "Bearer As#Jjjjj4qjo4r90m*NG&h8ha_839",
          },
        }
      );

      if (response.status === 200) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Note updated successfully",
        });
        onUpdate({
          ...selectedNote,
          title,
          text_content: textContent,
          file_uploads: files,
        });
        onHide();
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update note",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    setLoading(true);
    try {
      const response = await axios.delete(
        `https://gkeepbackend.campingx.net/deleteNote/?id=${selectedNote.id}`,
        {
          headers: {
            Authorization: "Bearer As#Jjjjj4qjo4r90m*NG&h8ha_839",
          },
        }
      );

      if (response.status === 200) {
        toast.current.show({
          severity: "success",
          summary: "Deleted",
          detail: "Note deleted successfully",
        });
        onDelete(selectedNote.id);
        onHide();
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete note",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
  };

  const footerContent = (
    <div className="dialog-footer">
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
          <FileUpload />
        </div>
      </div>
      <div className="footer-btn">
        <Button
          label="Delete"
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={handleDelete}
        />
        <Button label="Save" icon="pi pi-check" onClick={handleSave} />
      </div>
    </div>
  );

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

  return (
    <Dialog
      header={
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      }
      visible={visible}
      style={{ width: "50vw" }}
      onHide={onHide}
      draggable={false}
      className="note-dialog-cstm"
      footer={footerContent}
    >
      <Toast ref={toast} />
      {loading ? (
        <Loader />
      ) : (
        <>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            style={{
              width: "100%",
              height: "200px",
              padding: "10px",
            }}
          />

          {/* Image and File Display Section */}
          {files.length > 0 && (
            <div className="files-section">
              <h4>Files</h4>
              <div
                className="file-list"
                style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}
              >
                {files.map((file, index) => {
                  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(file);
                  const isPDF = /\.pdf$/i.test(file);

                  return (
                    <div key={index} className="file-item">
                      {isImage ? (
                        <img
                          src={file}
                          alt={`Uploaded ${index}`}
                          className="file-thumbnail"
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "5px",
                          }}
                        />
                      ) : isPDF ? (
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-link"
                          style={{ textDecoration: "none", color: "blue" }}
                        >
                          📄 {file.split("/").pop()}
                        </a>
                      ) : (
                        <span>Unsupported file</span>
                      )}
                      <span
                        className="img-remove-btn"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <BsTrash />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </Dialog>
  );
};

export default NoteDialog;
