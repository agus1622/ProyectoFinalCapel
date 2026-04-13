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

document.getElementById("btnSaldoArs").addEventListener("click", () => {
    if (!usuarioActual) return;

    resultadoDiv.textContent = `Saldo en pesos: $${usuarioActual.saldoArs.toLocaleString()}`;

    usuarioActual.movimientos.push({
        tipo: "Consulta saldo en pesos",
        fecha: new Date().toLocaleString()
    });

    guardarEnStorage();
});

document.getElementById("btnSaldoDol").addEventListener("click", () => {
    if (!usuarioActual) return;

    resultadoDiv.textContent = `Saldo en dólares: U$D ${usuarioActual.saldoDol}`;

    usuarioActual.movimientos.push({
        tipo: "Consulta saldo en dólares",
        fecha: new Date().toLocaleString()
    });

    guardarEnStorage();
});

document.getElementById("btnPlazoFijo").addEventListener("click", () => {
    if (!usuarioActual) return;

    const monto = parseFloat(inputPlazoFijo.value);

    if (isNaN(monto) || monto <= 0) {
        resultadoDiv.textContent = "Ingresá un monto válido";
        return;
    }

    if (monto > usuarioActual.saldoArs) {
        resultadoDiv.textContent = "Saldo insuficiente";
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

    resultadoDiv.textContent =
        `Invertiste $${monto}. Ganancia: $${interes.toFixed(2)}. Total: $${total.toFixed(2)}`;

    inputPlazoFijo.value = "";
});

document.getElementById("btnMovimientos").addEventListener("click", () => {
    if (!usuarioActual) return;

    listaMovimientos.innerHTML = "";

    usuarioActual.movimientos.forEach(mov => {
        const li = document.createElement("li");
        li.textContent = `${mov.tipo} - ${mov.fecha}`;
        listaMovimientos.appendChild(li);
    });
});
