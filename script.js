
const authManager = {
    init() {
        this.loadUsers();
        this.checkSession();
        this.setupAuthUI();
    },
    
    loadUsers() {
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                { username: 'admin', password: 'admin123', email: 'admin@cafeneaaroma.ro' },
                { username: 'user', password: 'user123', email: 'user@cafeneaaroma.ro' }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
    },
    
    checkSession() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            this.showLoggedInState(JSON.parse(currentUser));
        }
    },
    
    setupAuthUI() {
        const header = document.querySelector('header');
        const authContainer = document.createElement('div');
        authContainer.className = 'auth-container';
        authContainer.id = 'authContainer';
        
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            authContainer.innerHTML = `
                <span class="welcome-msg">Bun venit, ${user.username}!</span>
                <button class="auth-btn" id="logoutBtn">Logout</button>
            `;
        } else {
            authContainer.innerHTML = `
                <button class="auth-btn" id="loginBtn">Login</button>
            `;
        }
        
        header.appendChild(authContainer);
        this.attachAuthEvents();
    },
    
    attachAuthEvents() {
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showLoginModal();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('currentUser');
                location.reload();
            });
        }
    },
    
    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'loginModal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Autentificare</h3>
                <form id="loginForm">
                    <div class="form-group">
                        <label for="username">Username:</label>
                        <input type="text" id="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Parolă:</label>
                        <input type="password" id="password" required>
                    </div>
                    <button type="submit" class="submit-button">Login</button>
                    <p class="error-msg" id="loginError"></p>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    },
    
    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const users = JSON.parse(localStorage.getItem('users'));
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            document.getElementById('loginModal').remove();
            location.reload();
        } else {
            document.getElementById('loginError').textContent = 'Username sau parolă incorectă!';
        }
    },
    
    showLoggedInState(user) {
        console.log(`User ${user.username} is logged in`);
    }
};

const cartManager = {
    init() {
        this.loadCart();
        this.createCartUI();
        this.updateCartDisplay();
    },
    
    loadCart() {
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
    },
    
    createCartUI() {
        const cartBtn = document.createElement('button');
        cartBtn.className = 'cart-btn';
        cartBtn.id = 'cartBtn';
        cartBtn.innerHTML = '🛒 <span class="cart-count">0</span>';
        document.body.appendChild(cartBtn);
        
        cartBtn.addEventListener('click', () => this.showCart());
    },
    
    addToCart(item) {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const existingItem = cart.find(i => i.name === item.name);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...item, quantity: 1, id: Date.now() });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartDisplay();
        this.showNotification(`${item.name} adăugat în coș!`);
    },
    
    removeFromCart(itemId) {
        let cart = JSON.parse(localStorage.getItem('cart'));
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartDisplay();
    },
    
    updateCartDisplay() {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = count;
    },
    
    showCart() {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        let cartHTML = '<div class="cart-items">';
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            cartHTML += `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>${item.quantity} x ${item.price} lei</span>
                    <button class="remove-item" data-id="${item.id}">Șterge</button>
                </div>
            `;
        });
        
        cartHTML += `</div><div class="cart-total">Total: ${total} lei</div>`;
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>Coșul tău</h3>
                ${cartHTML}
                <button class="submit-button" id="clearCart">Golește coșul</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        modal.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.removeFromCart(id);
                modal.remove();
                this.showCart();
            });
        });
        
        document.getElementById('clearCart')?.addEventListener('click', () => {
            localStorage.setItem('cart', JSON.stringify([]));
            this.updateCartDisplay();
            modal.remove();
        });
    },
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
};

const menuManager = {
    init() {
        if (window.location.pathname.includes('meniu.html')) {
            this.loadMenuFromJSON();
            this.addBuyButtons();
        }
    },
    
    async loadMenuFromJSON() {
        try {
            const response = await fetch('menu-items.json'); // importa meniu dinamic AJAJAX
            const data = await response.json();
            this.displayMenuItems(data);
        } catch (error) {
            console.log('Folosim meniul existent din HTML');
        }
    },
    
    displayMenuItems(data) {
        
        console.log('Meniu încărcat:', data);
    },
    
    addBuyButtons() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const name = item.querySelector('h4').textContent;
            const priceText = item.querySelector('.price').textContent;
            const price = parseInt(priceText);
            
            const buyBtn = document.createElement('button');
            buyBtn.className = 'buy-btn';
            buyBtn.textContent = 'Adaugă în coș';
            buyBtn.addEventListener('click', () => {
                cartManager.addToCart({ name, price }); // Modifica DOM
            });
            
            item.appendChild(buyBtn);
        });
    }
};

