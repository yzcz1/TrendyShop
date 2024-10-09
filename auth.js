import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser, sendPasswordResetEmail, setDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, collection } from './firebase.js';

// Clase para representar un usuario con datos adicionales
class User {
  constructor(uid, nombre, apellidos, edad, email) {
    this.uid = uid;
    this.nombre = nombre;
    this.apellidos = apellidos;
    this.edad = edad;
    this.email = email;
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
// Función para registrar un usuario con datos adicionales
async function registerUser(email, password, nombre, apellidos, edad) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const newUser = new User(user.uid, nombre, apellidos, edad, email);

    await setDoc(doc(db, 'users', user.uid), {
      nombre: newUser.nombre,
      apellidos: newUser.apellidos,
      edad: newUser.edad,
      email: newUser.email
    });

    console.log("Usuario registrado y guardado en Firestore:", newUser);
    return newUser;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.error("Este usuario ya está registrado, prueba con otro correo electrónico.");
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
    console.log("Usuario inició sesión:", user);
    return user; 
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
    return productosList;
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

export { registerUser, loginUser, logoutUser, forgotPassword, modifyUserData, deleteUserAccount, createProducto, listarProductos, obtenerProducto, modificarProducto, eliminarProducto };
