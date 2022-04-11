import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const Notes = ({ auth, notes }) => {
  return (
    <div>
      <Link to="/home">Home</Link>
      <div>
        <div>{auth.username}'s notes</div>
        <ol>
          {notes.map((note) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default connect((state) => state)(Notes);
