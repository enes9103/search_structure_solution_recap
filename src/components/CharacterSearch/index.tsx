import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import "./CharacterSearch.css";
import richAndMorty from "../../assets/images/rich-and-morty.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Character {
  id: number;
  name: string;
  image: string;
  episode: string[];
}

const fetchCharacters = async (query: string): Promise<Character[]> => {
  try {
    const response = await fetch(
      `https://rickandmortyapi.com/api/character/?name=${query}`
    );
    const data = await response.json();
    return data.results || []; // Return an empty array if no results are found
  } catch (error) {
    console.error("Error fetching characters:", error);
    throw error;
  }
};

const highlightQuery = (text: string, query: string) => {
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <b key={index} style={{ color: "red" }}>
            {part}
          </b>
        ) : (
          part
        )
      )}
    </span>
  );
};

const CharacterSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [addedCharacters, setAddedCharacters] = useState<Character[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      fetchCharacters(query)
        .then((data) => {
          // Filter out characters that are already selected
          const filteredData = data.filter(
            (character) =>
              !selectedCharacters.some((c) => c.id === character.id)
          );
          setCharacters(filteredData);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          setError("Error fetching characters");
        });
    } else {
      setCharacters([]);
    }
  }, [query, selectedCharacters]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSelectCharacter = (character: Character) => {
    if (!selectedCharacters.find((c) => c.id === character.id)) {
      setSelectedCharacters((prev) => [...prev, character]);
    }
    setQuery("");
    setCharacters([]);
  };

  const handleRemoveCharacter = (id: number) => {
    setSelectedCharacters(selectedCharacters.filter((c) => c.id !== id));
  };
  const handleRemoveCharacterList = (id: number) => {
    setAddedCharacters(addedCharacters.filter((c) => c.id !== id));
    toast.success("Başarıyla kaldırıldı", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const handleAddCharacters = () => {
    const uniqueCharacters = selectedCharacters.filter(
      (character) => !addedCharacters.some((added) => added.id === character.id)
    );
    if (uniqueCharacters.length > 0) {
      setAddedCharacters((prev) => [...prev, ...uniqueCharacters]);
      setSelectedCharacters([]);
      toast.success("Başarıyla eklendi", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      toast.error("Lütfen tekrar deneyiniz.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev + 1) % characters.length);
    } else if (event.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev === 0 ? characters.length - 1 : prev - 1
      );
    } else if (event.key === "Enter") {
      if (characters.length > 0) {
        handleSelectCharacter(characters[highlightedIndex]);
      }
    }
  };

  return (
    <div className="container">
      <ToastContainer />
      <img src={richAndMorty} alt="richAndMorty" className="title-image" />

      <div className="input-container">
        {selectedCharacters.map((character) => (
          <div key={character.id} className="tag">
            <img
              src={character.image}
              alt={character.name}
              width={20}
              height={20}
            />
            {character.name}
            <button onClick={() => handleRemoveCharacter(character.id)}>
              x
            </button>
          </div>
        ))}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search characters..."
          className="search-input"
        />
      </div>

      <button onClick={handleAddCharacters} className="add-button">
        Add Character
      </button>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
      {!loading && !error && characters.length > 0 && (
        <ul className="results">
          {characters.map((character, index) => (
            <li
              key={character.id}
              className={index === highlightedIndex ? "selected" : ""}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => handleSelectCharacter(character)}
            >
              <img
                src={character.image}
                alt={character.name}
                width={50}
                height={50}
              />
              <div className="result-content">
                {highlightQuery(character.name, query)}
                <span>Episodes: {character.episode.length}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="selected-characters">
        <h3>Selected Characters:</h3>
        <ul>
          {addedCharacters.map((character) => (
            <li key={character.id}>
              <div className="character-info">
                <img src={character.image} alt={character.name} width={50} />
                <div className="character-details">
                  {character.name}
                  <span>Episodes: {character.episode.length}</span>
                </div>
              </div>
              <button
                className="remove-button"
                onClick={() => handleRemoveCharacterList(character.id)}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CharacterSearch;
