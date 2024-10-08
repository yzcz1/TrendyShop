// auth.js YOUNESS ZAHID CHRIF
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from './firebase.js';

// Función para registrar un usuario
async function registerUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuario registrado:", user);

    // Aquí puedes enviar un email de verificación si lo deseas
    // await sendEmailVerification(user);
    // console.log('Email de verificación enviado.');
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.error("El correo electrónico ya está en uso. Intenta iniciar sesión.");
    } else {
      console.error("Error al registrar el usuario:", error.message);
    }
  }
}

// Función para iniciar sesión
async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Usuario inició sesión:", user);
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
  }
}

// Función para cerrar sesión
async function logoutUser() {
  try {
    await signOut(auth);
    console.log("Usuario cerró sesión");
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
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

// Prueba las funciones
// Intenta registrar un nuevo usuario (esto fallará si el correo ya está en uso)
registerUser("younes.zc03@gmail.com", "younes"); // Registro
// Luego inicia sesión
loginUser("younes.zc03@gmail.com", "younes2"); // Inicio de sesión
// Para cerrar sesión, puedes llamar a logoutUser(); y realizar una prueba.

// Prueba la función de restablecimiento de contraseña
//forgotPassword("younes.zc03@gmail.com"); // Reemplaza con el correo deseado
