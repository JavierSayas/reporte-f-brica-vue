import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, // <-- Nuevo
  signOut                    // <-- Nuevo
} from 'firebase/auth'; 
import { getFirestore, doc, setDoc, onSnapshot, collection, query, deleteDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');
const appId = 'reporte-fabrica';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// El userId ahora empieza como nulo, se rellenará al hacer login
const userId = ref(null); 
const userEmail = ref(null); // Para saber qué usuario está conectado
const loading = ref(true);
const dailyReports = ref({});
let reportsListenerUnsubscribe = null; // Para poder detener el listener al hacer logout

export function useFirebase() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Un usuario ha iniciado sesión
            userId.value = user.uid;
            userEmail.value = user.email;
            setupReportsListener(); // Escuchamos los datos de ESTE usuario
        } else {
            // No hay nadie conectado
            userId.value = null;
            userEmail.value = null;
            dailyReports.value = {}; // Limpiamos los datos
            if (reportsListenerUnsubscribe) {
                reportsListenerUnsubscribe(); // Dejamos de escuchar
            }
        }
        loading.value = false;
    });

    const setupReportsListener = () => {
        if (!userId.value) return;
        // La ruta ahora vuelve a ser dinámica con el UID del usuario conectado
        const reportsRef = collection(db, `artifacts/${appId}/users/${userId.value}/dailyReports`);
        reportsListenerUnsubscribe = onSnapshot(query(reportsRef), (snapshot) => {
            const reports = {};
            snapshot.forEach((doc) => { reports[doc.id] = doc.data(); });
            dailyReports.value = reports;
        });
    };
    
    // --- NUEVAS FUNCIONES DE AUTENTICACIÓN ---
    const login = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        await signOut(auth);
    };
    // --- FIN NUEVAS FUNCIONES ---

    const saveReport = async (date, reportData) => {
        if (!userId.value) throw new Error("User not authenticated");
        const docRef = doc(db, `artifacts/${appId}/users/${userId.value}/dailyReports`, date);
        await setDoc(docRef, reportData, { merge: true });
    };

    const deleteReport = async (date) => {
        if (!userId.value) throw new Error("User not authenticated");
        const docRef = doc(db, `artifacts/${appId}/users/${userId.value}/dailyReports`, date);
        await deleteDoc(docRef);
    };

    // Exponemos las nuevas funciones y el email del usuario
    return { userId, userEmail, loading, dailyReports, saveReport, deleteReport, login, logout };
}
