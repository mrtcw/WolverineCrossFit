// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    mobileNav.style.display = expanded ? 'none' : 'block';
  });
}
// Cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = count;
  document.querySelectorAll('.cartCountDup').forEach(el => el.textContent = count);
}
updateCartCount();
// Subscribe
const subForm = document.getElementById('subscribeForm');
if (subForm) {
  subForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('subEmail').value.trim();
    const msg = document.getElementById('subMessage');
    const valid = /^\S+@\S+\.\S+$/.test(email);
    if (!valid) { msg.textContent = 'Please enter a valid email address.'; msg.style.color = '#B22222'; return; }
    const subs = JSON.parse(localStorage.getItem('subscribers') || '[]');
    subs.push({ email, ts: Date.now() });
    localStorage.setItem('subscribers', JSON.stringify(subs));
    msg.textContent = 'Subscribed! Check your inbox for updates.';
    msg.style.color = 'green';
    subForm.reset();
  });
}
// Add to Cart
document.querySelectorAll('.addToCart').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.product');
    const id = card.getAttribute('data-id');
    const name = card.getAttribute('data-name');
    const price = Number(card.getAttribute('data-price'));
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += 1; else cart.push({ id, name, price, qty: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    const cartMsg = document.getElementById('cartMessage');
    if (cartMsg) { cartMsg.textContent = `${name} added to cart.`; cartMsg.style.color = 'green'; }
  });
});
// Cart render
const cartItemsEl = document.getElementById('cartItems');
function renderCart() {
  if (!cartItemsEl) return;
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (cart.length === 0) { cartItemsEl.innerHTML = '<p>Your cart is empty.</p>'; return; }
  let total = 0;
  cartItemsEl.innerHTML = cart.map((item, idx) => {
    total += item.price * item.qty;
    return `
      <div class="cart-item">
        <div><strong>${item.name}</strong></div>
        <div>$${item.price.toFixed(2)}</div>
        <div>
          <button class="qty" data-i="${idx}" data-d="-1">-</button>
          <span style="padding:0 8px">${item.qty}</span>
          <button class="qty" data-i="${idx}" data-d="1">+</button>
        </div>
        <button class="remove" data-i="${idx}">Remove</button>
      </div>`;
  }).join('') + `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
  cartItemsEl.querySelectorAll('.qty').forEach(b => {
    b.addEventListener('click', () => {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const i = Number(b.getAttribute('data-i'));
      const d = Number(b.getAttribute('data-d'));
      cart[i].qty = Math.max(1, cart[i].qty + d);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart(); updateCartCount();
    });
  });
  cartItemsEl.querySelectorAll('.remove').forEach(b => {
    b.addEventListener('click', () => {
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const i = Number(b.getAttribute('data-i'));
      cart.splice(i, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart(); updateCartCount();
    });
  });
}
renderCart();
// Cart actions
const clearBtn = document.getElementById('clearCart');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    if (confirm('Clear your cart?')) {
      localStorage.setItem('cart', '[]');
      renderCart(); updateCartCount();
      const cartMsg = document.getElementById('cartMessage');
      if (cartMsg) { cartMsg.textContent = 'Cart cleared.'; cartMsg.style.color = '#B22222'; }
    }
  });
}
const processBtn = document.getElementById('processOrder');
if (processBtn) {
  processBtn.addEventListener('click', () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) { alert('Cart is empty.'); return; }
    sessionStorage.setItem('lastOrder', JSON.stringify({ items: cart, ts: Date.now() }));
    localStorage.setItem('cart', '[]');
    renderCart(); updateCartCount();
    alert('Order processed! (SessionStorage updated)');
  });
}
// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    const msgEl = document.getElementById('contactMessage');
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !message) {
      msgEl.textContent = 'Please complete all fields with a valid email.';
      msgEl.style.color = '#B22222';
      return;
    }
    const messages = JSON.parse(localStorage.getItem('messages') || '[]');
    messages.push({ name, email, message, ts: Date.now() });
    localStorage.setItem('messages', JSON.stringify(messages));
    msgEl.textContent = 'Thanks! Your message has been sent.';
    msgEl.style.color = 'green';
    contactForm.reset();
  });
}
// Booking form (SessionStorage)
const bookingForm = document.getElementById('bookingForm');
const sessionDataView = document.getElementById('sessionDataView');
function refreshSessionView() {
  if (!sessionDataView) return;
  const data = JSON.parse(sessionStorage.getItem('bookings') || '[]');
  sessionDataView.textContent = JSON.stringify(data, null, 2);
}
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const classType = document.getElementById('classType').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const bname = document.getElementById('bname').value.trim();
    const bemail = document.getElementById('bemail').value.trim();
    const msgEl = document.getElementById('bookingMessage');
    if (!classType || !date || !time || !bname || !/^\S+@\S+\.\S+$/.test(bemail)) {
      msgEl.textContent = 'Please fill all fields with a valid email.';
      msgEl.style.color = '#B22222';
      return;
    }
    const bookings = JSON.parse(sessionStorage.getItem('bookings') || '[]');
    bookings.push({ classType, date, time, bname, bemail, ts: Date.now() });
    sessionStorage.setItem('bookings', JSON.stringify(bookings));
    msgEl.textContent = 'Your first class is booked! Check the session data below.';
    msgEl.style.color = 'green';
    bookingForm.reset();
    refreshSessionView();
  });
  refreshSessionView();
}
