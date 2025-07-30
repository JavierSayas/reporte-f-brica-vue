import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, deleteDoc } from 'firebase/firestore';

// Las variables de entorno las configuraremos en el servicio de despliegue
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');
const appId = import.meta.env.VITE_APP_ID || 'default-app-id';

// Inicializar Firebase una sola vez
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Estado reactivo que será exportado
const userId = ref(null);
const loading = ref(true);
const dailyReports = ref({});

// Función principal del composable
export function useFirebase() {
    // Lógica de autenticación
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId.value = user.uid;
            loading.value = false;
            setupReportsListener();
        } else {
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Error signing in:", error);
            }
        }
    });

    // Listener de Firestore
    const setupReportsListener = () => {
        if (!userId.value) return;
        const reportsRef = collection(db, `artifacts/${appId}/users/${userId.value}/dailyReports`);
        const q = query(reportsRef);
        onSnapshot(q, (snapshot) => {
            const reports = {};
            snapshot.forEach((doc) => {
                reports[doc.id] = doc.data();
            });
            dailyReports.value = reports;
        });
    };

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

    return { userId, loading, dailyReports, saveReport, deleteReport };
}
