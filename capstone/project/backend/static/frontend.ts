const connection = new WebSocket('wss://pepbtca1zj.execute-api.us-west-2.amazonaws.com/dev');

connection.onopen = () => {
  console.log('connected');
  // // Get a randomly generated name from REST API
  // const url = 'http://names.drycodes.com/1?nameOptions=boy_names&separator=space'
  // const xmlHttp = new XMLHttpRequest();
  // xmlHttp.open( "GET", url, true);
  // console.log ('RESPONSE : ' + xmlHttp.responseText);
  connection.send("{\"action\":\"topic\",\"topic\":\"room1\"}");
  connection.send("{\"action\":\"alias\",\"alias\":\"User\"}");
};



connection.onclose = () => {
  console.error('disconnected');
};

connection.onerror = (error) => {
  console.error('failed to connect', error);
};

connection.onmessage = (event) => {
  console.log('received', event.data);
  let li = document.createElement('li');
  li.innerText = event.data;
  document.querySelector('#chat').append(li);
};

document.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
    let message = document.querySelector('textarea').value;
    let formatted_message = "{\"action\":\"send\",\"data\":\"" +
        message + "\"}"
    connection.send(formatted_message);
    document.querySelector('textarea').value = '';
});