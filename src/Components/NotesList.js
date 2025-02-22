import React, { useState, useEffect } from "react";
import axios from "axios";
import NoteDialog from "./NoteDialog";
import Header from "./Header";
import CreateNote from "./CreateNote";
import { FaThumbtack } from "react-icons/fa";

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

      const pinned = validNotes.filter((note) => note.isPinned);
      const unpinned = validNotes.filter((note) => !note.isPinned);

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

  const handlePin = (noteId) => {
    const noteToPin = notes.find((note) => note.id === noteId);
    if (noteToPin) {
      noteToPin.isPinned = true;
      setPinnedNotes([noteToPin, ...pinnedNotes]);
      setNotes(notes.filter((note) => note.id !== noteId));
      setFilteredNotes(notes.filter((note) => note.id !== noteId));
    }
  };

  const handleUnpin = (noteId) => {
    const noteToUnpin = pinnedNotes.find((note) => note.id === noteId);
    if (noteToUnpin) {
      noteToUnpin.isPinned = false;
      setNotes([noteToUnpin, ...notes]);
      setPinnedNotes(pinnedNotes.filter((note) => note.id !== noteId));
      setFilteredNotes([noteToUnpin, ...notes]);
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
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.text_content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  return (
    <>
      <Header
        onSearch={setSearchTerm}
        onRefresh={fetchNotes}
        loading={loading}
      />
      <div className="container">
        <CreateNote onAddNote={handleAddNote} />
        {loading ? (
          <p>Loading notes...</p>
        ) : (
          <>
            {pinnedNotes.length > 0 && (
              <div className="pinned-section">
                <h3>Pinned Notes</h3>
                <div className="note-list pinned-notes-list">
                  {pinnedNotes.map((note) => (
                    <div
                      key={note.id}
                      style={{
                        background: note.color?.toLowerCase(),
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
                          <h4>{highlightText(note.title, searchTerm)}</h4>
                        )}
                      </div>
                      {note.text_content?.trim() && (
                        <p>{trimText(note.text_content, searchTerm)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="note-list">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    background: note.color?.toLowerCase(),
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
                        style={{ color: note.isPinned ? "red" : "black" }}
                      />
                    </div>

                    {note.title?.trim() && (
                      <h4>{highlightText(note.title, searchTerm)}</h4>
                    )}
                  </div>

                  {note.text_content?.trim() && (
                    <p>{trimText(note.text_content, searchTerm)}</p>
                  )}
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
