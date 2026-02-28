const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyCMV2w3fVUHYFVEw4bND1J5NX5zDfz89Sk",
    authDomain: "agentic-ai-d0b7e.firebaseapp.com",
    projectId: "agentic-ai-d0b7e",
    storageBucket: "agentic-ai-d0b7e.firebasestorage.app",
    messagingSenderId: "610887197912",
    appId: "1:610887197912:web:9f25854deb8dbe545663ad"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

console.log('🔥 Firestore connected → project: agentic-ai-d0b7e');

module.exports = { db, firebase };
