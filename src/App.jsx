import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams
} from "react-router-dom";

import Navbar from "./components/Navbar";
import ShowCard from "./components/ShowCard";
import "./App.css";

const API = "https://api.tvmaze.com";



function Home() {
  return (
    <div className="hero">
      <h1>Welcome to ShowTime</h1>
      <p>Find your favourite TV shows</p>
      <Link to="/shows" className="btn">
        Browse Shows
      </Link>
    </div>
  );
}

function Shows() {
  const [shows, setShows] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getShows() {
      setLoading(true);
      setError("");

      try {
        let url = API + "/shows?page=0";

        if (search.trim() !== "") {
          url = API + "/search/shows?q=" + encodeURIComponent(search);
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Could not load shows");
        }

        const data = await response.json();

        if (search.trim() !== "") {
          setShows(data.map(item => item.show));
        } else {
          setShows(data.slice(0, 40));
        }
      } catch (error) {
        setError("Could not load shows. Please try again.");
      }

      setLoading(false);
    }

    getShows();
  }, [search]);

  const genres = [
    "All",
    ...new Set(shows.flatMap(show => show.genres))
  ];

  const filteredShows = shows.filter(show =>
    genre === "All" || show.genres.includes(genre)
  );

  return (
    <div className="container">
      <h1>Browse Shows</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search shows..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
        >
          {genres.map(item => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading shows...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="shows-grid">
          {filteredShows.map(show => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}

      {!loading && !error && filteredShows.length === 0 && (
        <p>No shows found.</p>
      )}
    </div>
  );
}


function Details() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [cast, setCast] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getDetails() {
      setShow(null);
      setError(false);

      try {
        const response = await fetch(API + "/shows/" + id);

        if (!response.ok) {
          throw new Error("Show not found");
        }

        const data = await response.json();
        setShow(data);
      } catch (error) {
        setError(true);
      }

      try {
        const response = await fetch(API + "/shows/" + id + "/cast");
        const data = await response.json();
        setCast(data);
      } catch (error) {
        setCast([]);
      }
    }

    getDetails();
  }, [id]);

  if (error) {
    return (
      <div className="container">
        <h2>Show not found</h2>
        <Link to="/shows">Back to Shows</Link>
      </div>
    );
  }

  if (!show) {
    return <p className="loading">Loading show details...</p>;
  }

  return (
    <div className="container">
      <Link to="/shows" className="back-link">
        Back to Shows
      </Link>

      <div className="details">
        {show.image ? (
          <img
            className="details-poster"
            src={show.image.original || show.image.medium}
            alt={show.name}
          />
        ) : (
          <div className="no-poster">No Image</div>
        )}

        <div className="details-info">
          <h1>{show.name}</h1>
          <p><strong>Genres:</strong> {show.genres.join(", ") || "N/A"}</p>
          <p><strong>Language:</strong> {show.language || "N/A"}</p>
          <p><strong>Premiered:</strong> {show.premiered || "N/A"}</p>
          <p><strong>Rating:</strong> {show.rating.average || "N/A"}</p>

          <h2>Summary</h2>
          <p>
            {show.summary
              ? show.summary.replace(/<[^>]*>/g, "")
              : "No summary available."}
          </p>
        </div>
      </div>

      <h2 className="cast-heading">Cast</h2>

      <div className="cast-grid">
        {cast.map((item, index) => (
          <div className="cast-card" key={index}>
            {item.person.image ? (
              <img
                src={item.person.image.medium}
                alt={item.person.name}
              />
            ) : (
              <div className="cast-placeholder">No Image</div>
            )}

            <h3>{item.person.name}</h3>
            <p>as {item.character.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <Link to="/">Go to Home</Link>
    </div>
  );
}


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/shows/:id" element={<Details />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer>ShowTime | Data from TVMaze API</footer>
    </BrowserRouter>
  );
}

export default App;