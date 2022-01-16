"use strict";

const IDBImagenes = indexedDB.open("AlmacenSpan",1);
let botonHeader = document.querySelector("header>button");
let divHeader = document.querySelector("header>div");
let pantallaPrincipal = document.querySelector("main>section:nth-of-type(1)");
let pantallaSecundaria = document.querySelector("main>section:nth-of-type(2)");
let opcionAtras = document.querySelector("main>section:nth-of-type(2)>div:nth-of-type(2)>button:nth-of-type(1)");
let divCargar = document.querySelector("#divAccion");
let opcionCargar = document.querySelector("main>section:nth-child(2)>label>input");
let botonSiguiente = document.querySelector("main>section:nth-child(2)>div:nth-child(4)>button.fa.fa-check");
let cambiarFondo = document.querySelectorAll("main>section:nth-of-type(1)>div>div");
let viejoDiv,temporalImg = [],posicionImg,documentFragment = document.createDocumentFragment(),temporalResult = [];

const webWorker = new Worker("WebWorker.js");

const createRowDB = function (objetoSpan){
    const DBImagenes = IDBImagenes.result;
    const IDBTransaction = DBImagenes.transaction("spanImagenes","readwrite");
    const objectStore = IDBTransaction.objectStore("spanImagenes");
    objectStore.add(objetoSpan);
    IDBTransaction.addEventListener("complete",()=>{
        alert("Opcion Registrada Correctamente");
    });
}

const readRowDB = function (){
    const DBImagenes = IDBImagenes.result;
    const IDBTransaction = DBImagenes.transaction("spanImagenes","readonly");
    const objectStore = IDBTransaction.objectStore("spanImagenes");
    const cursor = objectStore.openCursor();
    divHeader.innerHTML = "";
    cursor.addEventListener("success",()=>{
        if (cursor.result) {
            temporalResult.push([cursor.result.value.imagen,cursor.result.key]);
            cursor.result.continue();
        }else {
            for(let temporal in temporalResult){
                const archivo = temporalResult[temporal][0];
                const leerArchivo = new FileReader();
                leerArchivo.readAsDataURL(archivo);
                leerArchivo.addEventListener("load",(evt)=>{
                    nuevoSpan(`url("${evt.currentTarget.result}")`,1, temporalResult[temporal][1]);
                    if(documentFragment.childNodes.length==temporalResult.length){
                        if (documentFragment.childNodes.length!=0) {
                            divHeader.appendChild(documentFragment);
                            temporalResult = [];
                        }
                    }
                });
            }
        }
    });
}

const eliminarDivImagen = function (viejoDiv,temporalImagen){
    let opcionEliminarDiv = document.querySelector("#divAccionNueva > i");
    posicionImg = temporalImagen-1;
    opcionEliminarDiv.addEventListener("click",(evt)=>{
        if (confirm("Esta Seguro De Eliminar La Carga")) {
            setTimeout(()=>{
                evt.target.parentElement.parentElement.replaceChild(viejoDiv,evt.target.parentElement);
                opcionEliminarDiv = document.querySelector("#divAccion");
                opcionEliminarDiv.nextElementSibling.style.display = "initial";
                posicionImg = null;
                temporalImg.splice(temporalImagen-1,1);
                opcionCargar.value = "";
            },100);
        }
    });
    opcionEliminarDiv.addEventListener("mouseover",(evt)=>{
        evt.target.parentElement.style.animation = "shake-bottom 0.8s cubic-bezier(0.455, 0.030, 0.515, 0.955) both";
    });
    opcionEliminarDiv.addEventListener("mouseout",(evt)=>{
        evt.target.parentElement.style.animation = "";
    });
    opcionEliminarDiv.parentElement.addEventListener("mouseover",(evt)=>{
        opcionEliminarDiv.style.display = "flex";
    });
    opcionEliminarDiv.parentElement.addEventListener("mouseout",(evt)=>{
        opcionEliminarDiv.style.display = "none";
    });
}

const validarImagen = function (tipoArchivo,archivo){
    if(tipoArchivo.includes("image")) {
        const leerArchivo = new FileReader();
        leerArchivo.readAsDataURL(archivo);
        leerArchivo.addEventListener("load",(evt)=>{
            let nuevoDiv = document.createElement("DIV");
            nuevoDiv.setAttribute("id","divAccionNueva");
            nuevoDiv.style.backgroundImage = `url("${evt.currentTarget.result}")`;
            nuevoDiv.innerHTML = `<i class="fa fa-close"></i>`;
            divCargar.nextElementSibling.style.display = "none";
            viejoDiv = divCargar.parentElement.replaceChild(nuevoDiv,divCargar);
            eliminarDivImagen(viejoDiv,temporalImg.push(archivo));
        });
    }else{
        alert("Solo Puedes Cargar Imagenes");
    }  
}

