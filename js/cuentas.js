function mostrarCuenta(nombreUsuario) {
    return fetch("cuentas.json")
        .then(response => response.json())
        .then(cuentas => {

            const contenedor = document.getElementById("info");
            contenedor.innerHTML = "";

            const cuenta = cuentas.find(
                c => c.usuario.toUpperCase() === nombreUsuario.toUpperCase()
            );

            if (cuenta) {

                if (usuarioActual.saldoArs === undefined) {
                    usuarioActual.saldoArs = cuenta.saldoArs;
                    usuarioActual.saldoDol = cuenta.saldoDol;
                }

                usuarioActual.numeroCuenta = cuenta.numeroCuenta;
                usuarioActual.nombreCompleto = `${cuenta.nombre} ${cuenta.apellido}`;

                contenedor.innerHTML = `
                    <p>N° Cuenta: ${usuarioActual.numeroCuenta}</p>
                    <p>Saldo ARS: $${usuarioActual.saldoArs.toLocaleString()}</p>
                    <p>Saldo USD: U$D ${usuarioActual.saldoDol}</p>
                `;
                
            } else {
                contenedor.innerHTML = "<p>No se encontró la cuenta</p>";
            }

            return cuenta;
        });
}