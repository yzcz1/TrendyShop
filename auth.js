import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail, setDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, collection } from './firebase.js';

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
  constructor(id, nombre, categoria, precio, descripcion) {
    this.id = id;
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
    } else {
      console.log("El administrador ya existe.");
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

    console.log("Usuario registrado exitosamente.".green);
    return newUser;
  } catch (error) {
    console.error("Error al registrar el usuario:", error.message);
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
      console.log("Usuario inició sesión exitosamente.".green);

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
    console.error("Error al iniciar sesión:", error.message);
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
    console.log("Datos del usuario actualizados correctamente.");
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
      console.log("Usuario y datos eliminados correctamente.");
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
      console.log(`Usuario con el correo ${email} cerró sesión.`);
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
    console.log("Correo de restablecimiento de contraseña enviado a:", email);
  } catch (error) {
    console.error("Error al enviar correo de restablecimiento:", error.message);
  }
}

// ------------------------ Gestión de Productos ------------------------
// Crear nuevo producto
async function createProducto(nombre, categoria, precio, descripcion) {
  try {
    const productoRef = doc(collection(db, "productos"));
    const newProducto = new Producto(productoRef.id, nombre, categoria, precio, descripcion);
    await setDoc(productoRef, {
      nombre: newProducto.nombre,
      categoria: newProducto.categoria,
      precio: newProducto.precio,
      descripcion: newProducto.descripcion
    });
    console.log("Producto creado exitosamente:", newProducto);
    return newProducto;
  } catch (error) {
    console.error("Error al crear el producto:", error.message);
    return null;
  }
}

// Listar todos los productos
async function listarProductos() {
  try {
    const productosSnapshot = await getDocs(collection(db, "productos"));
    const productosList = productosSnapshot.docs.map((doc) => ({
      id: doc.id,
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
    await updateDoc(productoRef, {
      nombre: newNombre,
      categoria: newCategoria,
      precio: newPrecio,
      descripcion: newDescripcion
    });
    console.log("Producto actualizado correctamente.");
  } catch (error) {
    console.error("Error al modificar el producto:", error.message);
  }
}

// Eliminar un producto
async function eliminarProducto(id) {
  try {
    await deleteDoc(doc(db, "productos", id));
    console.log("Producto eliminado correctamente.");
  } catch (error) {
    console.error("Error al eliminar el producto:", error.message);
  }
}

export { registerUser, loginUser, logoutUser, forgotPassword, modifyUserData, deleteUserAccount, createProducto, listarProductos, obtenerProducto, modificarProducto, eliminarProducto, initializeAdmin };
