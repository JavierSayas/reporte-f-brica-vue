import { ref } from 'vue';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider, // <-- NUEVO
  reauthenticateWithCredential, // <-- NUEVO
  updatePassword // <-- NUEVO
} from 'firebase/auth'; 
import { getFirestore, doc, setDoc, onSnapshot, collection, query, deleteDoc } from 'firebase/firestore';

const firebaseConfig = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG || '{}');
const appId = 'reporte-fabrica';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const userId = ref(null); 
const userEmail = ref(null);
const loading = ref(true);
const dailyReports = ref({});
let reportsListenerUnsubscribe = null;

export function useFirebase() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId.value = user.uid;
            userEmail.value = user.email;
            setupReportsListener();
        } else {
            userId.value = null;
            userEmail.value = null;
            dailyReports.value = {};
            if (reportsListenerUnsubscribe) {
                reportsListenerUnsubscribe();
            }
        }
        loading.value = false;
    });

    const setupReportsListener = () => {
        if (!userId.value) return;
        const reportsRef = collection(db, `artifacts/${appId}/users/${userId.value}/dailyReports`);
        reportsListenerUnsubscribe = onSnapshot(query(reportsRef), (snapshot) => {
            const reports = {};
            snapshot.forEach((doc) => { reports[doc.id] = doc.data(); });
            dailyReports.value = reports;
        });
    };
    
    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const logout = () => signOut(auth);

    // --- NUEVA FUNCIÓN PARA CAMBIAR LA CONTRASEÑA ---
    const changePassword = async (currentPassword, newPassword) => {
        const user = auth.currentUser;
        if (!user) throw new Error("No hay un usuario conectado.");

        // 1. Crear credenciales con la contraseña actual para verificar al usuario
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        // 2. Re-autenticar al usuario. Esto es por seguridad.
        await reauthenticateWithCredential(user, credential);

        // 3. Si la re-autenticación es exitosa, actualizar la contraseña
        await updatePassword(user, newPassword);
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

    // Exponemos la nueva función
    return { userId, userEmail, loading, dailyReports, saveReport, deleteReport, login, logout, changePassword };
}
