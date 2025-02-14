import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios from "axios";
import Loader from "./Loader/Loader";

const NoteDialog = ({ visible, onHide, selectedNote, onUpdate, onDelete }) => {
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setTextContent(selectedNote.text_content);
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
        onUpdate({ ...selectedNote, title, text_content: textContent });
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
        onHide(); // Close dialog after deletion
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

  const footerContent = (
    <div className="footer-btn">
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={handleDelete}
      />
      <Button label="Save" icon="pi pi-check" onClick={handleSave} />
    </div>
  );

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
              border: "1px solid #ccc",
              padding: "10px",
            }}
          />
        </>
      )}
      {/* <div className="footer-btn">
        <Button
          label="Delete"
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={handleDelete}
        />
        <Button label="Save" icon="pi pi-check" onClick={handleSave} />
      </div> */}
    </Dialog>
  );
};

export default NoteDialog;
