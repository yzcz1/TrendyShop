import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail, setDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, collection, query, orderBy } from './firebase.js';

// Clase para representar un usuario con datos adicionales
class User {
  constructor(uid, nombre, apellidos, edad, email, rol = 'usuario') {
    this.uid = uid;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.edad = edad;
    this.email = email;
    this.rol = rol; // Añadido rol para gestionar el admin
  }
}

// Clase para representar un Producto
class Producto {
  constructor(id, idSecuencial, nombre, categoria, precio, descripcion) {
    this.id = id; // ID generado automáticamente por Firestore
    this.idSecuencial = idSecuencial; // ID secuencial para el usuario
    this.nombre = nombre;
    this.categoria = categoria;
    this.precio = precio;
    this.descripcion = descripcion;
  }
}

// ------------------------ Gestión de Usuarios ------------------------
// Función para inicializar el administrador si no existe
async function initializeAdmin() {
  const adminEmail = 'admin@gmail.com';
  const adminPassword = 'administrador';

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const adminExists = usersSnapshot.docs.some(doc => doc.data().email === adminEmail);

    if (!adminExists) {
      const adminCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      const adminUser = adminCredential.user;

      const newAdmin = new User(adminUser.uid, 'Administrador', 'A B', 21, adminEmail, 'admin');
      await setDoc(doc(db, 'users', adminUser.uid), {
        nombre: newAdmin.nombre,
        apellidos: newAdmin.apellidos,
        edad: newAdmin.edad,
        email: newAdmin.email,
        rol: newAdmin.rol
      });
      console.log("Administrador inicializado correctamente.");
    } 
  } catch (error) {
    console.error('Error al inicializar el administrador:', error.message);
  }
}

// Función para registrar un usuario con datos adicionales (no para admin)
async function registerUser(email, password, nombre, apellidos, edad) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const newUser = new User(user.uid, nombre, apellidos, edad, email);
  
      await setDoc(doc(db, 'users', user.uid), {
        nombre: newUser.nombre,
        apellidos: newUser.apellidos,
        edad: newUser.edad,
        email: newUser.email,
        rol: newUser.rol
      });
  
      console.log("\nUsuario registrado exitosamente.".green);
      return newUser;
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log("\nYa existe un usuario con ese correo electrónico, prueba con otro.".red);
      } else {
        console.error("Error al registrar el usuario:", error.message);
      }
      return null;
    }
  }
  

// Función para iniciar sesión
async function loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("\nUsuario inició sesión exitosamente.".green);
  
        // Verifica si es administrador
        if (userData.rol === 'admin') {
          return { ...userData, uid: user.uid, admin: true }; // Marcar como admin
        } else {
          return { ...userData, uid: user.uid, admin: false }; // Usuario normal
        }
      } else {
        console.error("El usuario no tiene datos asociados.");
        return null;
      }
    } catch (error) {
      // Manejo de diferentes tipos de errores de autenticación
      switch (error.code) {
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          console.log("\nError al iniciar sesión: credenciales incorrectas.".red);
          break;
        case 'auth/invalid-email':
          console.log("\nError al iniciar sesión: correo electrónico no válido.".red);
          break;
        case 'auth/invalid-credential':
          console.log("\nError al iniciar sesión: credenciales inválidas. Intenta de nuevo.".red);
          break;
        default:
          console.log(`\nError al iniciar sesión: ${error.message}`.red);
      }
      return null;
    }
  }
  
  

// Función para modificar los datos del usuario
async function modifyUserData(uid, newNombre, newApellidos, newEdad) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      nombre: newNombre,
      apellidos: newApellidos,
      edad: newEdad
    });
    console.log("\nDatos del usuario actualizados correctamente.".green);
  } catch (error) {
    console.error("Error al modificar los datos del usuario:", error.message);
  }
}

// Función para eliminar usuario
async function deleteUserAccount(uid) {
  try {
    const user = auth.currentUser;
    if (user) {
      await deleteUser(user);
      await deleteDoc(doc(db, 'users', uid));
      console.log("\nUsuario y datos eliminados correctamente.".green);
    } else {
      console.log("No hay usuario autenticado para eliminar.");
    }
  } catch (error) {
    console.error("Error al eliminar el usuario:", error.message);
  }
}

// Función para cerrar sesión
async function logoutUser() {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const email = currentUser.email;
      await signOut(auth);
      console.log(`\nUsuario con el correo ${email} cerró sesión.`);
      return email;
    } else {
      console.log("No hay usuario actualmente autenticado.");
      return null;
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    return null;
  }
}

