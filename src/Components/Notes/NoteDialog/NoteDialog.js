import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import BgColorOption from "../../BGColorOption/BgColorOption";
import axios from "axios";
import Loader from "../../Loader/Loader";
import { BsTrash } from "react-icons/bs";
import AddFiles from "../../FileUpload/AddFiles";
import ContentEditable from "react-contenteditable";
import { Tooltip } from "primereact/tooltip";
import { FaBold, FaItalic, FaUnderline } from "react-icons/fa";
import "./notedialog.css";
import sanitizeHtml from "sanitize-html";

const NoteDialog = ({ visible, onHide, selectedNote, onUpdate, onDelete }) => {
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [textColor, setTextColor] = useState("#000000");
  const [files, setFiles] = useState([]);
  const [addedFiles, setAddedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formatStates, setFormatStates] = useState({
    bold: false,
    italic: false,
    underline: false
  });
  const toast = useRef(null);
  const colorPickerRef = useRef(null);
  const contentEditableRef = useRef(null);

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
      return `<a href="${finalUrl}" class="url-link" data-pr-tooltip="Open URL" data-pr-position="top">${url}</a>`;
    });
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

  const handleContentChange = (evt) => {
    const text = evt.target.value;
    
    // Sanitize the input to remove HTML tags except for basic text formatting
    const cleanText = sanitizeHtml(text, {
      allowedTags: ["br", "div", "b", "i", "u"], // Allowed tags
      allowedAttributes: {} // No attributes allowed
    });
  
    if (cleanText !== textContent) {
      setTextContent(cleanText);
    }
  };

