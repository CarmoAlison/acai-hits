// DOM Elements
const menuButton = document.getElementById('menu-button');
const menuModal = document.getElementById('menu-modal');
const cartModal = document.getElementById('cart-modal');
const checkoutModal = document.getElementById('checkout-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const addToCartButtons = document.querySelectorAll('.add-to-cart');
const cartButton = document.getElementById('cart-button');
const floatingCart = document.getElementById('floating-cart');
const checkoutButton = document.getElementById('checkout-button');
const continueShopping = document.getElementById('continue-shopping');
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
const sizeOptions = document.querySelectorAll('.size-option');
const optionItems = document.querySelectorAll('.option-item');
const deliveryForm = document.getElementById('delivery-form');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCount = document.querySelector('.cart-count');
const addCustomToCart = document.getElementById('add-custom-to-cart');

// Cart data
let cart = [];

// Toggle Menu
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Open Menu Modal
menuButton.addEventListener('click', () => {
    menuModal.classList.add('active');
});

// Open Cart Modal
cartButton.addEventListener('click', () => {
    updateCartModal();
    cartModal.classList.add('active');
});

// Floating cart button
floatingCart.addEventListener('click', () => {
    updateCartModal();
    cartModal.classList.add('active');
});

// Open Checkout Modal
checkoutButton.addEventListener('click', () => {
    cartModal.classList.remove('active');
    checkoutModal.classList.add('active');
});

// Continue Shopping
continueShopping.addEventListener('click', () => {
    cartModal.classList.remove('active');
});

// Close Modals
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        menuModal.classList.remove('active');
        cartModal.classList.remove('active');
        checkoutModal.classList.remove('active');
    });
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === menuModal) menuModal.classList.remove('active');
    if (e.target === cartModal) cartModal.classList.remove('active');
    if (e.target === checkoutModal) checkoutModal.classList.remove('active');
});

// Size selection
sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
        sizeOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        updateCustomSummary();
    });
});

// Option selection
optionItems.forEach(item => {
    item.addEventListener('click', () => {
        const group = item.dataset.group;
        const maxSelections = getMaxSelectionsForGroup(group);

        // Get currently selected items in this group
        const selectedItems = document.querySelectorAll(`.option-item[data-group="${group}"].active`);

        // For groups that allow multiple selections
        if (maxSelections > 1) {
            if (item.classList.contains('active')) {
                item.classList.remove('active');
            } else {
                if (selectedItems.length < maxSelections) {
                    item.classList.add('active');
                } else {
                    showNotification(`Você só pode escolher ${maxSelections} opções para este grupo`);
                }
            }
        }
        // For groups that allow only one selection
        else {
            // Remove active class from all items in this group
            document.querySelectorAll(`.option-item[data-group="${group}"]`).forEach(i => {
                i.classList.remove('active');
            });
            // Add active class to clicked item
            item.classList.add('active');
        }

        updateCustomSummary();
    });
});

// Get max selections for a group
function getMaxSelectionsForGroup(group) {
    const activeSize = document.querySelector('.size-option.active');
    if (!activeSize) return 0;

    const size = parseInt(activeSize.dataset.size);

    switch (group) {
        case 'cremes':
            return 2;
        case 'coberturas':
            return 1;
        case 'frutas':
            return size === 500 ? 2 : 1;
        case 'acompanhamentos':
            return size === 500 ? 5 : 3;
        default:
            return 0;
    }
}

