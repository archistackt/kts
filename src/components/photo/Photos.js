import React from 'react';
import $ from 'jquery';

import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';

import Photo from './Photo';

class Photos extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      photos: [],
      selected: [],
      toolbarClass: 'inline create-album-toolbar'
    };

    this.onDeleteClick = this.onDeleteClick.bind(this);
    this.onPhotoSelect = this.onPhotoSelect.bind(this);
    this.onCreateAlbum = this.onCreateAlbum.bind(this);
    this.handleAlbumNameChange = this.handleAlbumNameChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
  }

  componentDidMount() {
    const nameslug = this.props.nameslug;
    window.addEventListener('scroll', this.handleScroll);
    this.serverRequest = $.get('/api/pages/' + nameslug + '/photos', (response) => {
      const data = response.result;
      if (response.success && data) {
        this.setState({
          _id: data._id,
          photos: data.photos
        });
      }
    });
  }

  componentWillUnmount() {
    this.serverRequest.abort();
  }

  onCreateAlbum() {
    this.setState({
      newAlbumName: 'Untitled Album'
    });
  }

  onDeleteClick(photoid, index) {
    const nameslug = this.props.nameslug;
    this.state.photos.splice(index, 1);
    this.setState({
      photos: this.state.photos
    });
    return $.ajax({
      url: '/api/pages/' + nameslug + '/photos/' + photoid,
      type: 'DELETE',
      success(response) {
        console.log(response);
      }
    });
  }

  onPhotoSelect(photoid, index) {
    const selected = this.state.selected;
    const found = selected.indexOf(index);
    let newAlbumName = this.state.newAlbumName;
    if (found > -1) {
      selected.splice(found, 1);
      if (selected.length === 0) {
        newAlbumName = null;
      }
    } else {
      selected.push(index);
    }
    this.setState({
      selected,
      newAlbumName
    });
  }

  handleScroll() {
    let scrollTop = event.srcElement.body.scrollTop;
    if (scrollTop > 220) {
      $('div.create-album-toolbar').addClass('fixed-top container');
    } else {
      $('div.create-album-toolbar').removeClass('fixed-top container');
    }
  }

  handleAlbumNameChange(e) {
    this.setState({
      newAlbumName: e.target.value
    });
  }

  render() {
    const photos = this.state.photos;
    const nameslug = this.props.nameslug;
    const selectedPhotos = this.state.selected;
    let createAlbumText;
    let selectedCount = null;
    let creatingAlbum = false;
    let newAlbumButton = '';
    if (selectedPhotos) {
      selectedCount = selectedPhotos.length;
      if (selectedCount === 1) {
        // createAlbumDisabled = false;
        createAlbumText = 'Selected 1 photo.';
      } else if (selectedCount > 1) {
        createAlbumText = 'Selected ' + selectedCount + ' photos.';
      }
    }
    if (this.state.newAlbumName) {
      creatingAlbum = true;
      newAlbumButton = (
        <FormGroup>
          <ControlLabel>How you would like to call it?</ControlLabel>
          {' '}
          <FormControl value={this.state.newAlbumName} onChange={this.handleAlbumNameChange}/>
          {' '}
          <Button
            className='btn btn-success'
            role='button'
            type='button'
          >Ok</Button>
          {' '}
          <Button
            className='btn btn-warning'
            role='button'
            type='button'
          >Cancel</Button>
        </FormGroup>
      );
    }
    let markup;
    if (photos && photos.length > 0) {
      markup = photos.map((image, i) => {
        let selected = '';
        if (creatingAlbum || selectedPhotos && selectedPhotos.length > 0) {
          if (selectedPhotos.indexOf(i) > -1) {
            selected = 'selected';
          } else {
            selected = 'nselected';
          }
        }
        return (
          <Photo index={i}
            photoid={image._id}
            name={image.name}
            tags={image.tags}
            nameslug={nameslug}
            filename={image.filename}
            onDeleteClick={this.onDeleteClick}
            onPhotoSelect={this.onPhotoSelect}
            className={selected}
          />
        );
      });
    } else {
      markup = <Col md={12}>No Photos found.</Col>;
    }
    return (
      <div>
        <Row className='create-album-toolbar'>
          <Col md={12}>
            <FormGroup>
              <Form inline>
                <Button
                  className='btn btn-primary'
                  disabled={creatingAlbum}
                  onClick={this.onCreateAlbum}
                >
                  Create Album
                </Button>
                {' '}
                {createAlbumText}
                {' '}
                <div className='pull-right'>
                  {newAlbumButton}
                </div>
              </Form>
            </FormGroup>
          </Col>
        </Row>
        <Row>
          {markup}
        </Row>
      </div>
    );
  }
}

Photos.propTypes = {
  nameslug: React.PropTypes.object.isRequired
};

export default Photos;
