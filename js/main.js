/*  Ususario */

function Usuario(nombre, pin, saldoArs, saldoDol) {
    this.nombre = nombre;
    this.pin = pin;
    this.saldoArs = saldoArs;
    this.saldoDol = saldoDol;
    this.movimientos = [];
}

let usuarios = [];
let usuarioActual = null;
const COTIZACION_DOLAR = 1390;


/*  Storage  */

function guardarEnStorage() {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function cargarDesdeStorage() {
    const data = JSON.parse(localStorage.getItem("usuarios"));

    if (data && data.length > 0) {
        usuarios = data.map(u => Object.assign(new Usuario(), u));
    } else {
        usuarios = [
            new Usuario("Agus1622", 4264, 150000, 3000),
            new Usuario("JuanBlas", 1234, 80000, 200),
            new Usuario("JavierG", 5513, 2300000, 3000)
        ];
        guardarEnStorage();
    }
}

cargarDesdeStorage();


/*  DOM  */

const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");

const inputUsuario = document.getElementById("inputUsuario");
const inputPin = document.getElementById("inputPin");
const inputPlazoFijo = document.getElementById("inputPlazoFijo");

const mensajeLogin = document.getElementById("mensajeLogin");

const appSection = document.getElementById("appSection");
const loginSection = document.getElementById("login-section");

const nombreUsuarioSpan = document.getElementById("nombreUsuario");
const resultadoDiv = document.getElementById("resultado");
const listaMovimientos = document.getElementById("listaMovimientos");


/*  Login  */

btnLogin.addEventListener("click", () => {

    const nombre = inputUsuario.value.trim().toUpperCase();
    const pin = parseInt(inputPin.value);

    if (nombre === "" || isNaN(pin)) {
        mensajeLogin.textContent = "Completar todos los campos";
        return;
    }

    const encontrado = usuarios.find(u =>
        u.nombre.toUpperCase() === nombre && u.pin === pin
    );

    if (!encontrado) {
        mensajeLogin.textContent = "Usuario o PIN incorrecto";
        return;
    }

    usuarioActual = encontrado;

    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    mensajeLogin.textContent = "";

    mostrarCuenta(usuarioActual.nombre).then(() => {
        nombreUsuarioSpan.textContent =
            usuarioActual.nombreCompleto || usuarioActual.nombre;
    });

    btnLogout.classList.remove("hidden");
});


/*  Logout  */

btnLogout.addEventListener("click", () => {

    usuarioActual = null;

    appSection.classList.add("hidden");
    loginSection.classList.remove("hidden");

    resultadoDiv.textContent = "";
    listaMovimientos.innerHTML = "";

    btnLogout.classList.add("hidden");
});


/*  Botones  */

document.getElementById("btnConfirmarTransferencia").addEventListener("click", () => {
    if (!usuarioActual) return;

    const destinoNombre = document.getElementById("inputDestino").value.trim().toUpperCase();
    const monto = parseFloat(document.getElementById("inputTransferencia").value);

    if (destinoNombre === "") {
        Swal.fire({
            icon: "error",
            title: "Datos insuficientes",
            text: "Ingresá un usuario de destino"
        });
        return;
    }

    const destino = usuarios.find(u => u.nombre.toUpperCase() === destinoNombre);

    if (!destino) {
        Swal.fire({
            icon: "error",
            title: "Error en transferencia",
            text: "El usuario ingresado no existe"
        });
        return;
    }

    if (destino === usuarioActual) {
        Swal.fire({
            icon: "error",
            title: "Error en transferencia",
            text: "No podés transferirte a vos mismo"
        });
        return;
    }

    if (isNaN(monto) || monto <= 0) {
        Swal.fire({
            icon: "error",
            title: "Monto inválido",
            text: "Por favor, ingresá un monto para continuar"
        });
        return;
    }

    if (monto > usuarioActual.saldoArs) {
        Swal.fire({
            icon: "error",
            title: "Saldo insuficiente",
            text: "No tenés fondos disponibles"
        });
        return;
    }

    usuarioActual.saldoArs -= monto;
    destino.saldoArs += monto;

    usuarioActual.movimientos.push({
        tipo: `Transferencia enviada a ${destino.nombre} por $${monto.toLocaleString("es-AR")}`,
        fecha: new Date().toLocaleString()
    });

    destino.movimientos.push({
        tipo: `Transferencia recibida de ${usuarioActual.nombre} por $${monto.toLocaleString("es-AR")}`,
        fecha: new Date().toLocaleString()
    });

    guardarEnStorage();
    mostrarCuenta(usuarioActual.nombre);

    Swal.fire({
        icon: "success",
        title: "Transferencia exitosa",
        text: `Enviaste $${monto.toLocaleString("es-AR")} a ${destino.nombre}`
    });

    document.getElementById("inputDestino").value = "";
    document.getElementById("inputTransferencia").value = "";
});


document.getElementById("btnConfirmarCompra").addEventListener("click", () => {
    if (!usuarioActual) return;

    const monto = parseFloat(document.getElementById("inputCompraDol").value);

    if (isNaN(monto) || monto <= 0) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ingresá un monto válido"
        });
        return;
    }

    if (monto > usuarioActual.saldoArs) {
        Swal.fire({
            icon: "error",
            title: "Saldo insuficiente",
            text: "No tenés fondos disponibles"
        });
        return;
    }

    const dolares = monto / COTIZACION_DOLAR;

    usuarioActual.saldoArs -= monto;
    usuarioActual.saldoDol += dolares;

    usuarioActual.movimientos.push({
        tipo: `Compra de USD por $${monto.toLocaleString("es-AR")}`,
        fecha: new Date().toLocaleString()
    });

    guardarEnStorage();
    mostrarCuenta(usuarioActual.nombre);

    Swal.fire({
        icon: "success",
        title: "Compra realizada",
        text: `Compraste U$D ${dolares.toFixed(2)}`
    });

    document.getElementById("inputCompraDol").value = "";
});

