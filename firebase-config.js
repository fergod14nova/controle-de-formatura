// Configuração do Firebase
// ATENÇÃO: Substitua pelos seus dados do Firebase!
const firebaseConfig = {
    apiKey: "AIzaSyDTtN88zzy4YNBBNdaGIvFeqNZJcX2reyg",
    authDomain: "sertaoinfor-da03a.firebaseapp.com",
    databaseURL: "https://sertaoinfor-da03a-default-rtdb.firebaseio.com",
    projectId: "sertaoinfor-da03a",
    storageBucket: "sertaoinfor-da03a.firebasestorage.app",
    messagingSenderId: "226921118230",
    appId: "1:226921118230:web:0aca91f6568a2b9b9b9337"
};

// Inicializar o Firebase
firebase.initializeApp(firebaseConfig);

// Referência ao Realtime Database
const database = firebase.database();

//Verificar se a inicialização foi bem-sucedida
console.log("Firebase inicializado com sucesso!");
console.log("Database URL:", firebaseConfig.databaseURL);