// Update custom summary
function updateCustomSummary() {
    const activeSize = document.querySelector('.size-option.active');
    if (!activeSize) return;

    const size = activeSize.dataset.size;
    const price = parseFloat(activeSize.dataset.price);

    // Get selected cremes
    const selectedCremes = document.querySelectorAll('.option-item[data-group="cremes"].active');
    const cremesText = selectedCremes.length > 0 ?
        Array.from(selectedCremes).map(item => item.dataset.name).join(', ') :
        'Nenhum selecionado';

    // Get selected coberturas
    const selectedCoberturas = document.querySelectorAll('.option-item[data-group="coberturas"].active');
    const coberturasText = selectedCoberturas.length > 0 ?
        selectedCoberturas[0].dataset.name :
        'Nenhum selecionado';

    // Get selected frutas
    const selectedFrutas = document.querySelectorAll('.option-item[data-group="frutas"].active');
    const frutasText = selectedFrutas.length > 0 ?
        Array.from(selectedFrutas).map(item => item.dataset.name).join(', ') :
        'Nenhum selecionado';

    // Get selected acompanhamentos
    const selectedAcompanhamentos = document.querySelectorAll('.option-item[data-group="acompanhamentos"].active');
    const acompanhamentosText = selectedAcompanhamentos.length > 0 ?
        Array.from(selectedAcompanhamentos).map(item => item.dataset.name).join(', ') :
        'Nenhum selecionado';

    // Update summary
    document.getElementById('summary-size').textContent = `${size}ml`;
    document.getElementById('summary-cremes').textContent = cremesText;
    document.getElementById('summary-coberturas').textContent = coberturasText;
    document.getElementById('summary-frutas').textContent = frutasText;
    document.getElementById('summary-acompanhamentos').textContent = acompanhamentosText;
    document.getElementById('summary-total').textContent = `R$ ${price.toFixed(2).replace('.', ',')}`;
}

// Add custom açaí to cart
addCustomToCart.addEventListener('click', () => {
    const activeSize = document.querySelector('.size-option.active');
    if (!activeSize) {
        showNotification('Por favor, selecione um tamanho');
        return;
    }

    const size = activeSize.dataset.size;
    const price = parseFloat(activeSize.dataset.price);

    // Get selected options
    const selectedCremes = Array.from(document.querySelectorAll('.option-item[data-group="cremes"].active')).map(item => item.dataset.name);
    const selectedCoberturas = Array.from(document.querySelectorAll('.option-item[data-group="coberturas"].active')).map(item => item.dataset.name);
    const selectedFrutas = Array.from(document.querySelectorAll('.option-item[data-group="frutas"].active')).map(item => item.dataset.name);
    const selectedAcompanhamentos = Array.from(document.querySelectorAll('.option-item[data-group="acompanhamentos"].active')).map(item => item.dataset.name);

    // Validate selections
    const maxCremes = 2;
    const maxCoberturas = 1;
    const maxFrutas = size === '500' ? 2 : 1;
    const maxAcompanhamentos = size === '500' ? 5 : 3;

    if (selectedCremes.length > maxCremes) {
        showNotification(`Você só pode escolher ${maxCremes} cremes`);
        return;
    }

    if (selectedCoberturas.length > maxCoberturas) {
        showNotification(`Você só pode escolher ${maxCoberturas} cobertura`);
        return;
    }

    if (selectedFrutas.length > maxFrutas) {
        showNotification(`Você só pode escolher ${maxFrutas} fruta${maxFrutas > 1 ? 's' : ''}`);
        return;
    }

    if (selectedAcompanhamentos.length > maxAcompanhamentos) {
        showNotification(`Você só pode escolher ${maxAcompanhamentos} acompanhamentos`);
        return;
    }

    // Create item object
    const item = {
        id: Date.now(),
        name: 'Açaí Personalizado',
        size: `${size}ml`,
        price: price,
        cremes: selectedCremes,
        coberturas: selectedCoberturas,
        frutas: selectedFrutas,
        acompanhamentos: selectedAcompanhamentos,
        quantity: 1
    };

    // Add to cart
    addToCart(item);

    // Reset customizations
    resetCustomization();

    // Show success message
    showNotification('Açaí personalizado adicionado ao carrinho!');
});

// Reset customization
function resetCustomization() {
    // Reset size selection to 300ml
    sizeOptions.forEach(opt => opt.classList.remove('active'));
    sizeOptions[0].classList.add('active');

    // Reset all options
    optionItems.forEach(item => item.classList.remove('active'));

    // Update summary
    updateCustomSummary();
}

