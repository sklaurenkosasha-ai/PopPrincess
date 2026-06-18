// ===== ЯНДЕКС.КАРТЫ =====
ymaps.ready(init);

function init() {
    var myMap = new ymaps.Map("yandexMap", {
        center: [43.796430, 131.949099],
        zoom: 17,
        controls: ['zoomControl', 'fullscreenControl']
    });

    var myPlacemark = new ymaps.Placemark([43.796430, 131.949099], {
        hintContent: 'PopPrincess',
        balloonContent: '<strong>PopPrincess</strong><br>г. Уссурийск, ул. Краснознаменная, 75<br>Цокольный этаж<br>☎ +7 (423) 555-23-23'
    }, {
        preset: 'islands#pinkIcon',
        iconColor: '#F4A2A2'
    });

    myMap.geoObjects.add(myPlacemark);
}

// ===== ТОВАРЫ =====
const products = [
    { id: 1, name: "Платье-футляр «Элегия»", price: 4590, img: "https://avatars.mds.yandex.net/get-mpic/17407955/2a0000019978bdd198b312cc33e91cbc973c/orig" },
    { id: 2, name: "Блуза шелковая «Aura»", price: 3290, img: "https://basket-14.wbbasket.ru/vol2128/part212805/212805529/images/big/1.webp" },
    { id: 3, name: "Юбка-миди «Лаванда»", price: 2890, img: "https://avatars.mds.yandex.net/i?id=dd90ad29d3e8d65c790ff5ebd60f567c_l-9677438-images-thumbs&n=13" },
    { id: 4, name: "Платье макси «Закат»", price: 5990, img: "https://avatars.mds.yandex.net/i?id=6c4712c610bc5ab1ac14888f2a27c8d1_sr-5241344-images-thumbs&n=13" },
    { id: 5, name: "Жакет «Золотая нить»", price: 4990, img: "https://avatars.mds.yandex.net/i?id=553ae28c2ee1b99ed317c0b5839191f7_l-4575620-images-thumbs&n=13" },
    { id: 6, name: "Сумка-шоппер «Princess»", price: 2390, img: "https://avatars.mds.yandex.net/i?id=fee17abb36060d97e1f3af8ea1b3bcb0f345f678-11404303-images-thumbs&n=13" }
];

// ===== КОРЗИНА =====
let cart = JSON.parse(localStorage.getItem('popprincess_cart')) || [];

function saveCart() {
    localStorage.setItem('popprincess_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').innerText = count;
    const cartContainer = document.getElementById('cartItemsList');
    if (!cartContainer) return;
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; padding:20px;">Ваша корзина пуста, добавьте понравившиеся вещи 🛍️</p>';
        document.getElementById('cartTotalPrice').innerText = `Итого: 0 ₽`;
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `<div class="cart-item"><div><strong>${item.name}</strong><br><span>${item.price}₽ x ${item.quantity}</span></div><div>${itemTotal}₽ <button class="remove-item" data-id="${item.id}" style="background:none; border:none; color:#D4AF6A; margin-left:10px; cursor:pointer;"><i class="fas fa-trash-alt"></i></button></div></div>`;
    });
    cartContainer.innerHTML = html;
    document.getElementById('cartTotalPrice').innerText = `Итого: ${total} ₽`;
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            cart = cart.filter(item => item.id !== id);
            saveCart();
            showToast('Товар удален');
        });
    });
}

function addToCart(product, quantity = 1) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });
    saveCart();
    showToast(`${product.name} добавлен в корзину ✨`);
}

function showToast(msg) {
    const toast = document.getElementById('toastMessage');
    toast.innerText = msg;
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 2000);
}

// ===== ОТРИСОВКА ТОВАРОВ =====
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    products.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<img class="product-img" src="${prod.img}" alt="${prod.name}"><div class="product-info"><div class="product-title">${prod.name}</div><div class="product-price">${prod.price.toLocaleString()} ₽</div><button class="add-to-cart-btn" data-id="${prod.id}"><i class="fas fa-bag-shopping"></i> В корзину</button></div>`;
        const btn = card.querySelector('.add-to-cart-btn');
        btn.addEventListener('click', () => addToCart(prod));
        grid.appendChild(card);
    });
}

// ===== МОДАЛЬНОЕ ОКНО КОРЗИНЫ =====
const modal = document.getElementById('cartModal');
document.getElementById('cartIcon').onclick = () => {
    modal.style.display = 'flex';
    updateCartUI();
};
document.getElementById('closeModalBtn').onclick = () => {
    modal.style.display = 'none';
};
window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
};
document.getElementById('proceedToCheckoutBtn')?.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
});

// ===== ФОРМА ЗАКАЗА =====
document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fullName').value.trim();
    if (!name || !document.getElementById('phone').value.trim() || !document.getElementById('email').value.trim() || !document.getElementById('address').value.trim()) {
        alert('Заполните все поля доставки');
        return;
    }
    if (cart.length === 0) {
        alert('Корзина пуста');
        return;
    }
    const totalSum = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    alert(`✅ Спасибо, ${name}! Заказ на сумму ${totalSum}₽ принят. Менеджер свяжется с вами.`);
    cart = [];
    saveCart();
    document.getElementById('orderForm').reset();
    modal.style.display = 'none';
    showToast('Заказ оформлен! Ждём вас снова ❤️');
});

// ===== ПЛАВНАЯ ПРОКРУТКА =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === "#") return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== ИНИЦИАЛИЗАЦИЯ =====
renderProducts();
updateCartUI();
