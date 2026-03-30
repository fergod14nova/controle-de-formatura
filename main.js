$(document).ready(function() {
    // Referência ao nó de testes no Firebase
    const testRef = database.ref('testes');
    
    // Atualizar status de conexão
    function atualizarStatus(conectado) {
        const statusDiv = $('#statusConexao');
        if (conectado) {
            statusDiv.html('<i class="fas fa-check-circle text-success"></i> ' +
                          '✅ Firebase conectado com sucesso!');
            statusDiv.removeClass('alert-secondary').addClass('alert-success');
            console.log("✅ Conexão com Firebase estabelecida");
        } else {
            statusDiv.html('<i class="fas fa-exclamation-triangle text-danger"></i> ' +
                          '❌ Erro na conexão com Firebase');
            statusDiv.removeClass('alert-secondary').addClass('alert-danger');
            console.error("❌ Erro na conexão com Firebase");
        }
    }
    
    // Testar conexão com o Firebase
    function testarConexao() {
        const connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                atualizarStatus(true);
            } else {
                atualizarStatus(false);
            }
        });
    }
    
    // Carregar dados do Firebase e exibir na tabela
    function carregarDados() {
        console.log("Carregando dados do Firebase...");
        
        testRef.on('value', (snapshot) => {
            const dados = snapshot.val();
            const tbody = $('#tabelaMensagens tbody');
            tbody.empty();
            
            if (dados) {
                // Converter objeto para array e ordenar por data (mais recente primeiro)
                const dadosArray = Object.entries(dados).map(([id, valor]) => ({
                    id: id,
                    ...valor
                })).sort((a, b) => b.dataHora - a.dataHora);
                
                dadosArray.forEach(item => {
                    const dataFormatada = new Date(item.dataHora).toLocaleString('pt-BR');
                    tbody.append(`
                        <tr>
                            <td><strong>${escapeHtml(item.nome)}</strong></td>
                            <td>${escapeHtml(item.mensagem || '-')}</td>
                            <td>${dataFormatada}</td>
                        </tr>
                    `);
                });
                
                console.log(`✅ ${dadosArray.length} registros carregados`);
                mostrarToast(`${dadosArray.length} registros carregados com sucesso!`, 'success');
            } else {
                tbody.append(`
                    <tr>
                        <td colspan="3" class="text-center text-muted">
                            <i class="fas fa-inbox"></i> Nenhum dado encontrado
                        </td>
                    </tr>
                `);
                console.log("ℹ️ Nenhum dado encontrado no Firebase");
                mostrarToast('Nenhum dado encontrado no banco de dados', 'info');
            }
        }, (error) => {
            console.error("Erro ao carregar dados:", error);
            mostrarToast('Erro ao carregar dados: ' + error.message, 'danger');
        });
    }
    
    // Inserir dados no Firebase
    function inserirDados(nome, mensagem) {
        if (!nome) {
            mostrarToast('Por favor, preencha o campo Nome!', 'warning');
            return false;
        }
        
        const dados = {
            nome: nome,
            mensagem: mensagem || '',
            dataHora: Date.now(),
            dataFormatada: new Date().toLocaleString('pt-BR')
        };
        
        console.log("Enviando dados para Firebase:", dados);
        
        // Gerar ID automático
        const novoRef = testRef.push();
        novoRef.set(dados)
            .then(() => {
                console.log("✅ Dados inseridos com sucesso! ID:", novoRef.key);
                mostrarToast(`Mensagem de ${nome} inserida com sucesso!`, 'success');
                // Limpar formulário
                $('#testForm')[0].reset();
            })
            .catch((error) => {
                console.error("❌ Erro ao inserir dados:", error);
                mostrarToast('Erro ao inserir dados: ' + error.message, 'danger');
            });
    }
    
    // Limpar todos os dados (apenas para teste)
    function limparDados() {
        if (confirm('⚠️ Tem certeza que deseja excluir TODOS os dados de teste? Esta ação não pode ser desfeita!')) {
            testRef.remove()
                .then(() => {
                    console.log("✅ Todos os dados foram removidos");
                    mostrarToast('Todos os dados foram removidos com sucesso!', 'success');
                })
                .catch((error) => {
                    console.error("❌ Erro ao remover dados:", error);
                    mostrarToast('Erro ao remover dados: ' + error.message, 'danger');
                });
        }
    }
    
    // Função para mostrar toast (notificação)
    function mostrarToast(mensagem, tipo = 'info') {
        // Criar elemento toast se não existir
        if ($('#toastContainer').length === 0) {
            $('body').append('<div id="toastContainer" style="position: fixed; top: 20px; right: 20px; z-index: 9999;"></div>');
        }
        
        const toastId = 'toast_' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white bg-${tipo} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="true" data-bs-delay="3000">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : tipo === 'danger' ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2"></i>
                        ${mensagem}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        $('#toastContainer').append(toastHtml);
        const toastElement = new bootstrap.Toast(document.getElementById(toastId));
        toastElement.show();
        
        // Remover toast após fechar
        $(document).on('hidden.bs.toast', `#${toastId}`, function() {
            $(this).remove();
        });
    }
    
    // Função para escapar HTML (segurança)
    function escapeHtml(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // Eventos jQuery
    $('#testForm').on('submit', function(e) {
        e.preventDefault();
        const nome = $('#nome').val().trim();
        const mensagem = $('#mensagem').val().trim();
        inserirDados(nome, mensagem);
    });
    
    $('#btnCarregar').on('click', function() {
        carregarDados();
    });
    
    $('#btnLimpar').on('click', function() {
        limparDados();
    });
    
    // Inicialização
    console.log("🚀 Sistema inicializado - jQuery pronto");
    testarConexao();
    carregarDados(); // Carregar dados automaticamente ao iniciar
});