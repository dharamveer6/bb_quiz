const amqp = require('amqplib');
// const { rabbit_host_name } = require('./env');

async function connectToRabbitMQ() {

  // console.log(process.env.rabbit_host_name)
  try {
   
    const connection = await amqp.connect(`amqp://${process.env.rabbit_user}:${process.env.rabbit_password}@${process.env.rabbit_host_name}:${process.env.rabbit_host_port}`);
     let channel = await connection.createChannel();

   
     await channel.assertQueue("forgetpassemail", { durable: true });
    //  await channel.assertQueue("store_data_on_azure", { durable: false });
    //  await channel.assertQueue("store_prerec__question_excel", { durable: false });

    
 
    //  await channel.prefetch(1); 
     return channel
  }
  catch(err){
console.log(err)
  }

}



// const amqp = require('amqplib');

// let connection;
// let channel;

// async function connectToRabbitMQ() {
//     try {
//         if (!connection) {
//             connection = await amqp.connect(`amqp://${process.env.rabbit_user}:${process.env.rabbit_password}@${process.env.rabbit_host_name}:${process.env.rabbit_host_port}`);
//         }

//         if (!channel) {
//             channel = await connection.createChannel();
//         }

//         return channel;
//     } catch (err) {
//         console.error('Error connecting to RabbitMQ:', err);
//         throw err;
//     }
// }

module.exports={connectToRabbitMQ}