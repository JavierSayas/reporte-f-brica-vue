import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, deleteDoc } from 'firebase/firestore';

// Obtenemos la config de Firebase, como antes
const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');

// ---- MODIFICACIÓN CLAVE ----
// En lugar de leer de una variable de entorno, ponemos el valor directamente.
// Basado en tus capturas de Firebase, el ID es "reporte-fabrica".
const appId = 'reporte-fabrica';

// Inicializar Firebase una sola vez
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// El resto del estado reactivo
const userId = ref(null);
const loading = ref(true);
const dailyReports = ref({});

export function useFirebase() {
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

    const setupReportsListener = () => {
        if (!userId.value) return;
        // Verificamos que la ruta que se construye es la correcta
        const reportsRef = collection(db, `artifacts/${appId}/users/${userId.value}/dailyReports`);
        const q = query(reportsRef);
        onSnapshot(q, (snapshot) => {
            const reports = {};
            snapshot.forEach((doc) => {
                reports[doc.id] = doc.data();
            });
            dailyReports.value = reports;
        }, (error) => {
            // Añadimos un console.error para ver si hay errores de permisos
            console.error("Error al escuchar los reportes:", error);
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
