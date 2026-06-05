// frontend/js/api/dossiers.js
// API de gestion des dossiers d'importation

const DossiersAPI = {
    // Récupérer tous les dossiers (avec filtres optionnels)
    async getAll(filters = {}) {
        let url = '/dossiers';
        const params = new URLSearchParams();
        
        if (filters.statut) params.append('statut', filters.statut);
        if (filters.armateur_id) params.append('armateur_id', filters.armateur_id);
        if (filters.recherche) params.append('recherche', filters.recherche);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return apiClient.get(url);
    },
    
    // Récupérer un dossier par son ID
    async getById(id) {
        return apiClient.get(`/dossiers/${id}`);
    },
    
    // Créer un nouveau dossier
    async create(dossierData) {
        return apiClient.post('/dossiers', dossierData);
    },
    
    // Modifier un dossier
    async update(id, dossierData) {
        return apiClient.put(`/dossiers/${id}`, dossierData);
    },
    
    // Supprimer un dossier
    async delete(id) {
        return apiClient.delete(`/dossiers/${id}`);
    },
    
    // Récupérer les documents d'un dossier
    async getDocuments(dossierId) {
        return apiClient.get(`/dossiers/${dossierId}/documents`);
    },
    
    // Mettre à jour l'état d'un document
    async updateDocumentStatus(dossierId, documentId, estRecu, dateReception = null) {
        return apiClient.put(`/dossiers/${dossierId}/documents/${documentId}`, {
            est_recu: estRecu,
            date_reception: dateReception || new Date().toISOString().split('T')[0]
        });
    }
};