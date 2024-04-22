const mongoose = require('mongoose') ;
const Document = require('./Document') ;
const dotenv = require('dotenv').config() ;

mongoose.connect(process.env.MONGO_URI) ;

const io = require("socket.io")(3001 , {
    cors : {
        origin : "https://google-docs-clone-tawny.vercel.app" ,
        methods : ["GET" , "POST"]
    }
})

const DEFAULT_VALUE = "" ;

io.on("connection" , (socket) => {

    socket.on('get-document' , async (documentId)=>{
        const document = await findOrCreateDocument(documentId) ;
        socket.join(documentId) ;
        socket.emit('load-document' , document.data) ;

        socket.on("send-changes" , (delta)=>{
            socket.broadcast.to(documentId).emit("recieve-changes" , delta) ;
        })

        socket.on("save-document" , async data =>{
            await Document.findByIdAndUpdate(documentId , {data}) ;
        })

    })
})

async function findOrCreateDocument(id){
    if(id==null){
        return ;
    }

    const document = await Document.findById(id) ;
    if(document){
        return document ;
    }
    return await Document.create({_id : id , data : DEFAULT_VALUE}) ;
}


