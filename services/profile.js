import fs from 'fs';
import workflow from '../util/workflow';
import mongoose from 'mongoose';

const profileApi = {
  profile(req, res) {

    res.status(200).json({
      success: true,
      user: req.user
    });
  },

  uploadProfilePicture(req, res, next) {
    const wf = workflow(req, res);
    const file = req.file;

    wf.on('upload', function () {
      fs.readFile(file.path, function (err, data) {
        if (err) {
          return wf.emit('exception', err);
        }

        if (file.size / 1000000 > 1) {
          wf.outcome.errors.push('Maximum file size is 1MB');
          return wf.emit('response');
        }

        let query = {
          $push: {
            images: {
              filename: file.filename,
              name: file.originalname,
              contentType: file.mimetype,
              size: file.size
            }
          }
        };

        mongoose.model('User').findOneAndUpdate({
          _id: req.user._id
        }, query, function (err, doc) {
          if (err) {
            req.app.logger.error('Error while saving image', err);
            wf.outcome.errors.push('Cannot save image');
            return wf.emit('response');
          }
          wf.outcome.result = 'Uploaded';
          return wf.emit('response');
        });
      });
    });

    wf.emit('upload');
  },

  getProfileImages(req, res, next) {
    const wf = workflow(req, res);

    wf.on('imageLookup', function () {
      mongoose.model('User').findOne({
        _id: req.user._id
      }, '_id images', function (err, doc) {
        if (err) {
          req.app.logger.error('Cannot get images', err);
        }
        wf.outcome.result = doc;
        return wf.emit('response');
      });
    });

    wf.emit('imageLookup');
  }
};

export { profileApi };
