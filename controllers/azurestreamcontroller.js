const { containeraccess } = require("../azureconfig");
const Joi=require("joi");
const { trycatch } = require("../utils/tryCatch");


var get_public_data_from_azure=async(req,res,next)=>{
    const blobname = req.query.blobname;
   
  
    const schema = Joi.object({ 
      
      blobname:Joi.string().required(),
    
    });
  
  
    
    
    
    const { error } =  await schema.validateAsync({blobname});
  
    

  
    const blobClient = containeraccess.getBlockBlobClient(blobname);
  
    const blobProperties = await blobClient.getProperties();
    const { contentType, contentLength } = blobProperties;
    // console.log(contentType,contentLength)
  
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', contentLength);
    
   
    
  
  const downloadResponse = await blobClient.download(0);
  const stream = downloadResponse.readableStreamBody;
  stream.pipe(res);
  }

  get_public_data_from_azure=trycatch(get_public_data_from_azure);

  module.exports={get_public_data_from_azure}
  