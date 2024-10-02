// Selecionar os elementos do DOM
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const searchInput = document.getElementById('search');
const alertBox = document.getElementById('alert');
const totalDisplay = document.getElementById('totalDisplay');
const quantityInput = document.getElementById('quantity');
const unitSelect = document.getElementById('unitSelect');

// Carregar produtos do localStorage ou iniciar como array vazio
let products = JSON.parse(localStorage.getItem('products')) || [];

// Função para formatar valores monetários
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para calcular e exibir o total dos produtos
function updateTotal() {
    const total = products.reduce((sum, product) => {
        if (product.unit === 'Unidade') {
            return sum + (product.price * product.quantity);
        } else {
            return sum + product.price;
        }
    }, 0);
    totalDisplay.textContent = `Valor Total: ${formatCurrency(total)}`;
}

// Função para mostrar o balão de alerta
function showAlert(message) {
    alertBox.textContent = message;
    alertBox.style.display = 'block';
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
}

// Função para bloquear a entrada de números
function blockNumbers(event) {
    const key = event.key;
    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]$/.test(key) && !["Backspace", "Tab", "Enter"].includes(key)) {
        event.preventDefault();
    }
}

// Adicionar evento para bloquear números nos campos
document.getElementById('name').addEventListener('keydown', blockNumbers);
searchInput.addEventListener('keydown', blockNumbers);

// Adicionar evento para validar a entrada de números decimais ou inteiros
quantityInput.addEventListener('input', function () {
    const unit = unitSelect.value;
    const value = quantityInput.value;

    // Verifica se a unidade é Kg ou Gr
    if (unit === 'Kg' || unit === 'Gr') {
        // Permite apenas números decimais ou inteiros
        if (!/^\d*\.?\d*$/.test(value)) {
            quantityInput.setCustomValidity('Por favor, insira um número decimal válido.');
        } else {
            quantityInput.setCustomValidity(''); // Reseta a mensagem de validade
        }
    } else {
        // Permite apenas números inteiros para Unidade
        if (!/^\d+$/.test(value)) {
            quantityInput.setCustomValidity('Por favor, insira um número inteiro válido.');
        } else {
            quantityInput.setCustomValidity(''); // Reseta a mensagem de validade
        }
    }
});

// Função para mudar o placeholder do campo de quantidade
unitSelect.addEventListener('change', function () {
    updateQuantityPlaceholder();
    quantityInput.value = ''; // Reseta o valor ao mudar a unidade
});

// Função para atualizar o placeholder do campo de quantidade
function updateQuantityPlaceholder() {
    const selectedUnit = unitSelect.options[unitSelect.selectedIndex].text; // Obtém a unidade selecionada
    quantityInput.placeholder = selectedUnit; // Altera o placeholder para a unidade selecionada
}

// Função para renderizar a lista de produtos na interface
function renderProducts(filter = '') {
    productList.innerHTML = '';

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(filter.toLowerCase())
    );

    filteredProducts.forEach((product, index) => {
        const li = document.createElement('li');
        const total = product.unit === 'Unidade' ? (product.price * product.quantity) : product.price;
        li.innerHTML = `
            <input type="checkbox" onchange="toggleCheck(${index}, this)" ${product.checked ? 'checked' : ''}>
            <span id="product-display-${index}" class="${product.checked ? 'checked' : ''}">
                <strong>${product.name}</strong> - ${formatCurrency(product.price)} - ${product.quantity} ${product.unit.charAt(0).toUpperCase() + product.unit.slice(1).toLowerCase()} <br>
                Soma Total: ${formatCurrency(total)}
            </span>
            <div id="product-edit-${index}" class="product-edit" style="display: none;">
                <label for="name-${index}">Nome:</label>
                <input type="text" value="${product.name}" id="name-${index}" placeholder="Nome" />
                <label for="price-${index}">Preço:</label>
                <input type="number" min="0" step="0.01" value="${product.price}" id="price-${index}" placeholder="Preço" />
                <label for="quantity-${index}"></label>
                <input type="number" min="0" value="${product.quantity}" id="quantity-${index}" placeholder="Unidade" />
                <select id="unitSelect-${index}">
                    <option value="Unidade" ${product.unit === 'Unidade' ? 'selected' : ''}>Unidade</option>
                    <option value="Kg" ${product.unit === 'Kg' ? 'selected' : ''}>Kg</option>
                    <option value="Mg" ${product.unit === 'Mg' ? 'selected' : ''}>Mg</option>
                </select>
            </div>
            <div class="button-container">
                <button class="edit-btn" onclick="toggleEdit(${index}, this)">Editar</button>
                <button class="remove-btn" onclick="deleteProduct(${index})">Remover</button>
            </div>`;
        productList.appendChild(li);
    });

    localStorage.setItem('products', JSON.stringify(products));
    updateTotal();
}

