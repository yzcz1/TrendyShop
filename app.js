import readlineSync from 'readline-sync';
import colors from 'colors';
import { registerUser, loginUser, logoutUser, forgotPassword, modifyUserData, deleteUserAccount, createProducto, listarProductos, obtenerProducto, modificarProducto, eliminarProducto, initializeAdmin } from './auth.js';
import { doc, getDoc, db } from './firebase.js';

// Mostrar el menú inicial
function showMainMenu() {
  console.log('\n--- Menu de TrendyShop ---'.bgCyan.white.bold);
  console.log('1. Registrar usuario'.white);
  console.log('2. Iniciar sesión'.green);
  console.log('3. Restablecer contraseña'.cyan);
  console.log('4. Salir'.red);
}

// Menú para usuarios normales
function showUserMenu() {
  console.log('\n--- Menú de Usuario ---'.bgGreen.white.bold);
  console.log('1. Modificar mis datos'.white);
  console.log('2. Eliminar mi usuario'.red);
  console.log('3. Listado de productos'.cyan);
  console.log('4. Ver detalles de un producto específico'.cyan);
  console.log('5. Cerrar sesión'.yellow);
}

// Menú para el administrador
function showAdminMenu() {
  console.log('\n--- Menú de Administrador ---'.bgGreen.white.bold);
  console.log('1. Modificar mis datos'.white);
  console.log('2. Eliminar mi usuario'.red);
  console.log('3. Crear un nuevo producto'.cyan);
  console.log('4. Listado de todos los productos'.green);
  console.log('5. Detalles de un producto en específico'.yellow);
  console.log('6. Editar un producto'.yellow);
  console.log('7. Eliminar un producto'.yellow);
  console.log('8. Cerrar sesión'.yellow);
}

// Función para obtener los datos del usuario desde Firestore
async function obtenerDatosUsuario(uid) {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    console.log('El usuario no existe.');
    return null;
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
          const password = readlineSync.question('Password: ', { hideEchoBack: true });
          const nombre = readlineSync.question('Nombre: ');
          const apellidos = readlineSync.question('Apellidos: ');
          const edad = readlineSync.questionInt('Edad: ');
          await registerUser(email, password, nombre, apellidos, edad);
          break;

        case 2:
          // Inicio de sesión
          const loginEmail = readlineSync.questionEMail('Email: ');
          const loginPassword = readlineSync.question('Password: ', { hideEchoBack: true });
          const user = await loginUser(loginEmail, loginPassword);

          if (user) {
            if (user.email === 'admin@gmail.com') {
              console.log('Bienvenido Administrador');
              userLogged = { ...user, admin: true };
            } else {
              userLogged = { ...user, admin: false };
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
          console.log('Opción no válida.');
      }
    } else {
      if (userLogged.admin) {
        showAdminMenu();
      } else {
        showUserMenu();
      }
      const userOption = readlineSync.questionInt('Seleccione una opción: ');

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
          userLogged = null;
          break;

        case 3:
          if (userLogged.admin) {
            // Crear nuevo producto
            const prodNombre = readlineSync.question('Nombre del producto: ');
            const prodCategoria = readlineSync.question('Categoria: ');
            const prodPrecio = readlineSync.questionFloat('Precio: ');
            const prodDescripcion = readlineSync.question('Descripción: ');
            await createProducto(prodNombre, prodCategoria, prodPrecio, prodDescripcion);
          } else {
            // Listar productos (para usuarios normales)
            const productos = await listarProductos();
            if (!productos) {
              console.log("No hay productos disponibles.".yellow);
            } else {
              console.log("Productos disponibles: ", productos);
            }
          }
          break;

        case 4:
          if (userLogged.admin) {
            // Listado de productos (para admin)
            const productos = await listarProductos();
            if (!productos) {
              console.log("No hay productos disponibles.".yellow);
            } else {
              console.log("Productos disponibles: ", productos);
            }
          } else {
            // Ver detalles de producto específico (para usuarios normales)
            const prodId = readlineSync.question('ID del producto: ');
            if (isNaN(prodId)) {
              console.log("Presiona un ID numérico válido.".red);
            } else {
              const producto = await obtenerProducto(prodId);
              if (!producto) {
                console.log("El producto con este ID que has presionado no existe.".red);
              } else {
                console.log("Detalles del producto: ", producto);
              }
            }
          }
          break;

        case 5:
          if (userLogged.admin) {
            // Detalles de un producto específico (para admin)
            const prodId = readlineSync.question('ID del producto a ver: ');
            const producto = await obtenerProducto(prodId);
            if (!producto) {
              console.log("El producto no existe.".red);
            } else {
              console.log("Detalles del producto: ", producto);
            }
          } else {
            // Cerrar sesión (para usuarios normales)
            await logoutUser();
            userLogged = null;
          }
          break;

        case 6:
          if (userLogged.admin) {
            // Editar un producto
            const prodId = readlineSync.question('ID del producto a editar: ');
            const newNombreProd = readlineSync.question('Nuevo nombre: ');
            const newCategoria = readlineSync.question('Nueva categoría: ');
            const newPrecio = readlineSync.questionFloat('Nuevo precio: ');
            const newDescripcion = readlineSync.question('Nueva descripción: ');
            await modificarProducto(prodId, newNombreProd, newCategoria, newPrecio, newDescripcion);
          }
          break;

        case 7:
          if (userLogged.admin) {
            // Eliminar un producto
            const prodIdEliminar = readlineSync.question('ID del producto a eliminar: ');
            await eliminarProducto(prodIdEliminar);
          }
          break;

        case 8:
          if (userLogged.admin) {
            // Cerrar sesión (para admin)
            await logoutUser();
            userLogged = null;
          }
          break;

        default:
          console.log('Opción no válida.');
      }
    }
  }
}

// Ejecutar la aplicación
main();
