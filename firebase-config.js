// Importa os SDKs necessários do Firebase via CDN (ES Modules)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do projeto Firebase
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

// Inicializa e exporta o Firebase Authentication
export const auth = getAuth(app);

// Inicializa e exporta o Cloud Firestore
export const db = getFirestore(app);