const contactForm = {
    init() {
        if (window.location.pathname.includes('contact.html')) {
            this.setupForm();
            this.createCanvas();
        }
    },
    
    setupForm() {
        const submitBtn = document.querySelector('.submit-button');
        if (!submitBtn) return;
        
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.validateForm();
        });
        

        const inputs = document.querySelectorAll('#nume, #email, #subiect');
        inputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateField(e.target);
            });
        });
    },
    
    validateField(field) {
        const patterns = {
            nume: /^[A-Za-zĂÂÎȘȚăâîșț\s]{2,50}$/,
            email: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
            subiect: /^.{3,100}$/
        };
        
        const pattern = patterns[field.id];
        if (pattern && !pattern.test(field.value)) {
            field.style.borderColor = '#ff0000';
            return false;
        } else {
            field.style.borderColor = '#00ff00';
            return true;
        }
    },
    
    validateForm() {
        const nume = document.getElementById('nume');
        const email = document.getElementById('email');
        const subiect = document.getElementById('subiect');
        const mesaj = document.getElementById('mesaj');
        
        const isValid = [nume, email, subiect].every(field => this.validateField(field));
        
        if (isValid && mesaj.value.length >= 10) {
            this.saveMessage({
                nume: nume.value,
                email: email.value,
                subiect: subiect.value,
                mesaj: mesaj.value,
                data: new Date().toLocaleString('ro-RO')
            });
            
            cartManager.showNotification('Mesaj trimis cu succes!');
            [nume, email, subiect, mesaj].forEach(field => field.value = '');
        } else {
            cartManager.showNotification('Completează corect toate câmpurile!');
        }
    },
    
    saveMessage(message) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
    },
    
    createCanvas() {
        const mapSection = document.querySelector('.map-section');
        if (!mapSection) return;
        
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 300;
        canvas.style.maxWidth = '100%';
        canvas.style.border = '2px solid #6b4423';
        canvas.style.borderRadius = '10px';
        canvas.style.marginTop = '20px';
        
        mapSection.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        

        ctx.fillStyle = '#f0e6d2';
        ctx.fillRect(0, 0, 600, 300);
        
        
        ctx.strokeStyle = '#8b5a3c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(100, 0);
        ctx.lineTo(100, 300);
        ctx.moveTo(0, 150);
        ctx.lineTo(600, 150);
        ctx.stroke();
        
        
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.arc(100, 150, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#6b4423';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Cafenea Aroma', 130, 155);
        
        
        let radius = 20;
        let growing = true;
        setInterval(() => {
            ctx.fillStyle = '#f0e6d2';
            ctx.fillRect(80, 130, 40, 40);
            
            ctx.fillStyle = 'rgba(255, 107, 53, 0.5)';
            ctx.beginPath();
            ctx.arc(100, 150, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#ff6b35';
            ctx.beginPath();
            ctx.arc(100, 150, 20, 0, Math.PI * 2);
            ctx.fill();
            
            if (growing) {
                radius += 0.5;
                if (radius >= 30) growing = false;
            } else {
                radius -= 0.5;
                if (radius <= 20) growing = true;
            }
        }, 50);
    }
};


const svgManager = {
    init() {
        this.createSVGLogo();
    },
    
    createSVGLogo() {
        const logo = document.querySelector('.logo');
        if (!logo) return;
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '40');
        svg.setAttribute('height', '40');
        svg.setAttribute('viewBox', '0 0 50 50');
        svg.style.marginRight = '10px';
        svg.style.display = 'inline-block';
        svg.style.verticalAlign = 'middle';
        
        
        const cup = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        cup.setAttribute('d', 'M10,15 L10,35 Q10,40 15,40 L35,40 Q40,40 40,35 L40,15 Z');
        cup.setAttribute('fill', '#fff');
        cup.setAttribute('stroke', '#ff6b35');
        cup.setAttribute('stroke-width', '2');
        
        
        const steam1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        steam1.setAttribute('d', 'M15,10 Q15,5 20,5');
        steam1.setAttribute('stroke', '#fff');
        steam1.setAttribute('stroke-width', '2');
        steam1.setAttribute('fill', 'none');
        steam1.classList.add('steam');
        
        const steam2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        steam2.setAttribute('d', 'M25,10 Q25,5 30,5');
        steam2.setAttribute('stroke', '#fff');
        steam2.setAttribute('stroke-width', '2');
        steam2.setAttribute('fill', 'none');
        steam2.classList.add('steam');
        
        svg.appendChild(cup);
        svg.appendChild(steam1);
        svg.appendChild(steam2);
        
        logo.insertBefore(svg, logo.firstChild);
    }
};


