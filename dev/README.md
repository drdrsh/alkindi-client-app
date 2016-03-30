# AlFehrest Graph Visualization Frontend

A very basic graph client side for the [NodeJS AlFehrest Graph Server](https://github.com/drdrsh/alfehrest_nodejs)

You will need to have [NodeJS](http://nodejs.org), [npm](http://npmjs.com), [grunt](http://gruntjs.com) and [bower](http://bower.io) installed for this to work. If you have all of those simply run the following


```shell
git clone https://github.com/drdrsh/alfehrest_graph_frontend.git .
npm install
grunt dev
grunt serve
```

And navigate to [http://localhost:9000/index.html](http://localhost:9000/index.html)

To generate distribution files run
```shell
grunt dist
```

### Some background

This demo is based on [visjs](http://visjs.org).