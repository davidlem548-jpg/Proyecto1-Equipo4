// Theme Toggle :D

import { getFromLocal, saveToLocal } from './storage.js';

const THEME_KEY = 'dashboardTheme';

// Obtener tema actual desde localStorage o por defecto a 'light'
export function getTheme() {
    return getFromLocal(THEME_KEY) || 'light';
}

// Establecer tema y guardar en localStorage
export function setTheme(theme) {
    if (!['light', 'dark'].includes(theme)) {
        console.error('Tema inválido:', theme);
        return;
    }
    
    saveToLocal(THEME_KEY, theme);
    applyTheme(theme);
}

// Aplicar tema al elemento HTML
export function applyTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    // Actualizar icono y texto del botón de cambio de tema
    const icon = document.getElementById('themeIcon');
    const text = document.getElementById('themeText');
    
    if (icon && text) {
        if (theme === 'dark') {
            icon.className = 'bi bi-sun-fill';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'bi bi-moon-fill';
            text.textContent = 'Dark Mode';
        }
    }
}

// Cambiar entre temas claro y oscuro   
export function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Inicializar tema en la carga de la página
export function initTheme() {
    const savedTheme = getTheme();
    applyTheme(savedTheme);
}

// Configurar listener de evento para el botón de cambio de tema
export function setupThemeToggle() {
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
        toggleButton.addEventListener('click', toggleTheme);
    }
}

