import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, query, deleteDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');
const appId = 'reporte-fabrica';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- MODIFICACIÓN 1: CREAMOS UN ID DE USUARIO COMPARTIDO ---
const SHARED_USER_ID = 'equipo_fabrica';

// El estado reactivo ahora usará este ID compartido
const userId = ref(SHARED_USER_ID); 
const loading = ref(true);
const dailyReports = ref({});

export function useFirebase() {
    // La autenticación ahora solo sirve para tener permiso, pero no usaremos el UID que nos da
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Ya tenemos el usuario autenticado, podemos cargar los datos.
            loading.value = false;
            setupReportsListener();
        } else {
            try {
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Error signing in:", error);
                loading.value = false; // Muestra la app incluso si el login falla
            }
        }
    });

    const setupReportsListener = () => {
        // --- MODIFICACIÓN 2: La ruta ahora usa siempre el ID compartido ---
        const reportsRef = collection(db, `artifacts/${appId}/users/${SHARED_USER_ID}/dailyReports`);
        const q = query(reportsRef);
        onSnapshot(q, (snapshot) => {
            const reports = {};
            snapshot.forEach((doc) => {
                reports[doc.id] = doc.data();
            });
            dailyReports.value = reports;
        }, (error) => {
            console.error("Error al escuchar los reportes:", error);
        });
    };

    const saveReport = async (date, reportData) => {
        // --- MODIFICACIÓN 3: La ruta de guardado también usa el ID compartido ---
        const docRef = doc(db, `artifacts/${appId}/users/${SHARED_USER_ID}/dailyReports`, date);
        await setDoc(docRef, reportData, { merge: true });
    };

    const deleteReport = async (date) => {
        // --- MODIFICACIÓN 4: La ruta de borrado también usa el ID compartido ---
        const docRef = doc(db, `artifacts/${appId}/users/${SHARED_USER_ID}/dailyReports`, date);
        await deleteDoc(docRef);
    };

    return { userId, loading, dailyReports, saveReport, deleteReport };
}
