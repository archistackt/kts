import React, { PropTypes } from 'react';
import request from 'superagent';
import { Container } from 'flux/utils';

import { Link } from 'react-router';

import Immutable from 'immutable';
import User from '../stores/user/User';
import UserStore from '../stores/user/UserStore';
import UserActionTypes from '../stores/user/UserActionTypes';
import { dispatch } from '../stores/user/UserDispatcher';

import Header from './Header';

class AppComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: {}
    };
  }

  componentDidMount() {
    let self = this;
    request.get('/api/profile').then(response => {
      const data = response.body;
      if (data.success) {
        let user = data.user;
        dispatch({
          type: UserActionTypes.LOGIN,
          user
        });
        self.setState({
          user
        });
      }
    });
  }

  static getStores() {
    return [UserStore];
  }

  static calculateState(prevState) {
    let currentState = {
      user: UserStore.getState(),
      isLoggedIn: UserStore.isLoggedIn()
    };
    return currentState;
  }

  render() {
    let currentUser = UserStore.getLoggedInUser();
    let username = null;
    if (currentUser.username) {
      username = currentUser.username;
    }
    return (
      <div>
        <Header username={username} {...this.props}/>
        <div className='main-container container'>
          { this.props.children }
          <hr/>
        </div>
      </div>
    );
  }
}

AppComponent.propTypes = {
  children: React.PropTypes.object.isRequired
};

AppComponent.childContextTypes = {
  muiTheme: React.PropTypes.object
};

const container = Container.create(AppComponent);

export default AppComponent;
