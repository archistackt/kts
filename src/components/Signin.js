import React from 'react';
import request from 'superagent';

import UserActionTypes from '../stores/user/UserActionTypes';
import { dispatch } from '../stores/user/UserDispatcher';

import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import Alert from 'react-bootstrap/lib/Alert';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

class SignInComponent extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      email: '',
      passw: '',
      emailSet: '',
      passwSet: '',
      errorMessage: ''
    };
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePassChange = this.handlePassChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleEmailChange(e) {
    this.setState({
      email: e.target.value
    });
  }

  handlePassChange(e) {
    this.setState({
      passw: e.target.value
    });
  }

  handleSubmit(event) {
    if (event)
      event.preventDefault();

    let emailSet = !!this.state.email;
    let passwSet = !!this.state.passw;
    if (emailSet && passwSet) {
      request.post('/api/login').send(this.state).then( response => {
        const data = response.body;
        if (data.success) {
          let user = data.user;
          this.setState({
            username: user.username,
            status: user.status
          });
          dispatch({
            type: UserActionTypes.LOGIN,
            user
          });
          this.props.history.pushState(null, '/profile');
        } else {
          this.setState({
            errorMessage: data.message
          });
        }
      }).catch(err => {
        console.log(err)
      });
    }
    this.setState({
      emailSet,
      passwSet,
      errorMessage: ''
    });
  }

  render() {
    let emailHelp;
    let passwHelp;
    let emailErrorClass;
    let passwErrorClass;
    let alert;
    if (this.state.emailSet === false) {
      emailHelp = <HelpBlock>Username is required</HelpBlock>;
      emailErrorClass = 'error';
    }
    if (this.state.passwSet === false) {
      passwHelp = <HelpBlock>Password is required</HelpBlock>;
      passwErrorClass = 'error';
    }
    if (this.state.errorMessage) {
      alert = (<Alert bsStyle='danger'>
        <p>{this.state.errorMessage}</p>
      </Alert>);
    }
    return (
      <Row>
        <Col md={3}>
          <form className='registrationForm' onSubmit={this.handleSubmit}>
            <FormGroup controlId='email' validationState={emailErrorClass}>
              <ControlLabel>Username</ControlLabel>
              <FormControl
                type='text'
                value={this.state.email}
                onChange={this.handleEmailChange}
              />
              {emailHelp}
            </FormGroup>
            <FormGroup controlId='passw' validationState={passwErrorClass}>
              <ControlLabel>Password</ControlLabel>
              <FormControl
                type='password'
                value={this.state.passw}
                onChange={this.handlePassChange}
              />
              {passwHelp}
            </FormGroup>
            {alert}
            <Button type='submit'>Log in</Button>
          </form>
        </Col>
      </Row>
    );
  }
}

SignInComponent.propTypes = {
  history: React.PropTypes.object.isRequired
};

export default SignInComponent;