const eventoSpan = function (spanActual,opcion,key){
    if (!opcion) {
        spanActual.lastChild.addEventListener("click",(evt)=>{
            if (confirm("Esta Seguro De Eliminar La Opcion")) {
                setTimeout(()=>{
                    evt.target.parentElement.parentElement.removeChild(evt.target.parentElement);
                    const DBImagenes = IDBImagenes.result;
                    const IDBTransaction = DBImagenes.transaction("spanImagenes","readwrite");
                    const objectStore = IDBTransaction.objectStore("spanImagenes");
                    objectStore.delete(key);
                    IDBTransaction.addEventListener("complete",()=>{
                        alert("Eliminado Correctamente");
                    });
                },100);
            }
        });
        spanActual.lastChild.addEventListener("mouseover",(evt)=>{
            evt.target.parentElement.style.animation = "shake-bottom 0.8s cubic-bezier(0.455, 0.030, 0.515, 0.955) both";
        });
        spanActual.lastChild.addEventListener("mouseout",(evt)=>{
            evt.target.parentElement.style.animation = "";
        });
        spanActual.addEventListener("mouseover",(evt)=>{
            spanActual.lastChild.style.display = "flex";
        });
        spanActual.addEventListener("mouseout",(evt)=>{
            spanActual.lastChild.style.display = "none";
        });
        spanActual.addEventListener("dragstart",(evt)=>{
            if (evt.target.localName=="i") evt.dataTransfer.setData("Background-Image",evt.target.previousElementSibling.style.backgroundImage);
            else evt.dataTransfer.setData("Background-Image",evt.target.style.backgroundImage);
        });
    }    
    if (opcion) createRowDB({imagen : temporalImg[posicionImg]});
    return spanActual;
}

const nuevoSpan = function (fondoImagen,eliminarDiv,key){
    if (eliminarDiv!=1) {
        eventoSpan(null,true,0);
        eliminarDiv.parentElement.replaceChild(viejoDiv,eliminarDiv);
        let opcionEliminarDiv = document.querySelector("#divAccion");
        opcionEliminarDiv.nextElementSibling.style.display = "initial";
    }else{
        let newSpan = document.createElement("SPAN");
        let newI = document.createElement("I");
        let nextSpan = document.createElement("SPAN");
        newI.className = "fa fa-close";
        nextSpan.style.backgroundImage = fondoImagen;
        nextSpan.setAttribute("draggable","true");
        newSpan.appendChild(nextSpan);
        newSpan.appendChild(newI);
        documentFragment.appendChild(eventoSpan(newSpan,false,key));
    }
}

const cambiarBackground = function (divCambiar,linkImagen){
    divCambiar.innerHTML = "";
    divCambiar.style.backgroundImage = linkImagen;
}

//Base De Datos
IDBImagenes.addEventListener("upgradeneeded",()=>{
    const DBImagenes = IDBImagenes.result;
    DBImagenes.createObjectStore("spanImagenes",{autoIncrement: true});
});

IDBImagenes.addEventListener("success",readRowDB);

IDBImagenes.addEventListener("error",()=>{console.log("Algo No Ocurrio Correctamente")});

botonHeader.addEventListener("click",()=>{
    pantallaPrincipal.style.transform = "translateX(100%)";
    pantallaSecundaria.style.transform = "translateX(0)";
    pantallaSecundaria.style.transition = "transform 2s";
    botonHeader.style.display = "none";
});

opcionAtras.addEventListener("click",()=>{
    pantallaPrincipal.style.transform = "translateX(0)";
    pantallaSecundaria.style.transform = "translateX(100%)";
    pantallaSecundaria.style.transition = "transform 2s";
    botonHeader.style.display = "initial";
});

divCargar.addEventListener("dragover",(evt)=>{
    evt.preventDefault();
    evt.target.style = `font-size: 1.8rem;
    border: 5px dashed rgb(235, 230, 230);
    border-bottom: 5px dashed rgb(31, 28, 28);
    border-right: 5px dashed rgb(31, 28, 28);`;
});

divCargar.addEventListener("drop",(evt)=>{
    evt.preventDefault();
    divCargar.removeAttribute("style");
    if (evt.dataTransfer.files.length>1) alert("No Es Posible Cargar Varias Imagenes");
    else if(evt.dataTransfer.files[0]==undefined)  alert("No Es Posible Esta Caracteristica");
    else validarImagen(evt.dataTransfer.files[0].type,evt.dataTransfer.files[0]);   
});

divCargar.addEventListener("dragleave",(evt)=>{
    evt.preventDefault();
    evt.target.removeAttribute("style");
});

opcionCargar.addEventListener("change",(evt)=>{
    if (opcionCargar.files.length>=1) validarImagen(opcionCargar.files[0].type,opcionCargar.files[0]);
});

botonSiguiente.addEventListener("click",(evt)=>{
    let opcionEliminarDiv = document.querySelector("#divAccionNueva");
    if (opcionEliminarDiv==null) alert("No Ha Cargado Ninguna Imagen");
    else {
        nuevoSpan(opcionEliminarDiv.style.backgroundImage,opcionEliminarDiv,0);
        readRowDB();
    }
});

for (let index = 0; index < cambiarFondo.length; index++) { 
    cambiarFondo[index] .addEventListener("dragover",(evt)=>{
        evt.preventDefault();
        evt.target.style.transform = `scale(1.2)`;
    });
    
    cambiarFondo[index] .addEventListener("drop",(evt)=>{
        evt.preventDefault();
        cambiarFondo[index].style.transform = "";
        if(evt.dataTransfer.getData("Background-Image")=="") alert("Solo Se Puede Con Las Opciones Que Cargaste");
        else cambiarBackground(cambiarFondo[index],evt.dataTransfer.getData("Background-Image"));
    });
    
    cambiarFondo[index] .addEventListener("dragleave",(evt)=>{
        evt.preventDefault();
        evt.target.style.transform = "";
    });  
}
