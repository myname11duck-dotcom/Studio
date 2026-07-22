document.addEventListener("DOMContentLoaded", () => {

    const utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "null");

    const nomInput = document.getElementById("nom");
    const prenomInput = document.getElementById("prenom");
    const emailInput = document.getElementById("email");
    const motDePasseInput = document.getElementById("motDePasse");
    const motDePasseConfirmInput = document.getElementById("motDePasseConfirm");
    const settingsForm = document.getElementById("settingsForm");
    const settingsMessage = document.getElementById("settingsMessage");
    const profileNom = document.getElementById("profileNom");
    const profileEmail = document.getElementById("profileEmail");
    const headerNom = document.getElementById("headerNom");

    if (utilisateur) {
        nomInput.value = utilisateur.nom || "";
        prenomInput.value = utilisateur.prenom || "";
        emailInput.value = utilisateur.email || "";
        profileNom.textContent = utilisateur.prenom || "Mon compte";
        profileEmail.textContent = utilisateur.email || "";
        headerNom.textContent = utilisateur.prenom || "Mon compte";
    }

    function afficherMessage(texte, succes) {
        settingsMessage.textContent = texte;
        settingsMessage.className = "settings-message " + (succes ? "success" : "error");
    }

    settingsForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!utilisateur || !utilisateur.email) {
            afficherMessage("Vous devez être connecté pour modifier votre compte.", false);
            return;
        }

        const motDePasse = motDePasseInput.value;
        const motDePasseConfirm = motDePasseConfirmInput.value;

        if (motDePasse && motDePasse !== motDePasseConfirm) {
            afficherMessage("Les mots de passe ne correspondent pas.", false);
            return;
        }

        const payload = {
            nom: nomInput.value,
            prenom: prenomInput.value,
            email: emailInput.value
        };
        if (motDePasse) payload.mot_de_passe = motDePasse;

        try {
            const res = await fetch(`/api/utilisateur/${encodeURIComponent(utilisateur.email)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            afficherMessage(data.message, data.success);

            if (data.success) {
                localStorage.setItem("utilisateur", JSON.stringify({
                    nom: data.nom,
                    prenom: data.prenom,
                    email: data.email
                }));
                motDePasseInput.value = "";
                motDePasseConfirmInput.value = "";
                profileNom.textContent = data.prenom;
                profileEmail.textContent = data.email;
                headerNom.textContent = data.prenom;
            }
        } catch (err) {
            afficherMessage("Impossible de contacter le serveur.", false);
        }
    });

});