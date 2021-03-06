import React from 'react';
import request from 'superagent';

import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Alert from 'react-bootstrap/lib/Alert';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

export default class RegisterComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      phone: ''
    };
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePhoneChange = this.handlePhoneChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEmailChange(e) {
    this.setState({
      email: e.target.value
    });
  }

  handlePhoneChange(e) {
    this.setState({
      phone: e.target.value
    });
  }

  handleSubmit(event) {
    if (event)
      event.preventDefault();
    request.post('/api/register')
      .send(this.state)
      .then(response => {
        const data = response.body;
        this.setState({
          error: data.success,
          message: data.message
        })
    });
  }

  render() {
    let alert;
    let style = this.state.error ? 'danger' : 'success';
    if (this.state.message) {
      alert = (<Alert bsStyle={style}>
        <p>{this.state.message}</p>
      </Alert>);
    }
    return (
      <Row>
        <Col md={4}>
          <p>Fill out the registration form and click Sign Up.</p>
          <form className='registrationForm' onSubmit={this.handleSubmit}>
            <FormGroup controlId='email'>
              <ControlLabel>Email</ControlLabel>
              <FormControl
                type='text'
                value={this.state.email}
                onChange={this.handleEmailChange}
              />
            </FormGroup>
            <FormGroup controlId='tel'>
              <ControlLabel>Phone</ControlLabel>
              <FormControl
                type='phone'
                value={this.state.phone}
                onChange={this.handlePhoneChange}
              />
            </FormGroup>
            {alert}
            <Button type='submit' secondary>Sign Up</Button>
          </form>
        </Col>
      </Row>
    );
  }
}
