const CART_KEY = 'cart-v1';

function loadCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){return []}
}

function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function getTotal(cart){ return cart.reduce((s,i)=>s + (i.price * i.quantity),0); }

function updateBadge(){
  const cart = loadCart();
  const count = cart.reduce((s,i)=>s + i.quantity,0);
  const badge = document.getElementById('cartBadge');
  if(badge) badge.textContent = count;
}

function renderCart(){
  const cart = loadCart();
  const container = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if(!container || !totalEl) return;
  container.innerHTML = '';
  cart.forEach(item => {
    const priceLabel = window.SiteLocale ? window.SiteLocale.formatCurrency(item.price) : `$${item.price.toFixed(2)}`;
    const el = document.createElement('div'); el.className = 'cart-item';
    el.innerHTML = `<div><strong>${item.name}</strong><div style="font-size:.9rem;color:var(--accent-text)">${priceLabel} × ${item.quantity}</div></div><div><button data-id="${item.id}" class="qty-dec">-</button><span style="padding:0 8px">${item.quantity}</span><button data-id="${item.id}" class="qty-inc">+</button></div>`;
    container.appendChild(el);
  });
  totalEl.textContent = window.SiteLocale ? window.SiteLocale.formatCurrency(getTotal(cart)) : `$${getTotal(cart).toFixed(2)}`;
  updateBadge();
}

function addToCart(id,name,price,quantity=1){
  const cart = loadCart();
  const idx = cart.findIndex(i=>i.id===id);
  if(idx>-1) cart[idx].quantity += quantity; else cart.push({id,name,price:Number(price),quantity});
  saveCart(cart); renderCart();
}

function changeQty(id,delta){
  const cart = loadCart();
  const idx = cart.findIndex(i=>i.id===id); if(idx===-1) return;
  cart[idx].quantity += delta; if(cart[idx].quantity<=0) cart.splice(idx,1);
  saveCart(cart); renderCart();
}

async function checkout(){
  const btn = document.getElementById('checkoutBtn');
  const cart = loadCart();
  if(!cart.length) return;
  btn.disabled = true; btn.textContent = 'Redirecting...';
  try{
    const res = await fetch('/.netlify/functions/create-checkout-session',{
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({items: cart})
    });
    let dataText = await res.text();
    let data;
    try{ data = JSON.parse(dataText); }catch(e){ data = { error: dataText }; }
    if(res.ok && data.url) { window.location = data.url; return; }
    const msg = data && (data.error || data.message || JSON.stringify(data)) || 'Checkout failed';
    console.error('Checkout error response:', res.status, data);
    alert('Checkout error: ' + msg);
    btn.disabled=false; btn.textContent='Checkout';
  }catch(e){ console.error(e); alert('Checkout error'); btn.disabled=false; btn.textContent='Checkout' }
}

document.addEventListener('click', (e)=>{
  if(e.target.matches('.add-to-cart')){
    const btn = e.target;
    addToCart(btn.dataset.id, btn.dataset.name, parseFloat(btn.dataset.price));
    btn.textContent = window.SiteLocale ? window.SiteLocale.translate('addToCartLabel') + ' ✓' : 'Added ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = window.SiteLocale ? window.SiteLocale.translate('addToCartLabel') : 'Add to cart';
      btn.disabled = false;
    }, 900);
  }
  if(e.target.id==='cartButton'){ document.getElementById('cartPanel').classList.add('open'); document.getElementById('cartPanel').setAttribute('aria-hidden','false'); }
  if(e.target.id==='closeCart'){ document.getElementById('cartPanel').classList.remove('open'); document.getElementById('cartPanel').setAttribute('aria-hidden','true'); }
  if(e.target.matches('.qty-inc')){ changeQty(e.target.dataset.id,1); }
  if(e.target.matches('.qty-dec')){ changeQty(e.target.dataset.id,-1); }
});

document.addEventListener('DOMContentLoaded', ()=>{
  updateBadge(); renderCart();
  const checkoutBtn = document.getElementById('checkoutBtn'); if(checkoutBtn) checkoutBtn.addEventListener('click', checkout);
});
