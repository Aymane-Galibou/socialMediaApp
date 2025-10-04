import multer from "multer";
import fs from 'fs'


export const fileTypes={
    image:["image/png","image/jpeg","image/gif"],
    video:["video/mp4"],
    audio:["audio/mp3"],
    pdf:["application/pdf"]
}
export const multerLocal=(customValidation=[],customPath)=>{
const fullpath=`./images/${customPath}`
if(!fs.existsSync(fullpath)){
    fs.mkdirSync(fullpath,{recursive:true})
}
function fileFilter (req, file, cb) {
  if(customValidation.includes(file.mimetype) ){
      cb(null, true)
  }else{
  cb(new Error('file type is not valid'))
  }
}


 const storageEngine=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,fullpath)
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+ '--' +file.originalname)
    }
})

 const upload=multer({storage:storageEngine,fileFilter})

return upload

}


export const multerCloudinary=(customValidation=[])=>{

function fileFilter (req, file, cb) {
  if(customValidation.includes(file.mimetype) ){
      cb(null, true)
  }else{
  cb(new Error('file type is not valid'))
  }
}


const storageEngine=multer.diskStorage({})

const upload=multer({storage:storageEngine,fileFilter})

return upload

}



