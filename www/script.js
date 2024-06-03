//Es mejor definir la lista como let para que pueda cambiar sin problemas en funcion de las peticiones de un usuario
let taskList = [];

//Definida como funcion asincrona para poder hacer uso de await
async function actualizandoJson(){
  try {
    const respuesta = await fetch("http://localhost:5500/tasklist/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskList),
    });
    // Condicional para evaluar posible error al transmitir el POST
    if (!respuesta.ok) {
      throw new Error("Se ha producido un error al enviar la solicitud POST");
    }
    // Se muestra un mensaje de éxito que indica que todo ha ido bien y el json se ha actualizado
    console.log("El contenido del fichero tasks.json se ha actualizado con éxito");
  } catch (error) {
    console.error("Se ha producido un error al enviar la solicitud POST", error);
  }
}

const loadTasks = async() => {
  const contenedorTareas = document.getElementById("tasks-list-container");
  const respuesta = await fetch("/tasks.json");
  const reply = await respuesta.json();
  taskList = reply;
  longLista = taskList.length;
  //Se evalua si la lista de tareas esta vacia
  if (longLista == 0){
    contenedorTareas.textContent = "Se ha producido un error al cargar las tareas";
    return;
  }
  else{
    //En caso de que haya tareas en la lista, se crean todos los botones necesarios para ello
    for (let i = 0; i < longLista; i++) {
      //Las tareas seran de tipo boton, para que el usuario pueda presionarlas e interactuar con ellas
      let tarea = document.createElement("button");
      //Se le otorgan atributos para que se pueda configurar en el css
      tarea.setAttribute("class", "botones-tarea");
      tarea.setAttribute("id", taskList[i].id);
      //Se le asigna al boton el texto correspondiente al registrado en la lista
      tarea.textContent = taskList[i].title;
      tarea.setAttribute("done", taskList[i].done);
      //Se evalua si la tarea ha sido terminada o no y por tanto, la tendra que tachar
      if (taskList[i].done) {
        tarea.style.textDecoration = "line-through";
        //Se cambia el fondo a verde para indicar que esta terminada 
        tarea.style.backgroundColor = "rgb(69, 184, 69)";
      }
      //Se añade el boton al contenedor correspondiente
      contenedorTareas.appendChild(tarea);
      //Se invoca a las otras funcionalidades de marcar y eliminar para cada uno de los eventos
      toggleDone(tarea, i);
      remove(tarea);
    }
  }
}


const add = () => {
  /*Esta funcion sirve para añadir un elemento a la lista*/
  const contenedorLista = document.getElementById("tasks-list-container");
  let titulo = document.getElementById("task-name").value;
  let indiceTarea = taskList.length; //Se almacena el valor del tamaño de la lista para luego asignarlo como el id de la nueva tarea
  //Condicional para evaluar si el usuario trata de incluir una tarea vacía
  if (titulo == "") {
    alert("Debes asignarle un nombre a la tarea");
  } 
  else {
    //Se añade el boton de la tarea deseada
    let nuevaTarea = { id: indiceTarea + 1, title: titulo, done: false };
    //Se crea la tarea en el html (visible para el usuario en la lista)
    taskList.push(nuevaTarea);
    //Las tareas seran de tipo boton, para que el usuario pueda presionarlas e interactuar con ellas
    let tarea = document.createElement("button");
    //Se le otorgan atributos para que se pueda configurar en el css
    tarea.setAttribute("class", "botones-tarea");
    tarea.setAttribute("id", tarea.id);
    //Se le asigna al boton el texto correspondiente al registrado en la lista
    tarea.textContent = titulo;
    //Se evalua si la tarea ha sido terminada o no y por tanto, la tendra que tachar
    if (nuevaTarea.done) {
      tarea.style.textDecoration = "line-through";
    }
    //Se elimina el valor introducido para la nueva tarea del boton de incluir texto
    let tareaIntroducida = document.getElementById("task-name");
    tareaIntroducida.value = "";
    //Se añade el boton al contenedor correspondiente
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
    contenedorLista.appendChild(tarea);
    //Se invoca a las otras funcionalidades de marcar y eliminar para cada uno de los eventos
    toggleDone(tarea, nuevaTarea.id - 1);
    remove(tarea); 
    actualizandoJson();
  }
}

const remove = (tarea) => {
  /*Esta funcion sirve para eliminar un elemento de la lista si se desliza el dedo a la derecha sobre la tarea*/
  let comienzoPulsacionX;
  let finPulsacionX;
  //Se obtiene la lista de tareas que se encuentran visibles en el html
  let contenedorLista = document.getElementById("tasks-list-container");
  //Se incluyen event listeners para detectar dichas pulsaciones
  tarea.addEventListener("touchstart", function (evento) { 
    //Este sirve para detectar el la posicion inicial de la pulsacion del usuario
    const toque = evento.changedTouches[0];
    //Se guarda la coordenada X del toque inicial
    comienzoPulsacionX = toque.clientX;
  });
  tarea.addEventListener("touchend", function (evento) {
    //Por ultimo se evalua hasta donde ha desplazado el dedo el usuario
    const toque = evento.changedTouches[0];
    finPulsacionX = toque.clientX;
    //En caso de que el desplazamiento recorrido sea mayor de 50 pixeles, quiere decir que se ha deslizado el dedo a la derecha
    if ((finPulsacionX - comienzoPulsacionX) > 50){
      //Se obtiene el ID de la tarea
      const taskId = tarea.getAttribute("id");
      //Se elimina la tarea del array taskList
      taskList = taskList.filter(task => task.id !== parseInt(taskId));
      //Se elimina la tarea
      tarea.parentNode.removeChild(tarea);
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
      //Se actualiza el JSON
      actualizandoJson();
    }
  });
}

const toggleDone = (tarea, id) => {
  /*Funcion que se ejecuta mantener el dedo en una tarea más de dos segundos. 
  Como resultado, se marcará la tarea como completada */
  let pulsacion;
  tarea.addEventListener("touchstart", function(evento) {
    //Se evalua la pulsacion del usuario sobre el boton
    pulsacion = setTimeout(function() {
      if (taskList[id] && taskList[id].done == false){
        taskList[id].done = true;
        tarea.style.textDecoration = 'line-through';
        //Se cambia el fondo a verde para indicar que esta terminada 
        tarea.style.backgroundColor = "rgb(69, 184, 69)"; 
      }
      else if (taskList[id]){
        taskList[id].done = false;
        tarea.style.textDecoration = 'none';
        //Se devuelve a rojo el boton para indicar que no esta terminada
        tarea.style.backgroundColor = "#c21b1b"; 
      }
    }, 2000)  //En caso de que se pulse mas de 2 segundos
  });
  if ('vibrate' in navigator) {
    navigator.vibrate(100);
  }
  tarea.addEventListener("touchend", function(evento) {
    clearTimeout(pulsacion);
    actualizandoJson();
  });
}

const addButton = document.querySelector("#fab-add");
addButton.addEventListener("touchend", add);

//Se activa la aplicación para actualizar la lista de tareas
loadTasks();
