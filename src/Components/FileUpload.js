import React, { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { IoAttach } from "react-icons/io5";

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const toast = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name} is not a valid file type.`);
      } else if (file.size > maxSize) {
        errors.push(`${file.name} exceeds 10MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      errors.forEach((error) => toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to create note",
      }));
    }

    if (validFiles.length > 0) {
      setFiles(validFiles);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: `${validFiles.length} file(s) selected successfully.`,
      });
    }
  };

  return (
    <div>
      <button onClick={() => document.getElementById("fileInput").click()}>
      <IoAttach/>
      </button>
      <input
        type="file"
        id="fileInput"
        multiple
        accept=".jpg,.jpeg,.png,.pdf"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
        <Toast ref={toast} />
    </div>
  );
};

export default FileUploader;
