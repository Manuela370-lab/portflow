// frontend/js/modules/dossiers/dossiers-list.js
// Logique de la page liste des dossiers

let currentFilters = {
    statut: '',
    armateur_id: '',
    recherche: ''
};

// Charger la liste des dossiers
async function loadDossiers() {
    const tbody = document.getElementById('dossiersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="7" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Chargement...</td></tr>';
    
    const result = await DossiersAPI.getAll(currentFilters);
    
    if (result.ok && result.data) {
        displayDossiers(result.data);
    } else {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-message">
            <i class="fas fa-exclamation-circle"></i>
            Erreur: ${result.data?.detail || 'Problème de connexion'}
        </td></tr>`;
    }
}

// Afficher les dossiers
function displayDossiers(dossiers) {
    const tbody = document.getElementById('dossiersTableBody');
    
    if (!dossiers || dossiers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-message">
            <i class="fas fa-folder-open"></i>
            Aucun dossier trouvé
        </td></tr>`;
        return;
    }
    
    tbody.innerHTML = dossiers.map(dossier => `
        <tr>
            <td><strong>${dossier.num_commande || '-'}</strong></td>
            <td>${dossier.fournisseur || '-'}</td>
            <td>${dossier.num_bl || '-'}</td>
            <td>${dossier.armateur_nom || '-'}</td>
            <td>${formatDate(dossier.eta)}</td>
            <td>${getStatutBadge(dossier.statut)}</td>
            <td>
                <a class="action-link" onclick="viewDossier(${dossier.id})">
                    <i class="fas fa-eye"></i> Voir
                </a>
                <a class="action-link" onclick="editDossier(${dossier.id})">
                    <i class="fas fa-edit"></i>
                </a>
                <a class="action-link" onclick="deleteDossier(${dossier.id})">
                    <i class="fas fa-trash"></i>
                </a>
            </td>
        </tr>
    `).join('');
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function getStatutBadge(statut) {
    const badges = {
        'en_cours': '<span class="statut-badge statut-en_cours">📋 En cours</span>',
        'arrive': '<span class="statut-badge statut-arrive">✅ Arrivé</span>',
        'cloture': '<span class="statut-badge statut-cloture">🔒 Clôturé</span>'
    };
    return badges[statut] || `<span class="statut-badge">${statut}</span>`;
}

function applyFilters() {
    currentFilters = {
        statut: document.getElementById('filterStatut')?.value || '',
        armateur_id: document.getElementById('filterArmateur')?.value || '',
        recherche: document.getElementById('searchInput')?.value || ''
    };
    loadDossiers();
}

function resetFilters() {
    document.getElementById('filterStatut').value = '';
    document.getElementById('filterArmateur').value = '';
    document.getElementById('searchInput').value = '';
    currentFilters = { statut: '', armateur_id: '', recherche: '' };
    loadDossiers();
}

function viewDossier(id) {
    window.location.href = `detail.html?id=${id}`;
}

function editDossier(id) {
    window.location.href = `form.html?id=${id}`;
}

async function deleteDossier(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce dossier ?')) return;
    
    const result = await DossiersAPI.delete(id);
    
    if (result.ok) {
        loadDossiers();
        showNotification('Dossier supprimé', 'success');
    } else {
        showNotification('Erreur lors de la suppression', 'error');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i><span>${message}</span>`;
    notification.style.cssText = `
        position: fixed; bottom: 20px; right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white; padding: 12px 20px; border-radius: 10px;
        display: flex; align-items: center; gap: 10px; z-index: 2000;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function newDossier() {
    window.location.href = 'form.html';
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    if (!Auth.isAuthenticated()) {
        window.location.href = '../login.html';
        return;
    }
    
    loadDossiers();
    
    document.getElementById('btnFilter')?.addEventListener('click', applyFilters);
    document.getElementById('btnReset')?.addEventListener('click', resetFilters);
    document.getElementById('btnNew')?.addEventListener('click', newDossier);
    document.getElementById('searchInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
});

async function loadArmateursForFilter() {
    const armateurSelect = document.getElementById('filterArmateur');
    if (!armateurSelect) return;
    
    armateurSelect.innerHTML = '<option value="">Tous</option>';
    
    const result = await ReferentielsAPI.getArmateurs();
    
    if (result.ok && result.data) {
        result.data.forEach(armateur => {
            armateurSelect.innerHTML += `<option value="${armateur.id}">${armateur.nom}</option>`;
        });
    }
}