// Adicionar um novo produto ao enviar o formulário
productForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseFloat(quantityInput.value); // Permite decimais
    const unit = unitSelect.value.charAt(0).toUpperCase() + unitSelect.value.slice(1).toLowerCase(); // Formata a unidade

    // Ajuste na condição para permitir decimais ao selecionar Kg ou Gr
    if (!name || price <= 0 || (unit === 'Unidade' ? (!Number.isInteger(quantity) || quantity <= 0) : (isNaN(quantity) || quantity <= 0))) {
        showAlert('Por favor, preencha os campos nome, preço e quantidade de forma válida.');
        return;
    }

    const newProduct = { name, price, quantity, unit, checked: false };
    products.push(newProduct);
    renderProducts();
    productForm.reset();
    updateQuantityPlaceholder(); // Atualiza o placeholder após adicionar o produto
});

// Alternar entre visualização e edição de um produto
function toggleEdit(index, button) {
    const displayDiv = document.getElementById(`product-display-${index}`);
    const editDiv = document.getElementById(`product-edit-${index}`);

    if (editDiv.style.display === 'none') {
        displayDiv.style.display = 'none';
        editDiv.style.display = 'block';
        button.textContent = 'Salvar';
        button.setAttribute('onclick', `validateAndSave(${index}, this)`);
    }
}

// Validar e salvar as edições de um produto
function validateAndSave(index, button) {
    const nameField = document.getElementById(`name-${index}`);
    const priceField = document.getElementById(`price-${index}`);
    const quantityField = document.getElementById(`quantity-${index}`);
    const unitField = document.getElementById(`unitSelect-${index}`);

    const newName = nameField.value.trim();
    const newPrice = parseFloat(priceField.value);
    const newQuantity = parseFloat(quantityField.value); // Permite decimais

    // Ajuste na condição para permitir decimais ao selecionar Kg ou Gr
    if (!newName || newPrice <= 0 || (unitField.value === 'Unidade' ? (!Number.isInteger(newQuantity) || newQuantity <= 0) : (isNaN(newQuantity) || newQuantity <= 0))) {
        showAlert('Por favor, preencha os campos nome, preço e quantidade de forma válida.');
        return;
    }

    saveProduct(index);
}

// Salvar as edições de um produto
function saveProduct(index) {
    const nameField = document.getElementById(`name-${index}`);
    const priceField = document.getElementById(`price-${index}`);
    const quantityField = document.getElementById(`quantity-${index}`);
    const unitField = document.getElementById(`unitSelect-${index}`);

    products[index] = {
        name: nameField.value.trim(),
        price: parseFloat(priceField.value),
        quantity: parseFloat(quantityField.value), // Permite decimais
        unit: unitField.value.charAt(0).toUpperCase() + unitField.value.slice(1).toLowerCase(), // Formata a unidade
        checked: products[index].checked
    };

    renderProducts();
}

// Remover um produto da lista
function deleteProduct(index) {
    products.splice(index, 1);
    renderProducts();
}

// Alternar o estado de verificação de um produto
function toggleCheck(index, checkbox) {
    products[index].checked = checkbox.checked;
    renderProducts();
}

// Filtrar produtos com base na entrada de pesquisa
searchInput.addEventListener('input', function () {
    renderProducts(searchInput.value);
});

// Função para limpar a lista de produtos
function clearProductList() {
    products = [];
    localStorage.removeItem('products');
    renderProducts();
}

// Adicionar evento ao botão de limpar
document.getElementById('clearListButton').addEventListener('click', clearProductList);

// Renderizar os produtos inicialmente
renderProducts();
updateQuantityPlaceholder();