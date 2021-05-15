const db = require("../models");
const Gif = db.gif;
 
 

exports.saveGIF = (req, res) => {
  const gif = new Gif({
    url: req.body.url,
    category: req.body.category,
    tags: req.body.tags,
  })

  gif.save((err, gif) => {
    if (err) {
      res.status(400).send({ message: err });
    }

    res.send({ message: "GIF was registered successfully!" });
  })
 
};


exports.searchGIFS = async (req, res) => {
  console.log(req.query)
  let text = null;

  if(req.query && req.query.text)
    text = req.query.text;

  Gif.find( { $text: { $search: text || '' } } )
  .exec((err, gifs) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (!gifs) {
      return res.status(404).send({ message: "Gifs Not found." });
    } 
 
    res.status(200).send(gifs);
  });

}

exports.queryGIFS = async (req, res) => {
  
  const sort = { length: 1 };
  const limit = (req.query && Number(req.query.limit)) || 4;
  const skip = (req.query && Number(req.query.skip)) || 0;
 
  Gif.find()
  .sort(sort).limit(limit).skip(skip)
  .exec((err, gifs) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (!gifs) {
      return res.status(404).send({ message: "Gifs Not found." });
    } 
 
    res.status(200).send(gifs);
  });
};