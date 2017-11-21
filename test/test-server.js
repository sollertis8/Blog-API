const chai = require('chai');
const chaiHttp = require('chai-http');

const {
    app,
    runServer,
    closeServer
} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Blog Post', function (){
    before(function () {
        return runServer();
    });
    after(function () {
        return closeServer();
    });
   it('should list posts on GET', function () {
       return chai.request(app)
       .get('/blog-posts')
       .then(function (res) {
           res.should.have.status(200);
           res.should.be.json;
           res.body.should.be.a('array');
           res.body.length.should.be.at.least(1);

           const expectedKeys = ['id', 'title', 'content', 'author'];
           res.body.forEach(function (item) {
               item.should.be.a('object');
               item.should.include.keys(expectedKeys);
           });
       });
   });
   it('should add blog post on POST', function () {
       const newPost = {
           title: 'Miami Is the Best!',
           content: 'We went on a trip to Miami and had an AMAZING time!',
           author: 'Korrenti Mayweather',
           publishDate: '11-17-2017'
       };
       return chai.request(app)
       .post('/blog-posts')
       .send(newPost)
       .then(function (res) {
           res.should.have.status(201);
           res.should.be.json;
           res.body.should.be.a('object');
           res.body.should.include.keys('id', 'title', 'content', 'author');
           res.body.id.should.not.be.null;
           res.body.should.deep.equal(Object.assign(newPost, { 
               id: res.body.id
           }));
       });
   });

   it('should update posts on PUT', function () {
       const updateData = {
           title: 'foo',
           content: 'fizz bizz bang!',
           author: 'Joe Schmo',
           publishDate: '11-11-2017'
       };
       return chai.request(app)
       .get('/blog-posts')
       .then(function (res) {
           updateData.id = res.body[0].id;
           return chai.request(app)
           .put(`/blog-posts/${updateData.id}`)
           .send(updateData);
       })
       .then(function (res) {
           res.should.have.status(204);
       });
   });
   it('should delete posts on DELETE', function () {
       return chai.request(app)
       .get('/blog-posts')
       .then(function (res) {
           return chai.request(app)
           .delete(`/blog-posts/${res.body[0].id}`);
       })
       .then(function (res) {
           res.should.have.status(204);
       });
   });
});