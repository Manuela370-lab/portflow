// frontend/js/modules/dossiers/dossier-form.js
// Logique du formulaire de création/modification de dossier

let isEditMode = false;
let currentDossierId = null;

// Charger les armateurs pour le select
// Charger les armateurs depuis l'API
async function loadArmateurs() {
    const select = document.getElementById('armateur_id');
    if (!select) return;
    
    select.innerHTML = '<option value="">Chargement...</option>';
    
    const result = await ReferentielsAPI.getArmateurs();
    
    if (result.ok && result.data) {
        select.innerHTML = '<option value="">Sélectionner un armateur</option>';
        result.data.forEach(armateur => {
            select.innerHTML += `<option value="${armateur.id}">${armateur.nom}</option>`;
        });
    } else {
        select.innerHTML = '<option value="">Erreur de chargement</option>';
        console.error('Erreur chargement armateurs:', result.data);
    }
}

// Charger un dossier existant pour modification
async function loadDossierForEdit(id) {
    const result = await DossiersAPI.getById(id);
    
    if (result.ok && result.data) {
        const dossier = result.data;
        document.getElementById('num_commande').value = dossier.num_commande || '';
        document.getElementById('num_bl').value = dossier.num_bl || '';
        document.getElementById('fournisseur').value = dossier.fournisseur || '';
        document.getElementById('armateur_id').value = dossier.armateur_id || '';
        document.getElementById('numero_conteneur').value = dossier.numero_conteneur || '';
        document.getElementById('eta').value = dossier.eta || '';
        document.getElementById('delai_franchise').value = dossier.delai_franchise || 11;
        document.getElementById('statut').value = dossier.statut || 'en_cours';
        document.getElementById('commentaire').value = dossier.commentaire || '';
    } else {
        showError('Impossible de charger le dossier');
    }
}

// Vérifier s'il y a un ID dans l'URL (mode édition)
function checkEditMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (id) {
        isEditMode = true;
        currentDossierId = parseInt(id);
        document.getElementById('pageTitle').textContent = 'Modifier le dossier';
        document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Mettre à jour';
        loadDossierForEdit(currentDossierId);
    }
}

// Afficher une erreur
function showError(message) {
    const form = document.getElementById('dossierForm');
    let errorDiv = document.getElementById('formError');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'formError';
        errorDiv.className = 'error-message';
        form.insertBefore(errorDiv, form.firstChild);
    }
    
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Afficher un succès
function showSuccess(message, redirectUrl = 'list.html') {
    const form = document.getElementById('dossierForm');
    let successDiv = document.getElementById('formSuccess');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'formSuccess';
        successDiv.className = 'success-message';
        form.insertBefore(successDiv, form.firstChild);
    }
    
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        window.location.href = redirectUrl;
    }, 1500);
}

// Envoyer le formulaire
async function submitForm(event) {
    event.preventDefault();
    
    // Récupérer les données du formulaire
    const formData = {
        num_commande: document.getElementById('num_commande').value,
        num_bl: document.getElementById('num_bl').value,
        fournisseur: document.getElementById('fournisseur').value,
        armateur_id: parseInt(document.getElementById('armateur_id').value),
        numero_conteneur: document.getElementById('numero_conteneur').value || null,
        eta: document.getElementById('eta').value,
        delai_franchise: parseInt(document.getElementById('delai_franchise').value),
        statut: document.getElementById('statut').value,
        commentaire: document.getElementById('commentaire').value || null
    };
    
    // Validation simple
    if (!formData.num_commande || !formData.num_bl || !formData.fournisseur || !formData.armateur_id || !formData.eta) {
        showError('Veuillez remplir tous les champs obligatoires (*)');
        return;
    }
    
    // Désactiver le bouton pendant l'envoi
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    
    let result;
    if (isEditMode) {
        result = await DossiersAPI.update(currentDossierId, formData);
    } else {
        result = await DossiersAPI.create(formData);
    }
    
    if (result.ok) {
        showSuccess(
            isEditMode ? 'Dossier modifié avec succès !' : 'Dossier créé avec succès !',
            'list.html'
        );
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = isEditMode ? '<i class="fas fa-save"></i> Mettre à jour' : '<i class="fas fa-save"></i> Enregistrer';
        showError(result.data?.detail || 'Erreur lors de l\'enregistrement');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadArmateurs();
    checkEditMode();
    
    const form = document.getElementById('dossierForm');
    if (form) {
        form.addEventListener('submit', submitForm);
    }
});