// Add to cart function
function addToCart(item) {
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(cartItem =>
        cartItem.name === item.name &&
        cartItem.size === item.size &&
        JSON.stringify(cartItem.cremes) === JSON.stringify(item.cremes) &&
        JSON.stringify(cartItem.coberturas) === JSON.stringify(item.coberturas) &&
        JSON.stringify(cartItem.frutas) === JSON.stringify(item.frutas) &&
        JSON.stringify(cartItem.acompanhamentos) === JSON.stringify(item.acompanhamentos)
    );

    if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        cart[existingItemIndex].quantity += item.quantity;
    } else {
        // Add new item to cart
        cart.push(item);
    }

    // Update cart UI
    updateCartUI();
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    document.querySelector('.floating-cart .cart-count').textContent = totalItems;

    // Show floating cart if there are items
    if (totalItems > 0) {
        floatingCart.style.display = 'flex';
    } else {
        floatingCart.style.display = 'none';
    }
}

// Update cart modal
function updateCartModal() {
    // Clear current items
    cartItemsContainer.innerHTML = '';

    // Add items to modal
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');
        cartItemElement.dataset.id = item.id;

        let details = '';
        if (item.name === 'Açaí Personalizado') {
            details = `${item.size} - ${item.cremes.length} cremes, ${item.coberturas.length} cobertura, ${item.frutas.length} fruta(s), ${item.acompanhamentos.length} acompanhamentos`;
        } else {
            details = item.size;
        }

        cartItemElement.innerHTML = `
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>${details} - Quantidade: ${item.quantity}</p>
                    </div>
                    <div class="item-price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
                    <div class="item-actions">
                        <button class="remove-item"><i class="fas fa-trash"></i></button>
                    </div>
                `;

        cartItemsContainer.appendChild(cartItemElement);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function () {
            const itemId = parseInt(this.closest('.cart-item').dataset.id);
            removeFromCart(itemId);
        });
    });

    // Update total price
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    cartTotalPrice.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartUI();
    updateCartModal();
}

// Add to cart buttons for specials
addToCartButtons.forEach(button => {
    button.addEventListener('click', function () {
        const name = this.dataset.name;
        const size = this.dataset.size;
        const price = parseFloat(this.dataset.price);
        const quantity = parseInt(this.closest('.product-actions').querySelector('.quantity span').textContent);

        const item = {
            id: Date.now(),
            name: name,
            size: `${size}ml`,
            price: price,
            quantity: quantity
        };

        addToCart(item);
        showNotification('Item adicionado ao carrinho!');
    });
});

// Quantity controls for specials
document.querySelectorAll('.quantity').forEach(control => {
    const decrement = control.querySelector('.decrement');
    const increment = control.querySelector('.increment');
    const quantity = control.querySelector('span');

    decrement.addEventListener('click', () => {
        let qty = parseInt(quantity.textContent);
        if (qty > 1) {
            quantity.textContent = qty - 1;
        }
    });

    increment.addEventListener('click', () => {
        let qty = parseInt(quantity.textContent);
        quantity.textContent = qty + 1;
    });
});


