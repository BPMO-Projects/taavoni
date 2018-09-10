const GridFsStorage = require('multer-gridfs-storage');
const crypto = require('crypto');
// const methodOverride = require('method-override');
const multer = require('multer');
const mongoUri = 'mongodb://localhost:27017/TaavoniDb';
const path = require('path');
const Grid = require('gridfs-stream');
var bluebird = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = bluebird;

module.exports = function (app) {

    // for local mongo
    const mongoUri = 'mongodb://localhost:27017/TaavoniDb';
    // for docker mongo 
    // const mongoUri = 'mongodb://taavoni_mongodb:27017/TaavoniDb;

    mongoose.connect(mongoUri, { useNewUrlParser: true });
    const mongooseConnection = mongoose.connection;
    // initialize gfs
    let gfs;

    mongooseConnection.once('open', () => {
        // init stream
        gfs = Grid(mongooseConnection.db, mongoose.mongo);
        gfs.collection('uploads');
        // upload routes 
        console.log('2- Connected to mongodb Successfully');
    });

    // Setting up the storage element
    let storage = GridFsStorage({
        url: mongoUri,
        gfs: gfs,
        file: (req, file) => {
            return new Promise((resolve, reject) => {
                crypto.randomBytes(16, (err, buf) => {
                    if (err) {
                        return reject(err);
                    }
                    const filename = buf.toString('hex') + path.extname(file.originalname);
                    const fileInfo = {
                        filename: filename,
                        bucketName: 'uploads'
                    };
                    resolve(fileInfo);
                });
            });
        }
    });

    // Multer configuration for single file uploads
    let upload = multer({
        storage: storage
    }).single('file');

    // Route for file upload
    app.route('/api/file/upload')
        .post((req, res) => {
            upload(req, res, (err) => {

                if (err) {
                    console.log('error uploading:' + err);
                    res.json({ error_code: 1, err_desc: err });
                    return;
                }
                res.json({ file: req.file });
            });
        });

    app.route('/api/file/:filename')
        .get((req, res) => {
            //set collection name to lookup into
            gfs.collection('uploads');

            // First check if file exists
            gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        responseCode: 1,
                        responseMessage: "error"
                    });
                }
                // create read stream
                var readstream = gfs.createReadStream({
                    filename: files[0].filename,
                    root: "uploads"
                });
                // set the proper content type 
                res.set('Content-Type', files[0].contentType)
                // Return response
                return readstream.pipe(res);
            });
        });

    // Route for getting all the files
    app.route('/api/files')
        .get((req, res) => {
            let filesData = [];
            let count = 0;
            // set the collection to look up into
            gfs.collection('uploads');

            gfs.files.find({}).toArray((err, files) => {
                if (err)
                    res.json(err);

                // Error checking
                if (!files || files.length === 0) {
                    return res.status(404).json({
                        responseCode: 1,
                        responseMessage: err
                    });
                }
                // Loop through all the files and fetch the necessary information
                files.forEach((file) => {
                    filesData[count++] = {
                        // originalname: file.metadata.originalname,
                        filename: file.filename,
                        contentType: file.contentType
                    }
                });

                res.json(filesData);
            });
        });
}