document.getElementById("btnConfirmarPlazoFijo").addEventListener("click", () => {
    if (!usuarioActual) return;

    const monto = parseFloat(inputPlazoFijo.value);

    if (isNaN(monto) || monto <= 0) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Ingresá un monto válido"
        });
        return;
    }

    if (monto > usuarioActual.saldoArs) {
        Swal.fire({
            icon: "error",
            title: "Saldo insuficiente",
            text: "No tenés fondos disponibles"
        });
        return;
    }

    const interes = (monto * 0.20) / 360 * 30;
    const total = monto + interes;

    usuarioActual.saldoArs -= monto;

    usuarioActual.movimientos.push({
        tipo: `Plazo fijo por $${monto.toLocaleString("es-AR")}`,
        fecha: new Date().toLocaleString()
    });

    guardarEnStorage();
    mostrarCuenta(usuarioActual.nombre);

    Swal.fire({
        icon: "success",
        title: "Plazo fijo constituido",
        html: `
            Invertiste $${monto.toLocaleString("es-AR")}<br>
            Ganancia: $${interes.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>
            Total a acreditar: $${total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        `
    });

    inputPlazoFijo.value = "";
});

document.getElementById("btnMovimientos").addEventListener("click", () => {
    if (!usuarioActual) return;

    listaMovimientos.innerHTML = "";

    if (usuarioActual.movimientos.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No hay movimientos para mostrar";
        listaMovimientos.appendChild(li);
        return;
    }

    usuarioActual.movimientos.forEach(mov => {
        const li = document.createElement("li");
        li.textContent = `${mov.tipo} - ${mov.fecha}`;
        listaMovimientos.appendChild(li);
    });
});

/* Despleagble */

const botones = document.querySelectorAll(".btn-toggle");

botones.forEach(boton => {
    boton.addEventListener("click", () => {

        const contenido = boton.nextElementSibling;

        document.querySelectorAll(".contenido").forEach(c => {
            if (c !== contenido) {
                c.classList.remove("activo");
            }
        });

        contenido.classList.toggle("activo");
    });
});
