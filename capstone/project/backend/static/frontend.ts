// const connection = new WebSocket('wss://3t5d4gcuz4.execute-api.us-west-2.amazonaws.com/dev');


// connection.onopen = () => {
//   console.log('connected');
// };

// connection.onclose = () => {
//   console.error('disconnected');
// };

// connection.onerror = (error) => {
//   console.error('failed to connect', error);
// };

// connection.onmessage = (event) => {
//   console.log('received', event.data);
//   let li = document.createElement('li');
//   li.innerText = event.data;
//   document.querySelector('#chat').append(li);
// };

// document.querySelector('form').addEventListener('submit', (event) => {
//   event.preventDefault();
// //   let message = document.querySelector('#message').value;
//     let message = document.querySelector('textarea').value;
//     let formatted_message = '{\"action\":\"send\",\"message\":\"' +
//         message + '\"}'
//     connection.send(message);
// //   document.querySelector('#message').value = '';
//     document.querySelector('textarea').value = '';
// });