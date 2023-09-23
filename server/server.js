const mongoose = require("mongoose");
const Document = require("./document");

mongoose.connect("mongodb://localhost/google-docs-clone");

const io = require("socket.io")(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("socket opened");
  socket.on("get-document",async (documentId) => {
    const document =  await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      console.log(delta);
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on('save-document', async (data) => {
        await Document.findByIdAndUpdate(documentId,{data})
    })
  });
});

const defaultValue = "";
const findOrCreateDocument = async (id) => {
    console.log(id) 
  if (id == null) return;
  const document = await Document.findById(id);
  console.log(document) 
  if (document) return document;
 return await Document.create({ _id:id, data: defaultValue });
};
