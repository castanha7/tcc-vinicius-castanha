// Importa os SDKs necessários do Firebase via CDN (ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// SUBSTITUA OS VALORES ABAIXO PELOS SEUS DADOS DO CONSOLE DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAMX16NNt07gRRb3MZCBRXxsnZVbOKKRkI",
  authDomain: "oportuna-plus.firebaseapp.com",
  projectId: "oportuna-plus",
  storageBucket: "oportuna-plus.firebasestorage.app",
  messagingSenderId: "698934288265",
  appId: "1:698934288265:web:18ba133302ea3b12e74b58"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o serviço de autenticação para uso na aplicação
export const auth = getAuth(app);
