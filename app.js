// Selecionar os elementos do DOM
const productForm = document.getElementById('productForm'); // Formulário de produtos
const productList = document.getElementById('productList'); // Lista onde os produtos serão exibidos
const searchInput = document.getElementById('search'); // Campo de busca de produtos
const alertBox = document.getElementById('alert'); // Novo balão de alerta
const totalDisplay = document.getElementById('totalDisplay'); // Elemento para exibir o total

// Carregar produtos do localStorage ou iniciar como array vazio
let products = JSON.parse(localStorage.getItem('products')) || []; // Obtém produtos armazenados ou inicia um array vazio

// Função para formatar valores monetários
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); // Formata o valor como moeda brasileira
}

// Função para calcular e exibir o total dos produtos
function updateTotal() {
    const total = products.reduce((sum, product) => sum + (product.price * product.quantity), 0); // Calcula o total
    totalDisplay.textContent = `Valor Total: ${formatCurrency(total)}`; // Exibe o total formatado
}

// Função para mostrar o balão de alerta
function showAlert(message) {
    alertBox.textContent = message; // Define o texto do alerta
    alertBox.style.display = 'block'; // Mostra o alerta
    setTimeout(() => {
        alertBox.style.display = 'none'; // Esconde o alerta após 5 segundos
    }, 5000); 
}

// Função para bloquear a entrada de números
function blockNumbers(event) {
    const key = event.key; // Captura a tecla pressionada
    // Permite apenas letras e algumas teclas especiais
    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]$/.test(key) && key !== "Backspace" && key !== "Tab" && key !== "Enter") {
        event.preventDefault(); // Impede a entrada se não for permitida
    }
}

// Adicionar evento para o campo de busca
searchInput.addEventListener('keydown', blockNumbers); // Bloqueia números na busca

// Adicionar evento para o campo de nome do produto
document.getElementById('name').addEventListener('keydown', blockNumbers); // Bloqueia números no campo de nome

// Função para renderizar a lista de produtos na interface
function renderProducts(filter = '') {
    productList.innerHTML = ''; // Limpar a lista existente
    // Filtra produtos pela pesquisa
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(filter.toLowerCase()) 
    );

    // Criar elementos para cada produto e adicioná-los à lista
    filteredProducts.forEach((product, index) => {
        const li = document.createElement('li'); // Cria um novo item de lista
        li.innerHTML =
            `<input type="checkbox" onchange="toggleCheck(${index}, this)" ${product.checked ? 'checked' : ''}>
            <span id="product-display-${index}" class="${product.checked ? 'checked' : ''}">
                <strong>${product.name}</strong> - ${formatCurrency(product.price)} - Quantidade: ${product.quantity} <br><br>
                Soma Total: ${formatCurrency(product.price * product.quantity)}
            </span>
            <div id="product-edit-${index}" class="product-edit" style="display: none;">
                <label for="name-${index}">Nome:</label>
                <input type="text" value="${product.name}" id="name-${index}" placeholder="Nome" />
                <label for="price-${index}">Preço:</label>
                <input type="number" min="0" step="0.01" value="${product.price}" id="price-${index}" placeholder="Preço" />
                <label for="quantity-${index}">Quantidade:</label>
                <input type="number" min="1" value="${product.quantity}" id="quantity-${index}" placeholder="Quantidade" />
            </div>
            <div class="button-container">
                <button class="edit-btn" onclick="toggleEdit(${index}, this)">Editar</button>
                <button class="remove-btn" onclick="deleteProduct(${index})">Remover</button>
            </div>`;
        productList.appendChild(li); // Adicionar item à lista
    });

    localStorage.setItem('products', JSON.stringify(products)); // Salvar lista atualizada no localStorage
    updateTotal(); // Atualizar o total exibido
}

