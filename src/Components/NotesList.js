import React, { useState, useEffect } from "react";
import axios from "axios";
import NoteDialog from "./NoteDialog";
import Header from "./Header";
import CreateNote from "./CreateNote";
import { FaThumbtack } from "react-icons/fa";
import ContentEditable from "react-contenteditable";
import { Tooltip } from "primereact/tooltip";

const API_URL = "https://gkeepbackend.campingx.net/getNotes/";
const API_TOKEN = "As#Jjjjj4qjo4r90m*NG&h8ha_839";

const NotesList = () => {
  const [visible, setVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [pinnedNotes, setPinnedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      const validNotes = response.data.notes.filter(
        (note) => note.title?.trim() || note.text_content?.trim()
      );

      const pinned = validNotes.filter((note) => note.is_pinned);
      const unpinned = validNotes.filter((note) => !note.is_pinned);

      setNotes(unpinned);
      setPinnedNotes(pinned);
      setFilteredNotes(unpinned);
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = (newNote) => {
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
  };

  const handleUpdate = (updatedNote) => {
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );
    const updatedPinnedNotes = pinnedNotes.map((note) =>
      note.id === updatedNote.id ? updatedNote : note
    );
    setNotes(updatedNotes);
    setPinnedNotes(updatedPinnedNotes);
    setFilteredNotes(updatedNotes);
  };

  const handleDelete = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    const updatedPinnedNotes = pinnedNotes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    setPinnedNotes(updatedPinnedNotes);
    setFilteredNotes(updatedNotes);
  };

  const handlePin = async (noteId) => {
    const noteToPin = notes.find((note) => note.id === noteId);
    if (noteToPin) {
      try {
        const response = await axios.put(
          `https://gkeepbackend.campingx.net/updateNote/?id=${noteToPin.id}`,
          {
            ...noteToPin, // Include all existing note data
            is_pinned: true, // Only updating the pinned status
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        if (response.status === 200) {
          noteToPin.is_pinned = true;
          setPinnedNotes([noteToPin, ...pinnedNotes]);
          setNotes(notes.filter((note) => note.id !== noteId));
          setFilteredNotes(notes.filter((note) => note.id !== noteId));
        }
      } catch (error) {
        console.error("Error pinning note:", error);
      }
    }
  };

  const handleUnpin = async (noteId) => {
    const noteToUnpin = pinnedNotes.find((note) => note.id === noteId);
    if (noteToUnpin) {
      try {
        const response = await axios.put(
          `https://gkeepbackend.campingx.net/updateNote/?id=${noteToUnpin.id}`,
          {
            ...noteToUnpin, // Ensure all data remains intact
            is_pinned: false,
          },
          {
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
            },
          }
        );

        if (response.status === 200) {
          noteToUnpin.is_pinned = false;
          setNotes([noteToUnpin, ...notes]);
          setPinnedNotes(pinnedNotes.filter((note) => note.id !== noteId));
          setFilteredNotes([noteToUnpin, ...notes]);
        }
      } catch (error) {
        console.error("Error unpinning note:", error);
      }
    }
  };

  // Highlight matched text
  const highlightText = (text, search) => {
    if (!search.trim()) return text;

    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <mark key={index} style={{ backgroundColor: "yellow" }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Trim text to 65 words
  const trimText = (text, search) => {
    if (!text) return "";

    const words = text.split(/\s+/);
    if (words.length <= 65) return highlightText(text, search);

    const trimmedText = words.slice(0, 65).join(" ") + "...";
    return highlightText(trimmedText, search);
  };

  // Filter notes based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNotes(notes);
      return;
    }

    const filtered = notes.filter(
      (note) =>
        (note.title?.trim() || note.text_content?.trim()) && 
        (note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         note.text_content?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  const formatTextWithLinks = (text) => {
    // Handle null, undefined, or non-string values
    if (!text || typeof text !== "string") {
      return "";
    }

    const strippedText = text.replace(/<a[^>]*>(.*?)<\/a>/g, "$1");

    const urlRegex =
      /((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/g;

    return strippedText.replace(urlRegex, (url) => {
      if (url.includes("<a") || url.includes("</a>")) return url;

      const fullUrl = url.startsWith("www.") ? `http://${url}` : url;
      const finalUrl = fullUrl.startsWith("http")
        ? fullUrl
        : `http://${fullUrl}`;
      return `<a href="${finalUrl}" class="url-link" data-pr-tooltip="Open Url" data-pr-position="top">${url}</a>`;
    });
  };

  useEffect(() => {
    if (loading) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [loading]);

  return (
    <>
      <Header
        onSearch={setSearchTerm}
        onRefresh={fetchNotes}
        loading={loading}
      />
      <div className="container">
        <CreateNote onAddNote={handleAddNote} fetchNotes={fetchNotes} />
        {loading ? (
          <p>Loading notes...</p>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div className="pinned-section">
                <h3>Pinned Notes</h3>
                <div className="note-list">
                  {pinnedNotes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        background: note.bg_color?.toLowerCase(),
                        cursor: "pointer",
                      }}
                      className="item"
                      onClick={() => {
                        setSelectedNote(note);
                        setVisible(true);
                      }}
                    >
                      <div className="note-header-title">
                        <div className="note-pin">
                          <FaThumbtack
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnpin(note.id);
                            }}
                            style={{ color: "red" }}
                          />
                        </div>
                        {note.title?.trim() && (
                          <h4
                            style={{
                              color: note.color?.toLowerCase(),
                            }}
                          >
                            {highlightText(note.title, searchTerm)}
                          </h4>
                        )}
                      </div>
                      <Tooltip target=".url-link" />
                      {note.text_content?.trim() ? (
                        <ContentEditable
                          html={formatTextWithLinks(
                            trimText(note.text_content, searchTerm)
                          )}
                          disabled={true}
                          onChange={() => {}}
                          tagName="div"
                          style={{
                            color: note.color?.toLowerCase(),
                            cursor: "text",
                            padding: "8px 0",
                          }}
                          onClick={(e) => {
                            if (e.target.tagName === "A") {
                              window.open(e.target.href, "_blank");
                              e.preventDefault();
                            }
                          }}
                        />
                      ) : (
                        console.warn("No Text Found")
                      )}
                      {/* Image Section */}
                      <div className="note-images-container">
                        {note.file_uploads?.length > 0 && (
                          <div
                            className="note-images"
                            style={{ display: "flex", gap: "5px" }}
                          >
                            {note.file_uploads.map((file, index) => (
                              <div
                                key={index}
                                style={{
                                  width: `${100 / note.file_uploads.length}%`,
                                }}
                              >
                                {file.endsWith(".jpg") ||
                                file.endsWith(".png") ||
                                file.endsWith(".jpeg") ? (
                                  <img
                                    src={file}
                                    alt="Note Attachment"
                                    style={{ width: "100%", height: "auto" }}
                                  />
                                ) : (
                                  <a
                                    href={file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="file-link"
                                  >
                                    View File
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="note-list">
              {filteredNotes
                .filter(
                  (note) =>
                    note.title?.trim() ||
                    note.text_content?.trim() ||
                    (note.file_uploads && note.file_uploads.length > 0)
                )
                .map((note) => (
                  <div
                    key={note.id}
                    style={{
                      background: note.bg_color?.toLowerCase(),
                      cursor: "pointer",
                    }}
                    className="item"
                    onClick={() => {
                      setSelectedNote(note);
                      setVisible(true);
                    }}
                  >
                    <div className="note-header-title">
                      <div className="note-pin">
                        <FaThumbtack
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePin(note.id);
                          }}
                          style={{ color: note.is_pinned ? "red" : "black" }}
                        />
                      </div>
                      {note.title?.trim() && (
                        <h4
                          style={{
                            color: note.color?.toLowerCase(),
                          }}
                        >
                          {highlightText(note.title, searchTerm)}
                        </h4>
                      )}
                    </div>
                    <Tooltip target=".url-link" />
                    {note.text_content?.trim() ? (
                      <ContentEditable
                        html={formatTextWithLinks(
                          trimText(note.text_content, searchTerm)
                        )}
                        disabled={true}
                        onChange={() => {}}
                        tagName="div"
                        style={{
                          color: note.color?.toLowerCase(),
                          cursor: "text",
                          padding: "8px 0",
                        }}
                        onClick={(e) => {
                          if (e.target.tagName === "A") {
                            window.open(e.target.href, "_blank");
                            e.preventDefault();
                          }
                        }}
                      />
                    ) : (
                      console.warn("NO Text Found")
                    )}
                    {/* Image Section */}
                    <div className="note-images-container">
                      {note.file_uploads?.length > 0 && (
                        <div
                          className="note-images"
                          style={{ display: "flex", gap: "5px" }}
                        >
                          {note.file_uploads.map((file, index) => (
                            <div
                              key={index}
                              style={{
                                width: `${100 / note.file_uploads.length}%`,
                              }}
                            >
                              {file.endsWith(".jpg") ||
                              file.endsWith(".png") ||
                              file.endsWith(".jpeg") ? (
                                <img
                                  src={file}
                                  alt="Note Attachment"
                                  style={{ width: "100%", height: "auto" }}
                                />
                              ) : (
                                <a
                                  href={file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="file-link"
                                >
                                  View File
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        <NoteDialog
          visible={visible}
          onHide={() => setVisible(false)}
          selectedNote={selectedNote}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
};

export default NotesList;
