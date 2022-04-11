import React from 'react';
import { connect } from 'react-redux';

class AddNote extends React.Component {
  constructor() {
    super();
    this.state = {
      note: '',
    };
    this.handleOnChange = this.handleOnChange.bind(this);
    this.handleOnSubmit = this.handleOnSubmit.bind(this);
  }

  handleOnChange(ev) {
    this.setState({
      [ev.target.name]: ev.target.value,
    });
  }

  handleOnSubmit(ev) {
    ev.preventDefault();
    console.log(this.state.note);
  }

  render() {
    const { note } = this.state;
    return (
      <div>
        <label htmlFor="add-note">add a new note</label>
        <form name="add-note">
          <input
            name="note"
            value={note}
            placeholder="new note"
            onChange={(ev) => this.handleOnChange(ev)}
          ></input>
          <button onClick={this.handleOnSubmit}>enter</button>
        </form>
      </div>
    );
  }
}

export default connect()(AddNote);