// Adicionar um novo produto ao enviar o formulário
productForm.addEventListener('submit', function (e) {
    e.preventDefault(); // Evitar o envio padrão do formulário

    // Capturar valores dos campos do formulário
    const name = document.getElementById('name').value.trim(); // Captura o nome
    const price = parseFloat(document.getElementById('price').value); // Captura o preço
    const quantity = parseInt(document.getElementById('quantity').value); // Captura a quantidade

    // Validação dos campos
    if (!name || price <= 0 || quantity <= 0) {
        showAlert('Por favor, preencha os campos nome, preço e quantidade.'); // Usar balão de alerta
        return; // Impede a execução se a validação falhar
    }

    // Criar um novo objeto de produto
    const newProduct = {
        name,
        price,
        quantity,
        checked: false // Inicializa como não selecionado
    };

    products.push(newProduct); // Adicionar produto ao array
    renderProducts(); // Atualizar a lista
    productForm.reset(); // Limpar o formulário
});

// Alternar entre visualização e edição de um produto
function toggleEdit(index, button) {
    const displayDiv = document.getElementById(`product-display-${index}`); // Seleciona a visualização do produto
    const editDiv = document.getElementById(`product-edit-${index}`); // Seleciona a seção de edição

    // Mostrar ou ocultar as seções de edição e visualização
    if (editDiv.style.display === 'none') {
        displayDiv.style.display = 'none'; // Oculta a visualização
        editDiv.style.display = 'block'; // Mostra a seção de edição
        button.textContent = 'Salvar'; // Altera o texto do botão
        button.setAttribute('onclick', `validateAndSave(${index}, this)`); // Alterar função do botão
    }
}

// Validar e salvar as edições de um produto
function validateAndSave(index, button) {
    const nameField = document.getElementById(`name-${index}`); // Seleciona o campo de nome
    const priceField = document.getElementById(`price-${index}`); // Seleciona o campo de preço
    const quantityField = document.getElementById(`quantity-${index}`); // Seleciona o campo de quantidade

    // Capturar novos valores
    const newName = nameField.value.trim(); // Captura o novo nome
    const newPrice = parseFloat(priceField.value); // Captura o novo preço
    const newQuantity = parseInt(quantityField.value); // Captura a nova quantidade

    // Validação simples
    if (!newName || newPrice <= 0 || newQuantity <= 0) {
        showAlert('Por favor, preencha os campos nome, preço e quantidade.'); // Usar balão de alerta
        return; // Impede a execução do código se a validação falhar
    }

    // Se a validação passar, chama a função para salvar
    saveProduct(index); // Chama a função para salvar o produto
}

// Salvar as edições de um produto
function saveProduct(index) {
    const nameField = document.getElementById(`name-${index}`); // Seleciona o campo de nome
    const priceField = document.getElementById(`price-${index}`); // Seleciona o campo de preço
    const quantityField = document.getElementById(`quantity-${index}`); // Seleciona o campo de quantidade

    // Capturar novos valores
    const newName = nameField.value.trim(); // Captura o novo nome
    const newPrice = parseFloat(priceField.value); // Captura o novo preço
    const newQuantity = parseInt(quantityField.value); // Captura a nova quantidade

    // Atualizar produto no array
    products[index] = {
        name: newName,
        price: newPrice,
        quantity: newQuantity,
        checked: products[index].checked // Mantém o estado do checkbox
    };

    renderProducts(); // Atualizar a lista
}

// Remover um produto da lista
function deleteProduct(index) {
    products.splice(index, 1); // Remove produto do array
    renderProducts(); // Atualizar a lista
}

// Alternar o estado do checkbox para um produto
function toggleCheck(index, checkbox) {
    products[index].checked = checkbox.checked; // Atualiza estado do produto com base no checkbox
    const productDisplay = document.getElementById(`product-display-${index}`); // Seleciona a visualização do produto
    if (checkbox.checked) {
        productDisplay.classList.add('checked'); // Adiciona classe se marcado
    } else {
        productDisplay.classList.remove('checked'); // Remove classe se desmarcado
    }

    localStorage.setItem('products', JSON.stringify(products)); // Salvar lista atualizada no localStorage
    updateTotal(); // Atualizar total
}

// Filtrar produtos pela barra de busca
function searchProducts() {
    const filter = searchInput.value; // Captura valor do campo de busca
    renderProducts(filter); // Renderizar produtos filtrados
}

// Renderizar a lista de produtos ao carregar a página
window.onload = function () {
    renderProducts(); // Exibir produtos ao carregar
};