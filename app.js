import readlineSync from 'readline-sync';
import colors from 'colors';
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  modifyUserData,
  deleteUserAccount,
  createProducto,
  listarProductos,
  obtenerProducto,
  modificarProducto,
  eliminarProducto,
  initializeAdmin
} from './authAndProduct.js';

// Mostrar el menú inicial
function showMainMenu() {
  console.log('\n--- Menu de TrendyShop ---'.bgCyan.white.bold);
  console.log('1. Registrar usuario'.red.bold);
  console.log('2. Iniciar sesión'.blue.bold);
  console.log('3. Restablecer contraseña'.yellow.bold);
  console.log('4. Salir'.grey.bold);
}

// Menú para usuarios normales
function showUserMenu() {
  console.log('\n--- Menú de Usuario ---'.bgWhite.black.bold);
  console.log('1. Modificar mis datos'.magenta.bold);
  console.log('2. Eliminar mi usuario'.grey.bold);
  console.log('3. Listado de productos'.cyan.bold);
  console.log('4. Ver detalles de un producto específico'.blue.bold);
  console.log('5. Cerrar sesión'.red.bold);
}

// Menú para el administrador
function showAdminMenu() {
  console.log('\n--- Menú de Administrador ---'.bgGreen.white.bold);
  console.log('1. Modificar mis datos'.cyan.bold);
  console.log('2. Eliminar mi usuario'.white.bold);
  console.log('3. Crear un nuevo producto'.magenta.bold);
  console.log('4. Listado de todos los productos'.yellow.bold);
  console.log('5. Detalles de un producto en específico'.grey.bold);
  console.log('6. Editar un producto'.green.bold);
  console.log('7. Eliminar un producto'.red.bold);
  console.log('8. Cerrar sesión'.blue.bold);
}

// Función para obtener producto por su ID secuencial
async function obtenerProductoPorIdSecuencial(idSecuencial) {
  const productos = await listarProductos();
  if (productos) {
    return productos.find(producto => producto.idSecuencial === idSecuencial);
  }
  return null;
}

// Función para manejar el menú del administrador
async function handleAdminMenu(userLogged) {
  let adminOption = '';
  while (adminOption !== '8') {
    showAdminMenu();
    adminOption = readlineSync.questionInt('Seleccione una opción: ');

    switch (adminOption) {
      case 1:
        // Modificar mis datos
        const newNombre = readlineSync.question('Nuevo nombre: ');
        const newApellidos = readlineSync.question('Nuevos apellidos: ');
        const newEdad = readlineSync.questionInt('Nueva edad: ');
        await modifyUserData(userLogged.uid, newNombre, newApellidos, newEdad);
        break;

      case 2:
        // Eliminar mi usuario
        await deleteUserAccount(userLogged.uid);
        console.log("Usuario eliminado. Cerrando sesión...");
        return null; // Cerrar sesión
        break;

      case 3:
        // Crear nuevo producto
        const prodNombre = readlineSync.question('Nombre del producto: ');
        const prodCategoria = readlineSync.question('Categoria: ');
        const prodPrecio = readlineSync.questionFloat('Precio: ');
        const prodDescripcion = readlineSync.question('Descripción: ');
        const nuevoProducto = await createProducto(prodNombre, prodCategoria, prodPrecio, prodDescripcion);
        break;

      case 4:
        // Listado de productos
        const productosListado = await listarProductos();
        if (!productosListado) {
          console.log("No hay productos disponibles.".yellow);
        } else {
          productosListado.forEach((producto) => {
            console.log(`${producto.idSecuencial}. ${producto.nombre} (${producto.categoria}) - ${producto.precio} €`);
          });
        }
        break;

      case 5:
        // Ver detalles de producto específico
        const productosDetalles = await listarProductos();
        if (!productosDetalles) {
          console.log("No hay productos disponibles.".yellow);
        } else {
          const prodIdSecuencial = readlineSync.questionInt('ID del producto a ver: ');
          const productoDetalles = await obtenerProductoPorIdSecuencial(prodIdSecuencial);
          if (!productoDetalles) {
            console.log("El producto no existe.".red);
          } else {
            // Mostrar detalles en formato JSON bonito y coloreado
            console.log("\nDetalles del producto:".green);
            console.log(JSON.stringify(productoDetalles, null, 2).green);
          }
        }
        break;

      case 6:
        // Editar un producto
        const productosEditar = await listarProductos();
        if (!productosEditar) {
          console.log("No hay productos disponibles para editar.".yellow);
        } else {
          const prodIdEditar = readlineSync.questionInt('ID del producto a editar: ');
          const productoEditar = await obtenerProductoPorIdSecuencial(prodIdEditar);
          if (!productoEditar) {
            console.log("El producto no existe.".red);
          } else {
            const newNombreProd = readlineSync.question('Nuevo nombre: ');
            const newCategoria = readlineSync.question('Nueva categoría: ');
            const newPrecio = readlineSync.questionFloat('Nuevo precio: ');
            const newDescripcion = readlineSync.question('Nueva descripción: ');
            await modificarProducto(productoEditar.id, newNombreProd, newCategoria, newPrecio, newDescripcion);
          }
        }
        break;

      case 7:
        // Eliminar un producto
        const productosEliminar = await listarProductos();
        if (!productosEliminar) {
          console.log("No hay productos disponibles para eliminar.".yellow);
        } else {
          const prodIdEliminar = readlineSync.questionInt('ID del producto a eliminar: ');
          const productoEliminar = await obtenerProductoPorIdSecuencial(prodIdEliminar);
          if (!productoEliminar) {
            console.log("El producto no existe.".red);
          } else {
            await eliminarProducto(productoEliminar.id);
          }
        }
        break;

      case 8:
        // Cerrar sesión (para admin)
        await logoutUser();
        console.log('Sesión cerrada correctamente.'.yellow);
        return null; // Cerrar sesión
        break;

      default:
        console.log('Opción no válida.'.red);
    }
  }
}

