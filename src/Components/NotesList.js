import React, { useState, useEffect } from "react";
import axios from "axios";
import NoteDialog from "./NoteDialog";
import Header from "./Header";
import CreateNote from "./CreateNote";
import Loader from "./Loader/Loader";

const API_URL = "https://gkeepbackend.campingx.net/getNotes/";
const API_TOKEN = "As#Jjjjj4qjo4r90m*NG&h8ha_839";

const NotesList = () => {
  const [visible, setVisible] = useState(false);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      const validNotes = response.data.notes.filter(
        (note) => note.title?.trim() || note.text_content?.trim()
      );

      setNotes(validNotes);
      setFilteredNotes(validNotes);
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
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
  };

  const handleDelete = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);
    setFilteredNotes(updatedNotes);
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
      <Header onSearch={setSearchTerm} />
      <div className="container">
        {loading ? (
          <Loader />
        ) : filteredNotes.length === 0 ? (
          <p>No notes found.</p>
        ) : (
          <>
            <CreateNote onAddNote={handleAddNote} fetchNotes={fetchNotes} />
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
                  {note.title?.trim() && (
                    <h4>{highlightText(note.title, searchTerm)}</h4>
                  )}
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