const visualEffects = {
    init() {
        this.randomColorFeatures();
        this.setupScrollEffects();
        this.setupHoverEffects();
        this.createFloatingElements();
        this.setupKeyboardShortcuts();
    },
    
    randomColorFeatures() {
        const features = document.querySelectorAll('.feature-card');
        const colors = ['#ff6b35', '#6b4423', '#8b5a3c', '#ff8c5a'];
        
        features.forEach((feature, index) => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            feature.style.borderTop = `4px solid ${randomColor}`;
        });
    },
    
    setupScrollEffects() {
        const elements = document.querySelectorAll('.feature-card, .menu-item, .testimonial');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.6s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                }
            });
        });
        
        elements.forEach(el => observer.observe(el));
    },
    
    setupHoverEffects() {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                const computed = getComputedStyle(e.currentTarget);
                const currentBg = computed.backgroundColor;
                e.currentTarget.dataset.originalBg = currentBg;
                
                e.currentTarget.style.backgroundColor = '#fff5e6';
            });
            
            item.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.backgroundColor = e.currentTarget.dataset.originalBg || 'white';
            });
        });
    },
    
    createFloatingElements() {
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') return;
        
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        for (let i = 0; i < 5; i++) {
            const coffee = document.createElement('div');
            coffee.className = 'floating-coffee';
            coffee.textContent = '☕';
            coffee.style.left = `${Math.random() * 100}%`;
            coffee.style.animationDelay = `${Math.random() * 5}s`;
            coffee.style.fontSize = `${Math.random() * 20 + 20}px`;
            hero.appendChild(coffee);
        }
    },
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {

            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                cartManager.showCart();
            }
            
            
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                if (!localStorage.getItem('currentUser')) {
                    authManager.showLoginModal();
                }
            }
        });
    }
};


const statsManager = {
    init() {
        this.trackVisit();
        this.displayStats();
    },
    
    trackVisit() {
        const visits = JSON.parse(localStorage.getItem('visits') || '[]');
        visits.push({
            page: window.location.pathname,
            date: new Date().toISOString(),
            time: new Date().toLocaleTimeString('ro-RO')
        });
        localStorage.setItem('visits', JSON.stringify(visits));
    },
    
    displayStats() {
        const visits = JSON.parse(localStorage.getItem('visits') || '[]');
        console.log(`Total vizite: ${visits.length}`);
        
        
        const uniquePages = [...new Set(visits.map(v => v.page))];
        console.log('Pagini vizitate:', uniquePages.join(', '));
        
        
        if (visits.length > 0) {
            const today = new Date().toLocaleDateString('ro-RO');
            const todayVisits = visits.filter(v => 
                new Date(v.date).toLocaleDateString('ro-RO') === today
            );
            console.log(`Vizite azi: ${todayVisits.length}`);
        }
    }
};


const themeManager = {
    init() {
        this.createThemeToggle();
    },
    
    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'theme-toggle';
        toggle.textContent = '🌓';
        toggle.title = 'Schimbă tema';
        document.body.appendChild(toggle);
        
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
        });
    }
};


const promoManager = {
    init() {
        this.showRandomPromo();
    },
    
    showRandomPromo() {
        const promo = document.querySelector('.promo');
        if (!promo) return;
        
        const promos = [
            { text: 'Cappuccino + Croissant = doar 15 lei', details: 'Ofertă valabilă luni-vineri, 08:00-11:00' },
            { text: 'Reducere 20% la toate deserturile', details: 'Valabil în weekend' },
            { text: 'Cafea gratuită la a 5-a comandă', details: 'Programul de loialitate' },
            { text: 'Happy Hour: 17:00-19:00 - 10% reducere', details: 'Valabil zilnic' }
        ];
        
        const randomPromo = promos[Math.floor(Math.random() * promos.length)];
        
        promo.querySelector('p:first-of-type').textContent = randomPromo.text;
        promo.querySelector('.promo-details').textContent = randomPromo.details;
        
        
        setInterval(() => {
            const newPromo = promos[Math.floor(Math.random() * promos.length)];
            promo.querySelector('p:first-of-type').style.transition = 'opacity 0.3s';
            promo.querySelector('p:first-of-type').style.opacity = '0';
            
            setTimeout(() => {
                promo.querySelector('p:first-of-type').textContent = newPromo.text;
                promo.querySelector('.promo-details').textContent = newPromo.details;
                promo.querySelector('p:first-of-type').style.opacity = '1';
            }, 300);
        }, 10000);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    authManager.init(); // Atuentificare sesiune
    cartManager.init();
    menuManager.init();
    contactForm.init();
    svgManager.init();
    visualEffects.init();
    statsManager.init();
    themeManager.init();
    promoManager.init();
    
    console.log('🎉 Cafenea Aroma - JavaScript inițializat cu succes!');
    console.log('📊 Shortcuts: Ctrl+K (coș), Ctrl+L (login)');
});