const handlePaste = (event) => {
    event.preventDefault();

    // Get clipboard data as HTML
    let clipboardHTML = event.clipboardData.getData("text/html");
    let clipboardText = event.clipboardData.getData("text/plain");

    // Sanitize HTML while allowing certain tags
    const cleanHTML = sanitizeHtml(clipboardHTML || clipboardText, {
      allowedTags: ["b", "i", "em", "strong", "a", "br", "p", "div", "span", "ul", "ol", "li"],
      allowedAttributes: {
        a: ["href", "target"],
        div: ["style"],
        span: ["style"],
      },
    });

    if (cleanHTML) {
      const pasteContent = cleanHTML + "&nbsp;"; // Add space after pasting

      // Insert sanitized content at cursor position
      document.execCommand("insertHTML", false, pasteContent);
    }
  };

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setTextContent(selectedNote.text_content);
      setBgColor(selectedNote.bg_color || "#ffffff");
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
          uploadedFiles = uploadResponse.data.files.map(
            (file) => file.file_url
          );
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
          bg_color: bgColor,
          color: textColor,
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

  const handleDelete = async () => {
    if (!selectedNote) return;
    setLoading(true);
    try {
      const response = await axios.put(
        `https://gkeepbackend.campingx.net/updateNote/?id=${selectedNote.id}`,
        {
          is_archived: true,
          title: selectedNote.title,
          text_content: selectedNote.text_content,
          bg_color: selectedNote.bg_color,
          color: selectedNote.color,
          file_uploads: selectedNote.file_uploads,
        },
        {
          headers: {
            Authorization: "Bearer As#Jjjjj4qjo4r90m*NG&h8ha_839",
          },
        }
      );

      console.log("API Response:", response.data); // Debugging line

      if (response.status === 200) {
        toast.current.show({
          severity: "success",
          summary: "Archived",
          detail: "Note archived successfully",
        });
        onDelete(selectedNote.id);
        onHide();
      }
    } catch (error) {
      console.error("Error archiving note:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to archive note",
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

  const handleUnarchive = async () => {
    if (!selectedNote) return;
    setLoading(true);
    try {
      const response = await axios.put(
        `https://gkeepbackend.campingx.net/updateNote/?id=${selectedNote.id}`,
        {
          is_archived: false,
          title: selectedNote.title,
          text_content: selectedNote.text_content,
          bg_color: selectedNote.bg_color,
          color: selectedNote.color,
          file_uploads: selectedNote.file_uploads,
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
          detail: "Note unarchived successfully",
        });
        onDelete(selectedNote.id);
        onHide();
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to unarchive note",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
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

  // Add format handlers
  const handleFormat = (command) => {
    document.execCommand(command, false, null);
  
    setFormatStates((prev) => ({
      ...prev,
      [command]: !prev[command],
    }));
  
    contentEditableRef.current?.focus();
  };
  
  
  // Detect spaces and prevent blank underline
  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.key === " ") {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
  
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
  
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
  
          // If the text is only spaces or ends with a space, remove underline
          if (!text.trim() || text.endsWith(" ")) {
            document.execCommand("removeFormat", false, null);
            setFormatStates((prev) => ({ ...prev, underline: false }));
          }
        }
      }
    };
  
    document.addEventListener("keyup", handleKeyUp);
    return () => document.removeEventListener("keyup", handleKeyUp);
  }, [formatStates.underline]);

  const footerContent = (
    <div className="dialog-footer">
      <div className="cn-ftr-icons-left">
        {!selectedNote?.is_archived && (
          <>
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
              <AddFiles onFilesSelected={handleFilesSelected} />
            </div>

            <div className="formatting-toolbar">
              <button
                className={`format-btn ${formatStates.bold ? 'active' : ''}`}
                onClick={() => handleFormat("bold")}
                title="Bold"
              >
                <FaBold />
              </button>
              <button
                className={`format-btn ${formatStates.italic ? 'active' : ''}`}
                onClick={() => handleFormat("italic")}
                title="Italic"
              >
                <FaItalic />
              </button>
              <button
                className={`format-btn ${formatStates.underline ? 'active' : ''}`}
                onClick={() => handleFormat("underline")}
                title="Underline"
              >
                <FaUnderline />
              </button>
            </div>
          </>
        )}
      </div>
      {!selectedNote?.is_archived && (
        <div className="footer-btn">
          <Button
            label="Delete Note"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={handleDelete}
          />

          <Button label="Save" icon="pi pi-check" onClick={handleSave} />
        </div>
      )}

      {selectedNote?.is_archived && (
        <div className="footer-btn">
          <Button
            label="Un Archive Note"
            icon="pi pi-check"
            onClick={handleUnarchive}
          />

          <Button
            label="Delete Note"
            className="p-button-danger"
            icon="pi pi-trash"
            onClick={handleDeleteNote}
          />
        </div>
      )}
    </div>
  );

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
      <Toast ref={toast} />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Dialog
            header={
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ color: textColor }}
                disabled={selectedNote?.is_archived}
              />
            }
            visible={visible}
            style={{ width: "50vw", backgroundColor: bgColor || "#ffffff" }}
            onHide={onHide}
            draggable={false}
            className="note-dialog-cstm"
            footer={footerContent}
          >
            <Tooltip target=".url-link" />
            <ContentEditable
              innerRef={contentEditableRef}
              html={formatTextWithLinks(textContent)}
              disabled={selectedNote?.is_archived} // Disable when archived
              onChange={handleContentChange}
              onPaste={handlePaste}
              className="content-editable"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  document.execCommand("insertLineBreak");
                  e.preventDefault();
                }
              }}
              onClick={(e) => {
                if (e.target.tagName === "A") {
                  window.open(e.target.href, "_blank");
                  e.preventDefault();
                }
              }}
              tagName="div"
              style={{
                width: "100%",
                minHeight: "50px",
                overflowY: "auto",
                backgroundColor: bgColor,
                color: textColor,
              }}
            />
            {/* <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            style={{ width: "100%", height: "200px", padding: "10px" }}
          /> */}

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
                          <img
                            src={url}
                            alt={`Uploaded ${index}`}
                            className="file-thumbnail"
                          />
                        ) : isPDF ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-link"
                          >
                            📄 {url.split("/").pop()}
                          </a>
                        ) : (
                          <span>Unsupported file</span>
                        )}
                        {!selectedNote?.is_archived && (
                          <span
                            className="img-remove-btn"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <BsTrash />
                          </span>
                        )}
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
                    const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(
                      file.name
                    );
                    const isPDF = /\.pdf$/i.test(file.name);

                    return (
                      <div key={index} className="file-item">
                        {isImage ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Added ${index}`}
                            className="file-thumbnail"
                          />
                        ) : isPDF ? (
                          <a
                            href={URL.createObjectURL(file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-link"
                          >
                            📄 {file.name}
                          </a>
                        ) : (
                          <span>Unsupported file</span>
                        )}
                        <span
                          className="img-remove-btn"
                          onClick={() => handleRemoveAddedFile(index)}
                        >
                          <BsTrash />
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Dialog>
        </>
      )}
    </>
  );
};

export default NoteDialog;
