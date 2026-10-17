import { Link } from "react-router-dom";


function ShowCard({ show }) {
  return (
    <Link to={"/shows/" + show.id} className="show-card">
      {show.image ? (
        <img src={show.image.medium} alt={show.name} />
      ) : (
        <div className="no-poster">No Image</div>
      )}

      <div className="show-info">
        <h3>{show.name}</h3>
        <p>{show.genres.join(", ") || "No genre"}</p>
        <p>Rating: {show.rating.average || "N/A"}</p>
      </div>
    </Link>
  );
}

export default ShowCard;