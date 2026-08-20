const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

initializeApp({
  credential: cert(serviceAccount)
});

const uid = process.argv[2];

if (!uid) {
  console.error("ERRO: informe o UID do usuário.");
  console.error("Exemplo: node set-admin.js SEU_UID");
  process.exit(1);
}

async function setAdmin() {
  try {
    await getAuth().setCustomUserClaims(uid, { admin: true });

    console.log("SUCESSO: usuário definido como administrador.");
    console.log("UID:", uid);
    console.log("Agora faça logout e login novamente no Oportuna+.");
  } catch (error) {
    console.error("ERRO:", error.message);
    process.exit(1);
  }
}

setAdmin();