// Función para resetear la contraseña
async function forgotPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("\nCorreo de restablecimiento de contraseña enviado a:".cyan, email);
  } catch (error) {
    console.error("Error al enviar correo de restablecimiento:", error.message);
  }
}

// ------------------------ Gestión de Productos ------------------------

// Obtener el próximo ID secuencial basado en el valor máximo actual
async function obtenerSiguienteIdSecuencial() {
  try {
    const productosSnapshot = await getDocs(collection(db, "productos"));
    const productos = productosSnapshot.docs.map((doc) => doc.data());
    
    // Si no hay productos, el próximo ID secuencial es 1
    if (productos.length === 0) {
      return 1;
    }

    // Encontrar el idSecuencial máximo y sumar 1
    const maxIdSecuencial = Math.max(...productos.map(producto => producto.idSecuencial));
    return maxIdSecuencial + 1;
  } catch (error) {
    console.error("Error al obtener el siguiente ID secuencial:", error.message);
    return null;
  }
}

// Crear nuevo producto
async function createProducto(nombre, categoria, precio, descripcion) {
  try {
    const nextIdSecuencial = await obtenerSiguienteIdSecuencial(); // Obtener el próximo ID secuencial
    const productoRef = doc(collection(db, "productos")); // Usar ID generado automáticamente por Firestore
    const newProducto = new Producto(productoRef.id, nextIdSecuencial, nombre, categoria, precio, descripcion);
    
    // Guardar el nuevo producto en la base de datos
    await setDoc(productoRef, {
      idSecuencial: newProducto.idSecuencial,
      nombre: newProducto.nombre,
      categoria: newProducto.categoria,
      precio: newProducto.precio,
      descripcion: newProducto.descripcion
    });
    console.log("\nProducto agregado exitosamente.".green);
    return newProducto;
  } catch (error) {
    console.error("Error al crear el producto:", error.message);
    return null;
  }
}

// Listar todos los productos ordenados por idSecuencial
async function listarProductos() {
  try {
    // Utilizamos una consulta para ordenar los productos por 'idSecuencial'
    const productosQuery = query(collection(db, "productos"), orderBy("idSecuencial", "asc"));
    const productosSnapshot = await getDocs(productosQuery);
    const productosList = productosSnapshot.docs.map((doc) => ({
      id: doc.id,
      idSecuencial: doc.data().idSecuencial, // Usamos el idSecuencial para mostrar al usuario
      ...doc.data()
    }));
    return productosList.length ? productosList : null; // Devuelve null si no hay productos
  } catch (error) {
    console.error("Error al listar productos:", error.message);
    return [];
  }
}

// Obtener detalles de un producto
async function obtenerProducto(id) {
  try {
    const productoRef = doc(db, "productos", id);
    const productoSnap = await getDoc(productoRef);
    if (productoSnap.exists()) {
      return { id: productoSnap.id, ...productoSnap.data() };
    } else {
      console.log("El producto no existe.");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el producto:", error.message);
    return null;
  }
}

// Modificar un producto
async function modificarProducto(id, newNombre, newCategoria, newPrecio, newDescripcion) {
  try {
    const productoRef = doc(db, 'productos', id);
    const productoSnap = await getDoc(productoRef);

    if (!productoSnap.exists()) {
      console.log("No hay productos para editar.");
      return;
    }

    await updateDoc(productoRef, {
      nombre: newNombre,
      categoria: newCategoria,
      precio: newPrecio,
      descripcion: newDescripcion
    });
    console.log("\nProducto actualizado correctamente.".green);
  } catch (error) {
    console.error("Error al modificar el producto:", error.message);
  }
}

// Eliminar un producto
async function eliminarProducto(id) {
  try {
    const productoRef = doc(db, "productos", id);
    const productoSnap = await getDoc(productoRef);

    if (!productoSnap.exists()) {
      console.log("No hay productos para eliminar.");
      return;
    }

    await deleteDoc(productoRef);
    console.log("\nProducto eliminado correctamente.".green);
  } catch (error) {
    console.error("Error al eliminar el producto:", error.message);
  }
}

export { registerUser, loginUser, logoutUser, forgotPassword, modifyUserData, deleteUserAccount, createProducto, listarProductos, obtenerProducto, modificarProducto, eliminarProducto, initializeAdmin };