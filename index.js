const http = require('http');
const fs = require('fs');

const PORT = 5500; //Se necesita ejecutar en el siguiente url http://localhost:5500/

const serveStaticFile = async (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, function(err, data) {
      if(err) reject(err);
      resolve(data);
    });
  });
} 

const sendResponse = (response, content, contentType) => {
  response.writeHead(200, {"Content-Type": contentType});
  response.end(content);
}

const handleRequest = async (request, response) => {
  const url = request.url;
  //Se incluye una impresion por consola para saber que peticion se está realizando
  console.log("Se ha solicitado un " + request.method);
  //En caso de ser una peticion get se ejecuta lo siguiente
  if(request.method === "GET"){
    let content;
    let contentType;
    switch(url){
      case "/":
      case "/index.html":
        content = await serveStaticFile("www/index.html");
        contentType = "text/html";
        break;
      case "/script.js":
        content = await serveStaticFile("www/script.js");
        contentType = "text/javascript";
        break;
      case "/style.css":
        content = await serveStaticFile("www/style.css");
        contentType = "text/css";
        break;
      //Se añade este case para contemplar solicitud al json
      case "/tasks.json":
        content = await serveStaticFile("tasks.json");
        contentType = "application/json";
        break;
      default: 
        content = "Ruta no v&aacutelida\r\n";
        contentType = "text/html";
      }
     sendResponse(response, content, contentType);
    }
  else if (request.method === "POST" && url === "/tasklist/update"){
    let requestBody = '';
  
    request.on('data', (chunk) => {
      requestBody += chunk.toString();
    });

    request.on('end', () => {
      try {
        //Se escribe el json al recibir el post
        const taskListData = JSON.parse(requestBody);
        fs.writeFile('tasks.json', JSON.stringify(taskListData), (err) => {
          if (err) {
            //En caso de producirse un error, se muestra por consola lo siguiente
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write("Se ha producido un error al actualizar el archivo tasks.json");
          } 
          else {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write("El archivo tasks.json se ha actualizado correctamente");
          }
          response.end();
        });
      } 
      catch (error) {
        response.writeHead(400, {"Content-Type": "text/plain"});
        response.write("Formato JSON inválido");
        response.end();
      }
    });
  }
  //En caso de no ser ninguna de las anteriores se muestra un mensaj
  else{
     response.writeHead(405, {"Content-Type": "text/html"});
     response.write(`Mensaje ${request.method} no permitido!\r\n`);
  }
}
const server = http.createServer(handleRequest);
server.listen(PORT);
console.log(`Listening on port ${PORT}`);