const { BlobServiceClient } = require('@azure/storage-blob');

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);

const containerName = 'brain-rec-videos';
const containeraccess = blobServiceClient.getContainerClient(containerName);


module.exports = { containeraccess }