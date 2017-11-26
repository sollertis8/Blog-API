// const express = require('express');
// const router = express.Router();
// const morgan = require('morgan');
// const bodyParser = require('body-parser');

// const BlogPosts = require('./models');

// const jsonParser = bodyParser.json();
// const app = express();

// const blogPostRouter = require('./blogPostRouter');

// // log the http layer
// app.use(morgan('common'));

// app.use(express.static('public'));

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html');
// });

// app.use('/blog-posts', blogPostRouter);

// let server;

// function runServer() {
//   const port = process.env.PORT || 8080;
//   return new Promise((resolve, reject) => {
//     server = app.listen(port, () => {
//       console.log(`Your app is listening on port ${port}`);
//       resolve(server);
//     }).on('error', err => {
//       reject(err)
//     });
//   });
// }

// function closeServer() {
//   return new Promise((resolve, reject) => {
//     console.log('Closing server');
//     server.close(err => {
//       if (err) {
//         reject(err);
//         // so we don't also call `resolve()`
//         return;
//       }
//       resolve();
//     });
//   });
// }

// if (require.main === module) {
//   runServer().catch(err => console.error(err));
// };

// module.exports = {app, runServer, closeServer};

const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const mongoose =require('mongoose');


const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');

mongoose.Promise = global.Promise;

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
  BlogPost
    .find()
    .then(posts => {
      res.json(posts.map(post => post.apiRepr()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

app.get('/posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post => res.json(post.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).json({error: 'something went horribly awry'});
    });
});

app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPost
  .create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  })
  .then(blogPost => res.status(201).json(blogPost.apiRepr()))
  .catch(err => {
      console.error(err);
      res.status(500).json({error: 'Something went wrong'});
  });

  app.delete('/posts/:id', (req, res) => {
    BlogPost
      .findByIdAndRemove(req.params.id)
      .then(() => {
        res.status(204).json({message: 'success'});
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({error: 'something went terribly wrong'});
      });
  });

  app.put('/posts/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
      res.status(400).json({
        error: 'Request path id and request body id values must match'
      });
    }
  
    const updated = {};
    const updateableFields = ['title', 'content', 'author'];
    updateableFields.forEach(field => {
      if (field in req.body) {
        updated[field] = req.body[field];
      }
    });

    BlogPost
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

app.delete('/:id', (req, res) => {
  BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted blog post with id \`${req.params.ID}\``);
      res.status(204).end();
    });
});

app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};


})
