import register from './services/register';
import activate from './services/activate';
import signin from './services/signin';
import signout from './services/signout';
import { profileApi } from './services/profile';
import { pageApi } from './services/page';

const api = {
  register,
  activate,
  signin,
  signout,
  profile: profileApi.profile,
  uploadPhoto: profileApi.uploadPhoto,
  deletePhoto: profileApi.deletePhoto,

  // page API
  createPage: pageApi.createPage,
  getPages: pageApi.getPages,
  findPage: pageApi.findPage,
  _findPage: pageApi._findPage,
  getPhotos: pageApi.getPhotos
};

export { api };
