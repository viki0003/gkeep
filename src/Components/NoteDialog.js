import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import BgColorOption from "./BGColorOption/BgColorOption";
import axios from "axios";
import Loader from "./Loader/Loader";
import { BsTrash } from "react-icons/bs";
import AddFiles from "./AddFiles";

const NoteDialog = ({ visible, onHide, selectedNote, onUpdate, onDelete }) => {
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [files, setFiles] = useState([]);
  const [addedFiles, setAddedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setTextContent(selectedNote.text_content);
      setBgColor(selectedNote.bg_color);
      setTextColor(selectedNote.color);
      setFiles(selectedNote.file_uploads || []);
    }
  }, [selectedNote]);

  const handleFilesSelected = (selectedFiles) => {
    setAddedFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let uploadedFiles = [];
      if (addedFiles.length > 0) {
        const formData = new FormData();
        addedFiles.forEach((file) => {
          formData.append("file_uploads", file);
        });

        const uploadResponse = await axios.post(
          `https://gkeepbackend.campingx.net/addFilesToNote/?id=${selectedNote.id}`,
          formData,
          {
            headers: {
              Authorization: "Bearer As#Jjjjj4qjo4r90m*NG&h8ha_839",
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (uploadResponse.data.files.length > 0) {
          uploadedFiles = uploadResponse.data.files.map((file) => file.file_url);
        } else {
          console.warn("No files returned from upload API.");
        }
      }

      const updatedFiles = [...files, ...uploadedFiles];

      const saveResponse = await axios.put(
        `https://gkeepbackend.campingx.net/updateNote/?id=${selectedNote.id}`,
        {
          title,
          text_content: textContent,
          bg_color: bgColor,
          color: textColor,
          file_uploads: updatedFiles,
        },
        {
          headers: {
            Authorization: "Bearer As#Jjjjj4qjo4r90m*NG&h8ha_839",
          },
        }
      );

      if (saveResponse.status === 200) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: "Note updated successfully with files",
        });

        onUpdate({
          ...selectedNote,
          title,
          text_content: textContent,
          file_uploads: updatedFiles,
        });

        setFiles(updatedFiles);
        setAddedFiles([]);
        onHide();
      } else {
        console.warn("UpdateNote API did not return success.");
      }
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update note",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleRemoveAddedFile = (index) => {
    setAddedFiles(addedFiles.filter((_, i) => i !== index));
  };

  const footerContent = (
    <div className="dialog-footer">
      <div className="cn-ftr-icons-left">
        <div className="bg-color-options" ref={colorPickerRef}>
          <div className="bg-color-icon" title="Change color" onClick={() => setIsVisible(!isVisible)}></div>
          {isVisible && <BgColorOption setBgColor={setBgColor} setTextColor={setTextColor} />}
        </div>
        <div className="attach-file">
          <AddFiles onFilesSelected={handleFilesSelected} />
        </div>
      </div>
      <div className="footer-btn">
        <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={handleSave} />
        <Button label="Save" icon="pi pi-check" onClick={handleSave} />
      </div>
    </div>
  );

  return (
    <Dialog
      header={<input value={title} onChange={(e) => setTitle(e.target.value)} />}
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
            style={{ width: "100%", height: "200px", padding: "10px" }}
          />

          {/* Displaying Existing Files */}
          {files.length > 0 && (
            <div className="files-section">
              <h4>Files</h4>
              <div className="file-list">
                {files.map((file, index) => {
                  const url = file.file_url || file;
                  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
                  const isPDF = /\.pdf$/i.test(url);

                  return (
                    <div key={index} className="file-item">
                      {isImage ? (
                        <img src={url} alt={`Uploaded ${index}`} className="file-thumbnail" />
                      ) : isPDF ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="pdf-link">
                          📄 {url.split("/").pop()}
                        </a>
                      ) : (
                        <span>Unsupported file</span>
                      )}
                      <span className="img-remove-btn" onClick={() => handleRemoveFile(index)}>
                        <BsTrash />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Displaying Newly Added Files */}
          {addedFiles.length > 0 && (
            <div className="added-files-section">
              <h4>Added Files</h4>
              <div className="file-list">
                {addedFiles.map((file, index) => {
                  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(file.name);
                  const isPDF = /\.pdf$/i.test(file.name);

                  return (
                    <div key={index} className="file-item">
                      {isImage ? (
                        <img src={URL.createObjectURL(file)} alt={`Added ${index}`} className="file-thumbnail" />
                      ) : isPDF ? (
                        <a href={URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className="pdf-link">
                          📄 {file.name}
                        </a>
                      ) : (
                        <span>Unsupported file</span>
                      )}
                      <span className="img-remove-btn" onClick={() => handleRemoveAddedFile(index)}>
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