// Form submission
deliveryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const location = document.getElementById('location').value;
    const payment = document.getElementById('payment').value;
    const notes = document.getElementById('notes').value;

    // Create WhatsApp message
    let message = `*NOVO PEDIDO - AÇAÍ DO BOM*%0A%0A` +
        `*Nome:* ${name}%0A` +
        `*Endereço:* ${address}%0A` +
        `*Local de entrega:* ${location}%0A` +
        `*Forma de pagamento:* ${payment}%0A` +
        `*Observações:* ${notes || 'Nenhuma'}%0A%0A` +
        `*Itens do pedido:*%0A`;

    // Add items to message
    cart.forEach(item => {
        if (item.name === 'Açaí Personalizado') {
            message += `- ${item.name} (${item.size}) - R$${item.price.toFixed(2)}%0A`;
            message += `  Cremes: ${item.cremes.join(', ')}%0A`;
            message += `  Cobertura: ${item.coberturas.join(', ')}%0A`;
            message += `  Frutas: ${item.frutas.join(', ')}%0A`;
            message += `  Acompanhamentos: ${item.acompanhamentos.join(', ')}%0A`;
        } else {
            message += `- ${item.name} (${item.size}) - ${item.quantity}x R$${item.price.toFixed(2)} = R$${(item.price * item.quantity).toFixed(2)}%0A`;
        }
    });

    // Add total
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    message += `%0A*TOTAL: R$${totalPrice.toFixed(2)}*`;

    // Create WhatsApp link
    const whatsappLink = `https://wa.me/5584996002433?text=${encodeURIComponent(message)}`;

    try {
        // Generate PDF
        const pdfBlob = await generatePDF(name, address, location, payment, notes);
        
        // Create a download link for the PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = pdfUrl;
        downloadLink.download = `Pedido_Açaí_${Date.now()}.pdf`;
        
        // Adiciona o link ao documento
        document.body.appendChild(downloadLink);
        
        // Simula o clique no link de download
        downloadLink.click();
        
        // Aguarda 500ms para garantir que o download foi iniciado
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Abre o WhatsApp em uma nova aba
        window.open(whatsappLink, '_blank');
        
        // Remove o link do documento
        document.body.removeChild(downloadLink);
        
        // Close modal
        checkoutModal.classList.remove('active');

        // Reset cart
        cart = [];
        updateCartUI();

        // Show success message
        showNotification('Pedido enviado com sucesso! PDF gerado.', 'success');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showNotification('Erro ao processar o pedido. Por favor, tente novamente.', 'error');
    }
});

// Generate PDF function
async function generatePDF(name, address, location, payment, notes) {
    // Carrega a biblioteca jsPDF
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    
    // Verifica se a biblioteca foi carregada corretamente
    if (!window.jspdf) {
        throw new Error('Biblioteca jsPDF não carregada');
    }
    
    const { jsPDF } = window.jspdf;
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Comprovante de Pedido', pageWidth/2, 20, { align: 'center' });
    
    // Informações da loja
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('Açaí do Bom - O melhor açaí da região!', pageWidth/2, 30, { align: 'center' });
    doc.text('Tel: (84) 99600-2433', pageWidth/2, 37, { align: 'center' });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(margin, 45, pageWidth - margin, 45);
    
    // Client information
    doc.setFontSize(14);
    doc.text('Dados do Cliente:', margin, 55);
    
    doc.setFontSize(12);
    doc.text(`Nome: ${name}`, margin, 65);
    doc.text(`Endereço: ${address}`, margin, 75);
    doc.text(`Local de Entrega: ${location}`, margin, 85);
    doc.text(`Forma de Pagamento: ${payment}`, margin, 95);
    doc.text(`Observações: ${notes || 'Nenhuma'}`, margin, 105);
    
    // Line separator
    doc.line(margin, 115, pageWidth - margin, 115);
    
    // Order items
    let yPos = 125;
    doc.setFontSize(14);
    doc.text('Itens do Pedido:', margin, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    cart.forEach(item => {
        if (yPos > 280) {
            doc.addPage();
            yPos = 20;
        }
        
        if (item.name === 'Açaí Personalizado') {
            doc.setFont(undefined, 'bold');
            doc.text(`${item.name} (${item.size}) - R$${item.price.toFixed(2)}`, margin, yPos);
            doc.setFont(undefined, 'normal');
            yPos += 7;
            doc.text(`• Cremes: ${item.cremes.join(', ')}`, margin + 5, yPos);
            yPos += 7;
            doc.text(`• Cobertura: ${item.coberturas.join(', ')}`, margin + 5, yPos);
            yPos += 7;
            doc.text(`• Frutas: ${item.frutas.join(', ')}`, margin + 5, yPos);
            yPos += 7;
            doc.text(`• Acompanhamentos: ${item.acompanhamentos.join(', ')}`, margin + 5, yPos);
            yPos += 10;
        } else {
            doc.text(`${item.name} (${item.size}) - ${item.quantity}x R$${item.price.toFixed(2)} = R$${(item.price * item.quantity).toFixed(2)}`, margin, yPos);
            yPos += 10;
        }
    });
    
    // Total
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: R$${totalPrice.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    
    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Data: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth/2, 290, { align: 'center' });
    
    // Generate PDF blob
    return doc.output('blob');
}

// Function to load script dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Show notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to body
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize
updateCustomSummary();