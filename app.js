import readlineSync from 'readline-sync';
import colors from 'colors';
import { registerUser, loginUser, logoutUser, forgotPassword, modifyUserData, deleteUserAccount, createProducto, listarProductos, obtenerProducto, modificarProducto, eliminarProducto } from './auth.js';

// Mostrar el menú inicial
function showMainMenu() {
  console.log('\n--- Menu de TrendyShop ---'.bgCyan.white.bold);
  console.log('1. Registrar usuario'.white);
  console.log('2. Iniciar sesion'.green);
  console.log('3. Restablecer contraseña'.cyan);
  console.log('4. Salir'.red);
}

// Menú después de iniciar sesión
function showLoggedInMenu() {
  console.log('\n--- Menú de Usuario ---'.bgGreen.white.bold);
  console.log('1. Modificar mis datos'.white);
  console.log('2. Eliminar mi usuario'.red);
  console.log('3. Ver detalles de productos'.cyan);
  console.log('4. Crear un nuevo producto'.green);
  console.log('5. Eliminar un producto'.yellow);
  console.log('6. Cerrar sesión'.yellow);
}

// Función para manejar el menú cuando el usuario está autenticado
async function handleLoggedInMenu(uid) {
  let option = '';
  while (option !== '6') {
    showLoggedInMenu();
    option = readlineSync.question('Selecciona una opcion: '.brightWhite);

    switch (option) {
      case '1': {  // Modificar datos del usuario
        const newNombre = readlineSync.question('Ingresa tu nuevo nombre: '.cyan);
        const newApellidos = readlineSync.question('Ingresa tus nuevos apellidos: '.cyan);
        const newEdad = readlineSync.questionInt('Ingresa tu nueva edad: '.cyan);

        await modifyUserData(uid, newNombre, newApellidos, newEdad);
        console.log("Datos actualizados exitosamente.".green);
        break;
      }
      case '2': {  // Eliminar usuario
        const confirmDelete = readlineSync.question('¿Estás seguro de que quieres eliminar tu cuenta? (si/no): '.red);
        if (confirmDelete.toLowerCase() === 'si') {
          await deleteUserAccount(uid);
          console.log("Tu cuenta ha sido eliminada.".red);
          option = '6';  // Forzar cierre de sesión tras eliminar
        }
        break;
      }
      case '3': {  // Ver detalles de productos
        const productos = await listarProductos();
        if (productos.length === 0) {
          console.log("No hay productos disponibles.".yellow);
          break;
        }

        console.log('\n--- Listado de Productos ---'.bgBlue.white.bold);
        productos.forEach((producto, index) => {
          console.log(`${index + 1}. ${producto.nombre} (${producto.categoria}) - $${producto.precio}`.cyan);
        });

        const selectedOption = readlineSync.questionInt("Selecciona un producto por su número para ver detalles: ".cyan);
        const selectedProduct = productos[selectedOption - 1];

        if (selectedProduct) {
          console.log('\n--- Detalles del Producto ---'.bgWhite.black.bold);
          console.log(`Nombre: ${selectedProduct.nombre}`);
          console.log(`Categoría: ${selectedProduct.categoria}`);
          console.log(`Precio: ${selectedProduct.precio}`);
          console.log(`Descripción: ${selectedProduct.descripcion}`);
        } else {
          console.log("Producto no válido seleccionado.".red);
        }
        break;
      }
      case '4': {  // Crear un producto
        const nombre = readlineSync.question('Nombre del producto: '.cyan);
        const categoria = readlineSync.question('Categoría del producto: '.cyan);
        const precio = readlineSync.questionFloat('Precio del producto: '.cyan);
        const descripcion = readlineSync.question('Descripción del producto: '.cyan);

        await createProducto(nombre, categoria, precio, descripcion);
        console.log("Producto creado exitosamente.".green);
        break;
      }
      case '5': {  // Eliminar un producto
        const productos = await listarProductos();
        if (productos.length === 0) {
          console.log("No hay productos disponibles.".yellow);
          break;
        }

        console.log('\n--- Listado de Productos ---'.bgBlue.white.bold);
        productos.forEach((producto, index) => {
          console.log(`${index + 1}. ${producto.nombre} (${producto.categoria}) - $${producto.precio}`.cyan);
        });

        const selectedOption = readlineSync.questionInt("Selecciona un producto por su número para eliminar: ".cyan);
        const selectedProduct = productos[selectedOption - 1];

        if (selectedProduct) {
          const confirmDelete = readlineSync.question('¿Estás seguro de que quieres eliminar este producto? (si/no): '.red);
          if (confirmDelete.toLowerCase() === 'si') {
            await eliminarProducto(selectedProduct.id);
            console.log("Producto eliminado.".red);
          }
        } else {
          console.log("Producto no válido seleccionado.".red);
        }
        break;
      }
      case '6': {  // Cerrar sesión
        await logoutUser();
        console.log('Has cerrado sesión.'.yellow);
        break;
      }
      default:
        console.log('Opción no válida. Inténtalo de nuevo.'.red);
    }
  }
}

// Función para manejar el menú principal
async function handleMainMenu() {
  let option = '';
  while (option !== '4') {
    showMainMenu();
    option = readlineSync.question('Selecciona una opcion: '.brightWhite);

    switch (option) {
      case '1': {  // Registro de usuario
        const email = readlineSync.questionEMail('Ingresa tu correo: '.cyan);
        const password = readlineSync.question('Ingresa tu contraseña: '.cyan, { hideEchoBack: true });
        const nombre = readlineSync.question('Ingresa tu nombre: '.cyan);
        const apellidos = readlineSync.question('Ingresa tus apellidos: '.cyan);
        const edad = readlineSync.questionInt('Ingresa tu edad: '.cyan);

        const user = await registerUser(email, password, nombre, apellidos, edad);
        if (user) {
          console.log("Usuario registrado exitosamente.".green);
        }
        break;
      }
      case '2': {  // Inicio de sesión
        const email = readlineSync.questionEMail('Ingresa tu correo: '.cyan);
        const password = readlineSync.question('Ingresa tu contraseña: '.cyan, { hideEchoBack: true });

        const user = await loginUser(email, password);
        if (user) {
          console.log("Has iniciado sesión exitosamente.".green);
          await handleLoggedInMenu(user.uid);
        } else {
          console.log("Error al iniciar sesión.".red);
        }
        break;
      }
      case '3': {  // Restablecer contraseña
        const email = readlineSync.questionEMail('Ingresa tu correo para restablecer la contraseña: '.cyan);
        await forgotPassword(email);
        break;
      }
      case '4': {
        console.log('Saliendo...'.red);
        break;
      }
      default:
        console.log('Opción no válida. Inténtalo de nuevo.'.red);
    }
  }
}

// Iniciar la aplicación
handleMainMenu();
