// Selecionar os elementos do DOM
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const searchInput = document.getElementById('search');
const errorMessage = document.getElementById('errorMessage');

// Array para armazenar os produtos, ou carregar do localStorage
let products = JSON.parse(localStorage.getItem('products')) || [];

// Função para renderizar a lista de produtos
function renderProducts(filter = '') {
    productList.innerHTML = ''; // Limpar a lista

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(filter.toLowerCase())
    );

    filteredProducts.forEach((product, index) => {
        const li = document.createElement('li');
        
        li.innerHTML = `
            <input type="checkbox" onchange="toggleCheck(${index}, this)" ${product.checked ? 'checked' : ''}>
            <span id="product-display-${index}" class="${product.checked ? 'checked' : ''}">
                <strong>${product.name}</strong> - R$${product.price} - Quantidade: ${product.quantity} <br><br>Total: R$${(product.price * product.quantity).toFixed(2)}
            </span>
            <div id="product-edit-${index}" style="display: none;">
                <input type="text" value="${product.name}" id="name-${index}" />
                - R$<input type="number" min="0" step="0.01" value="${product.price}" id="price-${index}" />
                - Quantidade: <input type="number" min="1" value="${product.quantity}" id="quantity-${index}" />
            </div>
            <div>
                <button class="edit-btn" onclick="toggleEdit(${index}, this)">Editar</button>
                <button class="remove-btn" onclick="deleteProduct(${index})">Remover</button>
            </div>
        `;

        productList.appendChild(li);
    });

    // Salvar a lista no localStorage sempre que ela for alterada
    localStorage.setItem('products', JSON.stringify(products));
}

// Função para adicionar um novo produto com validação
productForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);

    // Validação de campos
    if (!name || price <= 0 || quantity <= 0) {
        errorMessage.textContent = 'Por favor, insira valores válidos para nome, preço e quantidade.';
        errorMessage.style.display = 'block';
        return;
    } else {
        errorMessage.style.display = 'none';
    }

    const newProduct = {
        name,
        price: price.toFixed(2), // Armazena o preço conforme o usuário digitou
        quantity,
        checked: false
    };

    products.push(newProduct);
    renderProducts();

    // Limpar o formulário
    productForm.reset();
});

// Função para alternar entre edição e visualização
function toggleEdit(index, button) {
    const displayDiv = document.getElementById(`product-display-${index}`);
    const editDiv = document.getElementById(`product-edit-${index}`);
    
    if (editDiv.style.display === 'none') {
        displayDiv.style.display = 'none';
        editDiv.style.display = 'block';
        button.textContent = 'Salvar'; 
    } else {
        saveProduct(index); 
        displayDiv.style.display = 'block';
        editDiv.style.display = 'none';
        button.textContent = 'Editar'; 
    }
}

// Função para salvar as edições de um produto
function saveProduct(index) {
    const nameField = document.getElementById(`name-${index}`);
    const priceField = document.getElementById(`price-${index}`);
    const quantityField = document.getElementById(`quantity-${index}`);

    const newName = nameField.value.trim();
    const newPrice = parseFloat(priceField.value);
    const newQuantity = parseInt(quantityField.value);

    // Validação simples
    if (!newName || newPrice <= 0 || newQuantity <= 0) {
        errorMessage.textContent = 'Por favor, insira valores válidos para nome, preço e quantidade.';
        errorMessage.style.display = 'block';
        return;
    } else {
        errorMessage.style.display = 'none';
    }

    products[index] = {
        name: newName,
        price: newPrice.toFixed(2), // Atualiza o preço conforme o usuário digitou
        quantity: newQuantity,
        checked: products[index].checked 
    };

    renderProducts();
}

// Função para remover um produto
function deleteProduct(index) {
    products.splice(index, 1);
    renderProducts();
}

// Função para alternar o estado do checkbox
function toggleCheck(index, checkbox) {
    products[index].checked = checkbox.checked; // Atualiza o estado no array

    // Atualiza a classe do item com base no estado do checkbox
    const productDisplay = document.getElementById(`product-display-${index}`);
    if (checkbox.checked) {
        productDisplay.classList.add('checked'); // Adiciona a classe 'checked'
    } else {
        productDisplay.classList.remove('checked'); // Remove a classe 'checked'
    }

    // Salvar a lista no localStorage sempre que ela for alterada
    localStorage.setItem('products', JSON.stringify(products));
}

// Função para filtrar produtos pela barra de busca
function searchProducts() {
    const filter = searchInput.value;
    renderProducts(filter);
}

// Renderizar a lista de produtos ao carregar a página
window.onload = function() {
    renderProducts();
};