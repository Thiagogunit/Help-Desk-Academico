document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const logoutLink = document.getElementById("logoutLink");
    const ticketForm = document.getElementById("ticketForm");
    const enviarRespostaBtn = document.getElementById("enviarRespostaBtn");
    const atualizarStatusBtn = document.getElementById("atualizarStatusBtn");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (validateUser(email, password)) {
                localStorage.setItem("loggedInUser", email);
                window.location.href = "./src/home.html";
            } else {
                Swal.fire({
                    title: 'Erro!',
                    text: 'Usuário ou senha inválidos!',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("loggedInUser");
            window.location.href = "../index.html";
        });
    }

    if (ticketForm) {
        ticketForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = localStorage.getItem("loggedInUser");
            const ticket = {
                assunto: document.getElementById("assunto").value,
                categoria: document.getElementById("categoria").options[document.getElementById("categoria").selectedIndex].text,
                destinatario: document.getElementById("destinatario").value,
                descricao: document.getElementById("descricao").value,
                alunoEmail: email,
                responsavel: document.getElementById("destinatario").value,
                dataAbertura: new Date().toLocaleDateString(),
                status: "Aberto"
            };
            saveTicket(ticket);
            Swal.fire({
                title: 'Sucesso!',
                text: 'Ticket salvo com sucesso!',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = "./meus-tickets.html";
            });
        });
    }

    if (enviarRespostaBtn) {
        enviarRespostaBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const urlParams = new URLSearchParams(window.location.search);
            const ticketId = parseInt(urlParams.get('id')) - 1;
            const tickets = getTickets();
            const resposta = document.getElementById("resposta").value;
            if (ticketId >= 0 && ticketId < tickets.length) {
                const ticket = tickets[ticketId];
                ticket.resposta = resposta;
                ticket.status = "Respondido";
                updateTicket(ticketId, ticket);
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Resposta enviada com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = "./meus-tickets.html";
                });
            }
        });
    }

    if (atualizarStatusBtn) {
        atualizarStatusBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const urlParams = new URLSearchParams(window.location.search);
            const ticketId = parseInt(urlParams.get('id')) - 1;
            const tickets = getTickets();
            const novoStatus = document.getElementById("status").value;
            const descricao = document.getElementById("descricao").value;
            if (ticketId >= 0 && ticketId < tickets.length) {
                const ticket = tickets[ticketId];
                if (novoStatus === "Não Aceito") {
                    ticket.status = novoStatus;
                    ticket.descricao = descricao;
                } else if (novoStatus === "Concluído") {
                    ticket.status = novoStatus;
                }
                updateTicket(ticketId, ticket);
                Swal.fire({
                    title: 'Sucesso!',
                    text: 'Status atualizado com sucesso!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = "./meus-tickets.html";
                });
            }
        });
    }

    const validateUser = (email, password) => {
        if (email.endsWith('@academico.domhelder.edu.br') ||
            email.endsWith('@domhelder.edu.br')) {
            return true;
        }
        return false;
    };

    const saveTicket = (ticket) => {
        const tickets = getTickets();
        tickets.push(ticket);
        localStorage.setItem("tickets", JSON.stringify(tickets));
    };

    const updateTicket = (index, updatedTicket) => {
        const tickets = getTickets();
        tickets[index] = updatedTicket;
        localStorage.setItem("tickets", JSON.stringify(tickets));
    };

    const getTickets = () => {
        return JSON.parse(localStorage.getItem("tickets")) || [];
    };

    const displayLoggedInUser = () => {
        const email = localStorage.getItem("loggedInUser");
        const userNameDisplay = document.getElementById("userName");
        const abrirTicketNav = document.getElementById("abrirTicketNav");
        const welcomeMessage = document.getElementById("welcomeMessage");

        if (email) {
            const userName = email.split('@')[0];
            if (email.endsWith('@academico.domhelder.edu.br')) {
                userNameDisplay.textContent = `Aluno(a) ${userName}`;
                if (abrirTicketNav) abrirTicketNav.style.display = 'block';
                if (welcomeMessage) welcomeMessage.textContent = `Olá, Aluno(a) ${userName}`;
            } else if (email.endsWith('@domhelder.edu.br') && email !== 'secretaria@domhelder.edu.br') {
                userNameDisplay.textContent = `Professor(a) ${userName}`;
                if (abrirTicketNav) abrirTicketNav.style.display = 'none';
                if (welcomeMessage) welcomeMessage.textContent = `Olá, Professor(a) ${userName}`;
            } else if (email === 'secretaria@domhelder.edu.br') {
                userNameDisplay.textContent = 'Responsável da Faculdade';
                if (abrirTicketNav) abrirTicketNav.style.display = 'none';
                if (welcomeMessage) welcomeMessage.textContent = 'Olá, Responsável da Faculdade';
            }
        }
    };

    const loadTickets = () => {
        const tickets = getTickets();
        const ticketsList = document.getElementById("ticketsList");
        const email = localStorage.getItem("loggedInUser");

        if (ticketsList) {
            tickets.forEach((ticket, index) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>#${index + 1}</td>
                    <td>${ticket.assunto}</td>
                    <td>${email.endsWith('@academico.domhelder.edu.br') ? ticket.responsavel : ticket.alunoEmail}</td>
                    <td>${ticket.dataAbertura}</td>
                    <td>${ticket.status}</td>
                    <td><a class="btn btn-primary" href="./visualizar-ticket.html?id=${index + 1}">Exibir</a></td>
                `;
                ticketsList.appendChild(tr);
            });
        }
    };

    const loadRecentTickets = () => {
        const tickets = getTickets();
        const recentTicketsList = document.getElementById("recentTicketsList");
        const email = localStorage.getItem("loggedInUser");

        if (recentTicketsList) {
            tickets.slice(-5).forEach((ticket, index) => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <i class="fas fa-ticket-alt"></i> ${ticket.assunto} - ${ticket.status}
                    <a href="./visualizar-ticket.html?id=${index + 1}" class="btn btn-sm btn-link">Exibir</a>
                `;
                recentTicketsList.appendChild(li);
            });
        }
    };

    const updateStatistics = () => {
        const tickets = getTickets();
        const openTicketsCount = document.getElementById("openTicketsCount");
        const answeredTicketsCount = document.getElementById("answeredTicketsCount");
        const pendingTicketsCount = document.getElementById("pendingTicketsCount");

        if (openTicketsCount && answeredTicketsCount && pendingTicketsCount) {
            const openTickets = tickets.filter(ticket => ticket.status === "Aberto").length;
            const answeredTickets = tickets.filter(ticket => ticket.status === "Respondido").length;
            const pendingTickets = tickets.filter(ticket => ticket.status !== "Concluído").length;

            openTicketsCount.textContent = openTickets;
            answeredTicketsCount.textContent = answeredTickets;
            pendingTicketsCount.textContent = pendingTickets;
        }
    };

    const displayTicketDetails = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const ticketId = parseInt(urlParams.get('id')) - 1;
        const tickets = getTickets();
        const email = localStorage.getItem("loggedInUser");

        if (ticketId >= 0 && ticketId < tickets.length) {
            const ticket = tickets[ticketId];
            document.getElementById("assunto").value = ticket.assunto;
            document.getElementById("categoria").value = ticket.categoria;
            document.getElementById("dataCriacao").value = ticket.dataAbertura;
            document.getElementById("criador").value = ticket.alunoEmail;
            document.getElementById("status").value = ticket.status;
            document.getElementById("responsavel").value = ticket.responsavel;
            document.getElementById("descricao").value = ticket.descricao;
            if (ticket.resposta) {
                document.getElementById("resposta").value = ticket.resposta;
                document.getElementById("respostaContainer").style.display = "block";
            }
            if (email.endsWith('@academico.domhelder.edu.br') && ticket.status === "Respondido") {
                document.getElementById("status").disabled = false;
                document.getElementById("descricao").disabled = false;
                document.getElementById("atualizarStatusBtn").style.display = "block";
            } else if (email.endsWith('@domhelder.edu.br') && email !== 'secretaria@domhelder.edu.br' && ticket.status !== "Concluído") {
                document.getElementById("resposta").disabled = false;
                document.getElementById("enviarRespostaBtn").style.display = "block";
                document.getElementById("respostaContainer").style.display = "block"; // Exibe o campo de resposta para o professor
            }
        }
    };

    displayLoggedInUser();
    loadTickets();
    displayTicketDetails();
    loadRecentTickets();
    updateStatistics();
});
