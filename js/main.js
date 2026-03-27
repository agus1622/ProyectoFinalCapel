/*  Ususario */

function Usuario(nombre, pin, saldoArs, saldoDol) {
    this.nombre = nombre;
    this.pin = pin;
    this.saldoArs = saldoArs;
    this.saldoDol = saldoDol;
    this.movimientos = [];
    this.depositar = function (monto) {
        this.saldoArs += monto;
        this.movimientos.push({
            tipo: "Depósito",
            monto: monto,
            fecha: new Date().toLocaleString()
        });
    };
}

let usuarios = [];
let usuarioActual = null;
const inputUsuario = document.getElementById("inputUsuario");


/*  Storage  */

function guardarEnStorage() {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function cargarDesdeStorage() {
    const data = JSON.parse(localStorage.getItem("usuarios"));

    if (data && data.length > 0) {
        usuarios = data.map(u => Object.assign(new Usuario(), u));
    } else {
        // Crear usuario inicial si no hay uno
        usuarios = [new Usuario("Javier", 5513, 1500000, 2300)];
        guardarEnStorage();
    }
}

cargarDesdeStorage();
console.log(usuarios);

/*  DOM  */

const btnLogin = document.getElementById("btnLogin");
const inputPin = document.getElementById("inputPin");
const mensajeLogin = document.getElementById("mensajeLogin");

const appSection = document.getElementById("app-section");
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

    if (encontrado) {
        usuarioActual = encontrado;

        loginSection.classList.add("hidden");
        appSection.classList.remove("hidden");

        nombreUsuarioSpan.textContent = usuarioActual.nombre;
        mensajeLogin.textContent = "";
    } else {
        mensajeLogin.textContent = "Usuario o PIN incorrecto";
    }
});

/*  Botones  */

document.getElementById("btnSaldoArs").addEventListener("click", () => {
    resultadoDiv.textContent = "Saldo en pesos: $" + usuarioActual.saldoArs;

    usuarioActual.movimientos.push({
        tipo: "Consulta saldo en pesos",
        fecha: new Date().toLocaleString()
    });

    guardarEnStorage();
});

document.getElementById("btnSaldoDol").addEventListener("click", () => {
    resultadoDiv.textContent = "Saldo en dólares: u$s" + usuarioActual.saldoDol;

    usuarioActual.movimientos.push({
        tipo: "Consulta saldo en dólares",
        fecha: new Date().toLocaleString()
    });

    guardarEnStorage();
});

const inputDeposito = document.getElementById("inputDeposito");

document.getElementById("btnDeposito").addEventListener("click", () => {

    const monto = parseFloat(inputDeposito.value);

    if (isNaN(monto) || monto <= 0) {
        resultadoDiv.textContent = "Ingresá un monto válido";
        return;
    }

    if (monto > usuarioActual.saldoArs * 10) {
        resultadoDiv.textContent = "Supera límite de depósito";
        return;
    }

    usuarioActual.depositar(monto);
    guardarEnStorage();

    resultadoDiv.textContent = "Depósito de $" + monto + " realizado con éxito";

    inputDeposito.value = "";
});


document.getElementById("btnMovimientos").addEventListener("click", () => {
    listaMovimientos.innerHTML = "";
    usuarioActual.movimientos.forEach((movimiento) => {
        const li = document.createElement("li");

        if (movimiento.tipo === "Depósito") {
            li.textContent = `${movimiento.tipo} de $${movimiento.monto} - ${movimiento.fecha}`;
        } else {
            li.textContent = `${movimiento.tipo} - ${movimiento.fecha}`;
        }

        listaMovimientos.appendChild(li);
    });
});


/* No es magia negra, es solo programación */
