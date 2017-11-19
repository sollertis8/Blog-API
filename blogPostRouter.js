const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models');

//add some items to BlogPosts
// so there's some data to look at
BlogPosts.create('Our Trip to Los Angeles', 'Our recent trip to Los Angeles was exciting! Our flight was smooth and we stayed at the Westin Bonaventure Hotel.', 'Korre Mayweather', '11-12-2017')
BlogPosts.create('Feeling Sick', 'I woke up not feeling the greatest today.  My throat feels scratchy, my head hurts and I have been sneezing.  I hope its not the flu!', 'Korre Mayweather', '11-17-2017')
BlogPosts.create('I Feel Better', 'I feel much better today! A little cough medicine and plenty of fluids go a long way.  I feel right as rain!', 'Korre Mayweather', '11-19-2017')


// when the root of this router is called with GET, return
// all current blog posts
router.get('/', (req, res) => {
    res.json(BlogPosts.get());
  });


  // when a new blog post is posted, make sure it's
  // got required fields ('title', 'content', and 'author'). if not,
  // log an error and return a 400 status code. if okay,
  // add new item to BlogPost and return it with a 201.
  router.post('/', jsonParser, (req, res) => {
    // ensure `title`, `content` and `author` are in request body
    const requiredFields = ['title', 'content', 'author'];
    for (let i=0; i<requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`
        console.error(message);
        return res.status(400).send(message);
      }
    }
  
    const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
    res.status(201).json(item);
  });


  // when DELETE request comes in with an id in path,
  // try to delete that post from BlogPosts.
  router.delete('/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Deleted blog post \`${req.params.ID}\``);
    res.status(204).end();
  });

// when PUT request comes in with updated post, ensure it has
// required fields. also ensure that post id is in url path, and
// that the post id in the updated item object match. if there are
// problems with any of that, log error and send back status code 400.
// otherwise call `BlogPost.update` with updated post.
router.put('/:id', jsonParser, (req, res) => {
    const requiredFields = ['id','title', 'content', 'author'];
    for (let i=0; i<requiredFields.length; i++) {
      const field = requiredFields[i];
      if (!(field in req.body)) {
        const message = `Missing \`${field}\` in request body`
        console.error(message);
        return res.status(400).send(message);
      }
    }
    if (req.params.id !== req.body.id) {
      const message = (
        `Request path id (${req.params.id}) and request body id `
        `(${req.body.id}) must match`);
      console.error(message);
      return res.status(400).send(message);
    }
    console.log(`Updating blog post \`${req.params.id}\``);
    const updatedItem = BlogPosts.update({
      id: req.params.id,  
      title: req.body.title,
      content: req.body.name,
      author: req.body.budget,
      publishDate: req.body
    });
    res.status(204).end();
  })


  module.exports = router;