// Función para manejar el menú del usuario normal
async function handleUserMenu(userLogged) {
  let userOption = '';
  while (userOption !== '5') {
    showUserMenu();
    userOption = readlineSync.questionInt('Seleccione una opción: ');

    switch (userOption) {
      case 1:
        // Modificar mis datos
        const newNombre = readlineSync.question('Nuevo nombre: ');
        const newApellidos = readlineSync.question('Nuevos apellidos: ');
        const newEdad = readlineSync.questionInt('Nueva edad: ');
        await modifyUserData(userLogged.uid, newNombre, newApellidos, newEdad);
        break;

      case 2:
        // Eliminar mi usuario
        await deleteUserAccount(userLogged.uid);
        console.log("Usuario eliminado. Cerrando sesión...");
        return null; // Cerrar sesión
        break;

      case 3:
        // Listar productos (para usuarios normales)
        const productos = await listarProductos();
        if (!productos) {
          console.log("No hay productos disponibles.".yellow);
        } else {
          productos.forEach((producto) => {
            console.log(`${producto.idSecuencial}. ${producto.nombre} (${producto.categoria}) - ${producto.precio} €`);
          });
        }
        break;

      case 4:
        // Ver detalles de producto específico (para usuarios normales)
        const productosDetalles = await listarProductos();
        if (!productosDetalles) {
          console.log("No hay productos disponibles.".yellow);
        } else {
          const prodIdSecuencial = readlineSync.questionInt('ID del producto a ver: ');
          const productoDetalles = await obtenerProductoPorIdSecuencial(prodIdSecuencial);
          if (!productoDetalles) {
            console.log("El producto no existe.".red);
          } else {
            // Mostrar detalles en formato JSON bonito y coloreado
            console.log("\nDetalles del producto:".green);
            console.log(JSON.stringify(productoDetalles, null, 2).green);
          }
        }
        break;

      case 5:
        // Cerrar sesión (para usuarios normales)
        await logoutUser();
        console.log('Sesión cerrada correctamente.'.yellow);
        return null; // Cerrar sesión
        break;

      default:
        console.log('Opción no válida.'.red);
    }
  }
}

// Función principal que inicia el menú de la aplicación
async function main() {
  await initializeAdmin(); // Inicializar el administrador si no existe
  let isRunning = true;
  let userLogged = null;

  while (isRunning) {
    if (!userLogged) {
      showMainMenu();
      const option = readlineSync.questionInt('Seleccione una opción: ');

      switch (option) {
        case 1:
          // Registro de usuarios
          const email = readlineSync.questionEMail('Email: ');
          const password = readlineSync.question('Password: ', { mask: '*' });
          const nombre = readlineSync.question('Nombre: ');
          const apellidos = readlineSync.question('Apellidos: ');
          const edad = readlineSync.questionInt('Edad: ');
          await registerUser(email, password, nombre, apellidos, edad);
          break;

        case 2:
          // Inicio de sesión
          const loginEmail = readlineSync.questionEMail('Email: ');
          const loginPassword = readlineSync.question('Password: ', { mask: '*' });
          const user = await loginUser(loginEmail, loginPassword);

          if (user) {
            if (user.admin) {
              console.log('Bienvenido Administrador');
              userLogged = { ...user, admin: true };
              userLogged = await handleAdminMenu(userLogged);
            } else {
              userLogged = { ...user, admin: false };
              userLogged = await handleUserMenu(userLogged);
            }
          } else {
            console.log('Error al iniciar sesión.'.red);
          }
          break;

        case 3:
          // Restablecer contraseña
          const resetEmail = readlineSync.questionEMail('Email para restablecer: ');
          await forgotPassword(resetEmail);
          break;

        case 4:
          // Salir de la aplicación
          console.log("Saliendo de TrendyShop...".red);
          isRunning = false;
          process.exit(0); // Cerrar la aplicación
          break;

        default:
          console.log('Opción no válida.'.red);
      }
    }
  }
}

// Ejecutar la aplicación
main();