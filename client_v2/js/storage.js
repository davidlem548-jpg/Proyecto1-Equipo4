// LocalStorage y SessionStorage

// LocalStorage helpers
export function saveToLocal(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return false;
    }
}

export function getFromLocal(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error leyendo desde localStorage:', error);
        return null;
    }
}

export function removeFromLocal(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error eliminando desde localStorage:', error);
        return false;
    }
}

// SessionStorage helpers
export function saveToSession(key, value) {
    try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Error guardando en sessionStorage:', error);
        return false;
    }
}

export function getFromSession(key) {
    try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error leyendo desde sessionStorage:', error);
        return null;
    }
}

export function removeFromSession(key) {
    try {
        sessionStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error eliminando desde sessionStorage:', error);
        return false;
    }
}

export function clearSession() {
    try {
        sessionStorage.clear();
        return true;
    } catch (error) {
        console.error('Error limpiando sessionStorage:', error);
        return false;
    }
}

