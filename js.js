// ==========================================================================
// 1. المتغيرات الأساسية
// ==========================================================================
let cart = []; 

// ==========================================================================
// شاشة الصيانة
// ==========================================================================
// لتفعيل الصيانة: اكتب في Console: showMaintenance()
// لإلغاء الصيانة: اكتب في Console: hideMaintenance()
function showMaintenance() {
    const screen = document.getElementById('maintenance-screen');
    if (screen) {
        const dateEl = document.getElementById('maintenance-date');
        if (dateEl) dateEl.textContent = new Date().toLocaleDateString('ar-EG');
        screen.style.display = 'flex';
        screen.style.alignItems = 'center';
        screen.style.justifyContent = 'center';
        document.body.style.overflow = 'hidden';
        localStorage.setItem('maintenanceMode', 'on');
    }
}
function hideMaintenance() {
    const screen = document.getElementById('maintenance-screen');
    if (screen) {
        screen.style.display = 'none';
        document.body.style.overflow = '';
        localStorage.removeItem('maintenanceMode');
    }
}
// فحص عند تحميل الصفحة
if (localStorage.getItem('maintenanceMode') === 'on') {
    document.addEventListener('DOMContentLoaded', () => {
        const screen = document.getElementById('maintenance-screen');
        if (screen) {
            const dateEl = document.getElementById('maintenance-date');
            if (dateEl) dateEl.textContent = new Date().toLocaleDateString('ar-EG');
            screen.style.display = 'flex';
            screen.style.alignItems = 'center';
            screen.style.justifyContent = 'center';
            document.body.style.overflow = 'hidden';
        }
    });
}

// تهيئة EmailJS
try { if (typeof emailjs !== 'undefined') emailjs.init("3xKGgYOdYgVChJOsh"); } catch(e) {}

// ولشاشة التحميل (الـ Loader)
// إضافة تأثير التحميل للصور فور تحميل الـ DOM (قبل ما الصور تنتهي)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.a1 img').forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
            img.classList.add('img-loading');
            img.addEventListener('load', () => img.classList.remove('img-loading'));
            img.addEventListener('error', () => img.classList.remove('img-loading'));
        }
    });
});

window.addEventListener("load", () => {
    // قفل السكرول لمدة 2 ثانية حتى تنتهي شاشة التحميل
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    setTimeout(() => {
        const loader = document.getElementById("loader");
        if (loader) {
            loader.style.transform = "scale(1.08)";
            loader.style.filter = "blur(4px)";
            loader.style.opacity = "0";
            loader.style.transition = "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
            setTimeout(() => {
                if (loader.parentNode) loader.remove();
            }, 600);
        }
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        window.scrollTo({ top: 0, behavior: 'instant' });
        checkOnlineStatus();
    }, 3600);
});

window.addEventListener('online', () => hideOfflineWarning());
window.addEventListener('offline', () => showOfflineWarning());

function checkOnlineStatus() {
    if (!navigator.onLine) showOfflineWarning();
}

function showOfflineWarning() {
    let banner = document.getElementById('offline-banner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'offline-banner';
        banner.className = 'offline-banner';
        banner.innerHTML = '⚠️ أنت غير متصل بالإنترنت';
        document.body.prepend(banner);
        banner.classList.add('show');
    } else {
        banner.classList.add('show');
    }
}

function hideOfflineWarning() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.remove('show');
}


// ==========================================================================
// 2. دوال السلة (إضافة، تحديث، حذف، حفظ)
// ==========================================================================
// حفظ السلة في LocalStorage
function saveCart() {
    localStorage.setItem('myCart', JSON.stringify(cart));
}

// دالة إضافة منتج للسلة
function addToCart(name, price, imageUrl) {
    name = name.trim();
    let existingItem = cart.find(item => item.name === name);
    try {
        let audio = new Audio('click.mp3');
        audio.play();
    } catch(e) {}

    if (!imageUrl) imageUrl = getProductImage(name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name: name, price: price, imageUrl, quantity: 1 });
    }

    saveCart();
    updateCartUI();

    // أنيميشن لأيقونة السلة
    let cartIcon = document.querySelector('#cart-count')?.closest('.nav-icon');
    if (cartIcon) {
        cartIcon.classList.remove('cart-bounce');
        void cartIcon.offsetWidth;
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);
    }

    // أنيميشن لكرت المنتج (فلاش أخضر)
    let cards = document.querySelectorAll('.a1');
    for (let card of cards) {
        let p = card.querySelector('p');
        if (p && p.innerText.trim() === name) {
            card.classList.remove('product-flash');
            void card.offsetWidth;
            card.classList.add('product-flash');
            setTimeout(() => card.classList.remove('product-flash'), 500);
            break;
        }
    }

    showToast("تمت إضافة " + name + " للسلة! 🛒");
}

// دالة تحديث السلة
function updateCartUI() {
    let container = document.getElementById('cart-items');
    let cartCount = document.getElementById('cart-count');
    let summary = document.getElementById('cart-summary');
    let subtotalEl = document.getElementById('cart-subtotal');

    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <span class="cart-empty-icon">🛒</span>
                سلة المشتريات فارغة
                <button class="cart-shop-btn" onclick="closeCart()">اذهب للتسوق</button>
            </div>`;
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.style.display = "inline";
        } else {
            cartCount.style.display = "none";
        }
    }
        if (summary) summary.style.display = "none";
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        let price = parseFloat(item.price) || 0;
        let subtotal = price * item.quantity;
        total += subtotal;
        let imgSrc = item.imageUrl || getProductImage(item.name);

        container.innerHTML += `
            <div class="cart-item" data-index="${index}">
                <img class="cart-item-img" src="${imgSrc}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80/333/666?text=?'" onclick="openProductFromCard('${item.name.replace(/'/g, "\\'")}')">
                <div class="cart-item-info" onclick="openProductFromCard('${item.name.replace(/'/g, "\\'")}')">
                    <span class="cart-item-name">${item.name}</span>
                    <span class="cart-item-price">${price} ج.م</span>
                    <div class="qty-stepper">
                        <button onclick="event.stopPropagation(); changeQty(${index}, -1)">−</button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" data-index="${index}" oninput="setQty(this)" onclick="event.stopPropagation()">
                        <button onclick="event.stopPropagation(); changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <span class="cart-item-subtotal">${subtotal} ج.م</span>
                <button class="cart-item-remove" onclick="event.stopPropagation(); removeItem(${index})">حذف</button>
            </div>`;
    });

    // تحديث عداد السلة
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.style.display = "inline";
        } else {
            cartCount.style.display = "none";
        }
    }
    if (summary) {
        summary.style.display = "block";
        subtotalEl.textContent = total + " ج.م";
    }
}

function changeQty(index, delta) {
    if (!cart[index]) return;
    cart[index].quantity = Math.max(1, cart[index].quantity + delta);
    saveCart();
    recalcCart();
}

function setQty(input) {
    let index = parseInt(input.dataset.index);
    if (isNaN(index) || !cart[index]) return;
    let val = parseInt(input.value);
    if (isNaN(val) || val < 1) val = 1;
    if (val !== cart[index].quantity) {
        cart[index].quantity = val;
        saveCart();
    }
    recalcCart();
}

function recalcCart() {
    // تحديث subtotal لكل منتج والإجمالي الكلي بدون إعادة بناء HTML
    let total = 0;
    document.querySelectorAll('#cart-items .cart-item').forEach((el, i) => {
        if (!cart[i]) return;
        let price = parseFloat(cart[i].price) || 0;
        let subtotal = price * cart[i].quantity;
        total += subtotal;
        // تحديث قيمة input
        let input = el.querySelector('.qty-input');
        if (input) input.value = cart[i].quantity;
        // تحديث subtotal
        let subEl = el.querySelector('.cart-item-subtotal');
        if (subEl) subEl.textContent = subtotal + ' ج.م';
    });
    // تحديث الإجمالي الكلي
    let subtotalEl = document.getElementById('cart-subtotal');
    if (subtotalEl) subtotalEl.textContent = total + ' ج.م';
    // تحديث عداد السلة
    let cartCount = document.getElementById('cart-count');
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.style.display = "inline";
        } else {
            cartCount.style.display = "none";
        }
    }
}

function getProductImage(name) {
    let cards = document.querySelectorAll('.a1');
    for (let card of cards) {
        let p = card.querySelector('p');
        if (p && p.innerText.trim() === name) {
            let img = card.querySelector('img');
            if (img) return img.src;
        }
    }
    return 'https://via.placeholder.com/80/333/666?text=?';
}

function updateQty(index, newQty) {
    if (newQty < 1) newQty = 1;
    cart[index].quantity = parseInt(newQty);
    saveCart();
    recalcCart();
}

// حذف منتج من السلة
function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

// عرض ملخص الطلب قبل الإرسال
function showOrderReview() {
    if (cart.length === 0) {
        document.getElementById('alert-modal')?.showModal();
        return;
    }
    let profile = JSON.parse(localStorage.getItem('customerProfile'));
    if (!profile) {
        document.getElementById('profile-modal')?.showModal();
        return;
    }

    let container = document.getElementById('review-items');
    let total = 0;
    container.innerHTML = '';

    cart.forEach((item, i) => {
        let price = parseFloat(item.price) || 0;
        let subtotal = price * item.quantity;
        total += subtotal;
        let name = item.name || 'منتج ' + (i + 1);
        container.innerHTML += `
            <div class="review-item">
                <span class="review-item-name">${i + 1}. ${name}</span>
                <span class="review-item-price">${price} ج.م</span>
                <span class="review-item-qty">x${item.quantity}</span>
                <span class="review-item-subtotal">${subtotal} ج.م</span>
            </div>`;
    });

    document.getElementById('review-total-amount').textContent = total + ' ج.م';
    document.getElementById('review-address-input').value = profile.address || '';
    document.getElementById('review-modal').showModal();
}

// فتح نافذة السلة (بدون pushState عشان ما يعملش back)
function openCart() {
    let cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.showModal();
        lockScroll();
    }
    document.body.classList.add('cart-modal-open');
}

// دالة إغلاق أي نافذة (dialog)
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.close(); 
        // لا تضف أي سطر هنا يخص overflow أو classList
    }
}
// ==========================================================================
// 3. دوال إتمام الطلب وبيانات العميل
// ==========================================================================

function showForm() {
    let form = document.getElementById('order-details-form');
    let confirmBtn = document.getElementById('confirm-order-btn');
    let showBtn = document.getElementById('show-form-btn');
    
    if (form) form.style.display = 'block';
    if (confirmBtn) confirmBtn.style.display = 'block';
    if (showBtn) showBtn.style.display = 'none';
}
async function sendOrder(btn) {
    let reviewModal = document.getElementById('review-modal');
    if (!btn) btn = reviewModal?.querySelector('.checkout-btn');

    // التحقق من السلة
    if (cart.length === 0) {
        let alertModal = document.getElementById('alert-modal');

        if (alertModal) {
            alertModal.showModal();
        } else {
            alert("⚠️ سلتك فارغة حالياً!");
        }

        return;
    }

    // التحقق من البروفايل
    let profile = JSON.parse(localStorage.getItem('customerProfile'));

    if (!profile || !profile.shop || !profile.phone || !profile.address) {
        let validationModal = document.getElementById('validation-modal');

        if (validationModal) {
            validationModal.showModal();
        } else {
            alert("⚠️ أكمل جميع البيانات");
        }

        return;
    }

    let confirmBtn = btn || document.getElementById('confirm-order-btn');
    let originalText = "تأكيد الطلب";

    if (confirmBtn) {
        originalText = confirmBtn.innerText;
        confirmBtn.innerText = "...جاري الإرسال";
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = "0.7";
        confirmBtn.style.cursor = "wait";
    }

    try {

        // التحقق من اتصال Supabase
        if (typeof supabaseClient === 'undefined') {
            throw new Error("supabase_not_ready");
        }

        // تفاصيل المنتجات
        let cartDetails = cart.map((item, index) =>
            `${index + 1}. ${item.name} (${item.quantity})`
        ).join('\n');

    // استخدام العنوان المعدل من شاشة المراجعة (بدون تعديل البروفايل)
    let deliveryAddress = document.getElementById('review-address-input')?.value.trim() || profile.address || '';

        // =====================================
        // حفظ الطلب في Supabase
        // =====================================

        const { data, error } = await supabaseClient
            .from('orders')
            .insert([
                {
                    shop_name: profile.shop,
                    phone_number: profile.phone,
                    cart_details: cartDetails,
                    address: deliveryAddress,
                }
            ]);

        if (error) {
            throw error;
        }

        console.log("Supabase Success:", data);

        // =====================================
        // إرسال EmailJS (غير إجباري - لا يمنع نجاح الطلب)
        // =====================================

            try {
                if (typeof emailjs !== 'undefined') {
                    await emailjs.send(
                        'service_n44lkxg',
                        'template_s3kgnc8',
                        {
                            shop_name: profile.shop,
                            phone_number: profile.phone,
                            address: deliveryAddress,
                            cart_details: cartDetails
                        }
                    );
                }
        } catch (emailErr) {
            console.warn("EmailJS error (non-blocking):", emailErr);
        }

        // =====================================
        // نجاح العملية
        // =====================================

        cart = [];
        saveCart();
        updateCartUI();

        document.getElementById('review-modal')?.close();
        document.getElementById('cart-modal')?.close();

        let successModal = document.getElementById('success-modal');
        if (successModal) successModal.showModal();

    } catch (err) {

        console.error("ORDER ERROR:", err);

        let msg = err.message || "خطأ غير معروف";
        if (msg === "supabase_not_ready") {
            msg = "مكتبة Supabase لم يتم تحميلها - تأكد من اتصال الإنترنت";
        } else if (msg.includes("relation") && msg.includes("does not exist")) {
            msg = "جدول الطلبات غير موجود في قاعدة البيانات";
        } else if (msg.includes("permission denied") || msg.includes("violates row-level security")) {
            msg = "صلاحيات قاعدة البيانات تمنع الإرسال - تأكد من إعدادات RLS في Supabase";
        } else if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
            msg = "مشكلة في الاتصال بالإنترنت أو قاعدة البيانات";
        }

        alert("❌ " + msg);

    } finally {

        if (confirmBtn) {
            confirmBtn.innerText = originalText;
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = "1";
            confirmBtn.style.cursor = "pointer";
        }

    }
    
}
async function saveProfile() {

    const shop = document.getElementById('user-shop').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const address = document.getElementById('user-address').value.trim();

    // التحقق من رقم الهاتف
    if (!/^01[0-9]{9}$/.test(phone)) {
        alert("⚠️ رقم الهاتف غير صحيح!");
        return;
    }

    // التحقق من البيانات
    if (!shop || !address) {
        document.getElementById('validation-modal').showModal();
        return;
    }

    const profileData = {
        shop,
        phone,
        address
    };

    // حفظ محلي
    localStorage.setItem(
        "customerProfile",
        JSON.stringify(profileData)
    );

    localStorage.setItem("userShop", shop);
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("userAddress", address);

    try {

        // حفظ في Supabase
        const { error } = await supabaseClient
    .from("profiles")
    .upsert(
        {
            shop_name: shop,
            phone_number: phone,
            address: address
        },
        {
            onConflict: "phone_number"
        }
    );

        if (error) {
    console.error(error);
    alert(error.message);
    return;
}

        showToast("تم حفظ البيانات بنجاح ✅");
        document.getElementById("profile-modal").close();

    } catch (err) {

        console.error(err);
        alert("حدث خطأ غير متوقع");

    }
}

// ==========================================================================
// 4. دوال واجهة المستخدم (بحث، قوائم، تكبير صور، تنبيهات)
// ==========================================================================

let toastTimer;

function showToast(message) {
    let toast = document.getElementById("toast");
    if(toast) {
        clearTimeout(toastTimer);
        toast.innerText = message || "تمت العملية بنجاح";
        toast.classList.add("show");
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2000);
    }
}

function zoomImage(imgSrc) {
    let sideMenu = document.getElementById("side-menu");
    if (sideMenu && sideMenu.style.width === "250px") return;
    
    let modal = document.getElementById('zoom-modal');
    let zoomedImg = document.getElementById('zoomed-img');
    if (modal && zoomedImg) {
        zoomedImg.src = imgSrc;
        modal.style.display = 'flex';
        lockScroll();
    }
}

function closeZoom() {
    let modal = document.getElementById('zoom-modal');
    if (modal) {
        modal.style.display = 'none';
        unlockScroll();
    }
}

function toggleMenu() {
    let menu = document.getElementById("side-menu");
    let overlay = document.getElementById("menu-overlay");
    if (!menu || !overlay) return;
    
    let isOpen = menu.style.width === "250px";
    menu.style.width = isOpen ? "0" : "250px";
    overlay.style.display = isOpen ? "none" : "block";
    if (isOpen) {
        unlockScroll();
    } else {
        lockScroll();
    }
}

function searchProducts() {
    let input = document.getElementById('searchInput').value.trim().toLowerCase();
    document.querySelectorAll('.section-box').forEach(section => {
        let items = section.getElementsByClassName('a1');
        let hasMatch = false;
        for (let i = 0; i < items.length; i++) {
            let pTags = items[i].getElementsByTagName('p');
            let name = pTags.length > 0 ? pTags[0].innerText.toLowerCase() : "";
            items[i].style.display = (name.includes(input)) ? "" : "none";
            if (name.includes(input)) hasMatch = true;
        }
        section.style.display = hasMatch ? "" : "none";
    });
}

function copyNumber(elementId) {
    let el = document.getElementById(elementId);
    if (el) {
        let text = el.innerText;
        navigator.clipboard.writeText(text).then(() => showToast("تم نسخ الرقم: " + text));
    }
}

function openFilterModal() {
    let modal = document.getElementById('filter-modal');
    if (modal) modal.showModal();
}

function filterByCategory(category) {
    let sections = document.querySelectorAll('.section-box');
    sections.forEach(section => {
        if (category === 'all' || section.getAttribute('data-category') === category) {
            section.style.display = "block";
        } else {
            section.style.display = "none";
        }
    });
    let modal = document.getElementById('filter-modal');
    if (modal) modal.close(); 
}

window.onscroll = () => {
    let btn = document.getElementById("backToTop");
    if(btn) btn.style.display = (window.scrollY > 300) ? "block" : "none";
};

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 5. أحداث التحميل والمراقبة (تحدث مرة واحدة عند فتح الصفحة)
// ==========================================================================

window.addEventListener('load', () => {
    // 1. تحميل بيانات السلة
    let savedCart = localStorage.getItem('myCart');
    if (savedCart) {
        try { cart = JSON.parse(savedCart); } catch(e) { cart = []; }
    }
    updateCartUI(); 

    // 2. تحميل بيانات العميل
    let savedProfile = localStorage.getItem('customerProfile');
    if (savedProfile) {
        try {
            let profile = JSON.parse(savedProfile);
            if(document.getElementById('user-shop')) document.getElementById('user-shop').value = profile.shop || "";
            if(document.getElementById('user-phone')) document.getElementById('user-phone').value = profile.phone || "";
            if(document.getElementById('user-address')) document.getElementById('user-address').value = profile.address || "";
        } catch(e) { console.error("Error loading profile"); }
    }

    // 3. تأثير ظهور الكروت عند التمرير (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });
    document.querySelectorAll('.a1').forEach(card => observer.observe(card));
});

// إغلاق السلة بشكل تام بدون أي side effects
function closeCart() {
    let modal = document.getElementById('cart-modal');
    if (modal) {
        modal.close();
        // الـ MutationObserver يتولى التحقق من أي dialog أو شاشة منتج مفتوحة
    }
    document.body.classList.remove('cart-modal-open');
}

// منع السلوك الافتراضي للـ cancel في السلة (لأن بعض المتصفحات تعمل history.back)
document.getElementById('cart-modal')?.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeCart();
});

// إغلاق النوافذ المنبثقة (Dialogs) عند الضغط خارجها
document.querySelectorAll('dialog:not(#cart-modal)').forEach(modal => {
    modal.addEventListener('click', (e) => {
        const dialogDimensions = modal.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            modal.close();
        }
    });
});

// منع السكرول عند فتح أي dialog أو شاشة المنتج وإرجاعه عند الإغلاق
const dialogObserver = new MutationObserver(() => {
    let anyDialogOpen = [...document.querySelectorAll('dialog')].some(d => d.open);
    let overlay = document.getElementById('product-overlay');
    let overlayOpen = overlay && overlay.classList.contains('show');
    if (anyDialogOpen || overlayOpen) {
        lockScroll();
    } else {
        unlockScroll();
    }
});
document.querySelectorAll('dialog').forEach(d => dialogObserver.observe(d, { attributes: true, attributeFilter: ['open'] }));




    // 3. تسجيل تطبيق الويب (PWA) عشان ينزل على الموبايل
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
        .then(reg => {
            console.log("تم تفعيل التطبيق بنجاح!");
            // بعد تسجيل الـ SW، نخزن كل الصور الموجودة في الكاش
            if (reg.active) {
                cacheAllImages();
            } else {
                reg.addEventListener('statechange', () => {
                    if (reg.active) cacheAllImages();
                });
            }
        })
        .catch(err => console.log("خطأ في تفعيل التطبيق: ", err));
    }

async function cacheAllImages() {
    if (!('caches' in window)) return;
    const cache = await caches.open('sharkawey-v1');
    const images = document.querySelectorAll('img');
    for (const img of images) {
        const src = img.getAttribute('src') || img.src;
        if (src && !src.startsWith('data:')) {
            try {
                const res = await fetch(src);
                if (res.ok) cache.put(src, res);
            } catch(e) {}
        }
    }
}
// // نقوم بسحب دالة createClient مباشرة من المكتبة المحملة
// const { createClient } = supabase;

function getTracker(status){

    let step = 1;

    if(status === "قيد المراجعة") step = 1;
    if(status === "جاري التجهيز") step = 2;
    if(status === "خرج للتوصيل") step = 3;
    if(status === "تم التسليم") step = 4;

    return `

    <div class="order-progress">

        <div class="step ${step>=1?'active':''}">
            <div class="circle">✓</div>
            <span>قيد المراجعة</span>
        </div>

        <div class="line ${step>=2?'active':''}"></div>

        <div class="step ${step>=2?'active':''}">
            <div class="circle">✓</div>
            <span>جاري التجهيز</span>
        </div>

        <div class="line ${step>=3?'active':''}"></div>

        <div class="step ${step>=3?'active':''}">
            <div class="circle">✓</div>
            <span>خرج للتوصيل</span>
        </div>

        <div class="line ${step>=4?'active':''}"></div>

        <div class="step ${step>=4?'active':''}">
            <div class="circle">✓</div>
            <span>تم التسليم</span>
        </div>

    </div>

    `;
}

async function showMyOrders() {

    const profile =
        JSON.parse(localStorage.getItem("customerProfile"));

    // التحقق من البروفايل

    if (!profile) {
        let profileModal = document.getElementById('profile-modal');

        if (profileModal) {
            profileModal.showModal();
        }

        return;
    }

    const modal =
        document.getElementById("orders-modal");

    const list =
        document.getElementById("orders-list");

    list.innerHTML = "جاري تحميل الطلبات...";

    modal.showModal();

    const { data, error } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("phone_number", profile.phone)
        .order("id", { ascending: false });

    if (error) {

        list.innerHTML =
            "حدث خطأ أثناء تحميل الطلبات";

        console.error(error);

        return;
    }

    if (!data.length) {

        list.innerHTML =
            "لا توجد طلبات سابقة";

        return;
    }

list.innerHTML = data.map(order => `

<div class="order-card">

    <div class="order-header">
        <div class="order-id">طلب #${order.id}</div>
        <div class="order-status">${order.status}</div>
    </div>

    ${getTracker(order.status)}

    <div class="order-items">
        ${order.cart_details}
    </div>

${
order.status === "تم التسليم"
? `
    <button class="reorder-btn" onclick="reorderOrder('${order.cart_details.replace(/'/g, "\\'").replace(/\n/g, "\\n")}')">♻️ إعادة الطلب</button>
<div class="rating-box">
        <span class="spans">ما مدي تقييمك للطلب ؟</span>

    <div class="stars">
        <span onclick="rateOrder(${order.id},1,this)"
        class="${order.rating >= 1 ? 'active' : ''}">★</span>

        <span onclick="rateOrder(${order.id},2,this)"
        class="${order.rating >= 2 ? 'active' : ''}">★</span>

        <span onclick="rateOrder(${order.id},3,this)"
        class="${order.rating >= 3 ? 'active' : ''}">★</span>

        <span onclick="rateOrder(${order.id},4,this)"
        class="${order.rating >= 4 ? 'active' : ''}">★</span>

        <span onclick="rateOrder(${order.id},5,this)"
        class="${order.rating >= 5 ? 'active' : ''}">★</span>

    </div>

</div>
`
: ""
}

</div>

`).join("");
}

function reorderOrder(cartDetails) {
    let items = cartDetails.split('\n').filter(l => l.trim());
    if (!items.length) return;

    // parse كل سطر بال pattern: رقم. اسم (كمية)
    let parsed = [];
    items.forEach(line => {
        let match = line.match(/^\d+\.\s+(.+?)\s+\((\d+)\)/);
        if (match) {
            let name = match[1].trim();
            let qty = parseInt(match[2]) || 1;
            // البحث عن السعر من كروت المنتجات
            let price = 0;
            document.querySelectorAll('.a1').forEach(card => {
                let p = card.querySelector('p');
                if (p && p.innerText.trim() === name) {
                    let btn = card.querySelector('.order-button');
                    if (btn) {
                        let m = btn.getAttribute('onclick')?.match(/addToCart\('[^']*',\s*(\d+)\)/);
                        if (m) price = parseInt(m[1]);
                    }
                }
            });
            parsed.push({ name, qty, price });
        }
    });

    if (!parsed.length) {
        showToast("⚠️ لا يمكن إعادة الطلب، بيانات غير متوفرة");
        return;
    }

    // إضافة كل المنتجات للسلة
    parsed.forEach(item => {
        let existing = cart.find(c => c.name === item.name);
        if (existing) {
            existing.quantity += item.qty;
        } else {
            cart.push({ name: item.name, price: item.price, quantity: item.qty, imageUrl: getProductImage(item.name) });
        }
    });

    saveCart();
    updateCartUI();
    document.getElementById('orders-modal')?.close();
    showToast("♻️ تم إعادة الطلب بنجاح!");
    openCart();
}


async function rateOrder(orderId, rating, element){
    const stars =
        element.parentElement.querySelectorAll("span");

    stars.forEach((star,index)=>{

        if(index < rating){
            star.classList.add("active");
        }else{
            star.classList.remove("active");
        }

    });

    const { error } = await supabaseClient
        .from("orders")
        .update({
            rating: rating
        })
        .eq("id", orderId);

    if(error){
        console.error(error);
        alert("حدث خطأ يرجي اعادة المحاولة  ");
        return;
    }

    showToast("تم حفظ التقييم ⭐");
}


// متغير لحفظ بيانات المنتج الحالي لزر الإضافة
let currentProduct = {};
let currentProductImages = [];
let currentImageIndex = 0;
let wasFromCart = false;

function openProductFromCard(name) {
    document.querySelectorAll('.a1').forEach(card => {
        let p = card.querySelector('p');
        if (p && p.innerText.trim() === name) {
            let img = card.querySelector('img');
            let price = '';
            let images = '';
            let desc = '';
            let packSize = '';
            if (img) {
                let onclick = img.getAttribute('onclick') || '';
                let m = onclick.match(/openProductModal\s*\([^)]+\)/);
                if (m) {
                    try {
                        let args = m[0].replace(/^openProductModal\s*\(\s*/, '').replace(/\s*\)\s*$/, '');
                        let parts = splitArgs(args);
                        if (parts.length >= 3) {
                            images = parseArrayArg(parts[2]);
                            if (parts.length >= 4) desc = parts[3].replace(/^['"]|['"]$/g, '');
                            if (parts.length >= 6) packSize = parts[5].replace(/^['"]|['"]$/g, '');
                        }
                    } catch(e) {}
                }
                if (!images) images = img.src;
                desc = desc || img.getAttribute('alt') || 'وصف غير متوفر';
            }
            let btn = card.querySelector('.order-button');
            if (btn) {
                let m = btn.getAttribute('onclick')?.match(/addToCart\('[^']*',\s*(\d+)\)/);
                if (m) price = m[1] + ' ج.م';
            }
            openProductModal(name, price || '0 ج.م', images, desc, packSize);
        }
    });
}

function splitArgs(s) {
    let args = [], depth = 0, current = '', inStr = false, strChar = '';
    for (let i = 0; i < s.length; i++) {
        let c = s[i];
        if (inStr) {
            current += c;
            if (c === strChar && s[i-1] !== '\\') inStr = false;
        } else if (c === "'" || c === '"') {
            inStr = true; strChar = c; current += c;
        } else if (c === '[' || c === '(') {
            depth++; current += c;
        } else if (c === ']' || c === ')') {
            depth--; current += c;
        } else if (c === ',' && depth === 0) {
            args.push(current.trim());
            current = '';
        } else {
            current += c;
        }
    }
    if (current.trim()) args.push(current.trim());
    return args;
}

function parseArrayArg(s) {
    s = s.trim();
    if (!s.startsWith('[')) return s.replace(/^['"]|['"]$/g, '');
    try {
        return JSON.parse(s.replace(/'/g, '"'));
    } catch(e) {
        return s.slice(1, -1).split(',').map(x => x.trim().replace(/^['"]|['"]$/g, ''));
    }
}

// قفل وفتح السكرول
function lockScroll() {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
}
function unlockScroll() {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
}

function openProductModal(name, price, images, description, packText) {
    currentProductImages = Array.isArray(images) ? images : [images];
    
    document.getElementById('modal-name').innerText = name;
    document.getElementById('modal-price').innerText = price;
    document.getElementById('modal-pack').innerText = packText || 'العلبة 24 قطعة';
    
    const img = document.getElementById('modal-image');
    img.style.opacity = '0';
    img.style.transform = 'scale(0.95)';
    setTimeout(() => {
        img.src = currentProductImages[0];
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
    }, 50);
    currentImageIndex = 0;
    
    const dotsContainer = document.getElementById('slider-dots');
    dotsContainer.innerHTML = '';
    currentProductImages.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = index === 0 ? 'dot active' : 'dot';
        dot.onclick = () => changeImage(index);
        dotsContainer.appendChild(dot);
    });
    
    currentProduct = { name, price, image: currentProductImages[0] };
    preloadImages(currentProductImages);
    
    wasFromCart = document.body.classList.contains('cart-modal-open');
    if (wasFromCart) {
        document.getElementById('cart-modal')?.close();
        document.body.classList.remove('cart-modal-open');
    }
    
    const overlay = document.getElementById('product-overlay');
    overlay.classList.add('show');
    lockScroll();
    window.history.pushState({ modalOpen: true }, '');
}

function changeImage(index) {
    if (index === currentImageIndex) return;
    const img = document.getElementById('modal-image');
    img.style.opacity = '0';
    img.style.transform = 'scale(0.92)';
    setTimeout(() => {
        currentImageIndex = index;
        img.src = currentProductImages[index];
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
    }, 180);
    document.querySelectorAll('.dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

// سحب الصورة بمرونة (Flexible Swipe)
(function() {
    const img = document.getElementById('modal-image');
    if (!img) return;
    let startX = 0, currentX = 0, isDragging = false;

    function dampen(delta) {
        return Math.sign(delta) * (Math.abs(delta) * 0.25);
    }

    img.addEventListener('touchstart', function(e) {
        if (!document.getElementById('product-overlay').classList.contains('show') || currentProductImages.length < 2) return;
        startX = e.touches[0].screenX;
        currentX = 0;
        isDragging = true;
        img.style.transition = 'none';
        img.style.transform = '';
    }, { passive: true });

    img.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        const delta = e.touches[0].screenX - startX;
        const atFirst = currentImageIndex === 0;
        const atLast = currentImageIndex === currentProductImages.length - 1;
        let moveX = delta;
        if ((delta > 0 && atFirst) || (delta < 0 && atLast)) {
            moveX = dampen(delta);
        }
        currentX = moveX;
        img.style.transform = 'translateX(' + moveX + 'px)';
    }, { passive: true });

    img.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        const atFirst = currentImageIndex === 0;
        const atLast = currentImageIndex === currentProductImages.length - 1;
        if (Math.abs(currentX) > 60 && !(atFirst && currentX > 0) && !(atLast && currentX < 0)) {
            const newIndex = currentX < 0 ? currentImageIndex + 1 : currentImageIndex - 1;
            if (newIndex >= 0 && newIndex < currentProductImages.length) {
                const dir = currentX < 0 ? -1 : 1;
                img.style.transition = 'transform 0.12s ease';
                img.style.transform = 'translateX(' + (dir * 100) + 'px)';
                var tid = setTimeout(function() {
                    changeImage(newIndex);
                    img.style.transition = 'none';
                    img.style.transform = 'translateX(' + (dir * -100) + 'px)';
                    void img.offsetHeight;
                    img.style.transition = 'transform 0.15s ease';
                    img.style.transform = 'translateX(0)';
                }, 110);
            }
        } else {
            img.style.transition = 'transform 0.3s ease';
            img.style.transform = '';
        }
    }, { passive: true });
})();

// تسريع التبديل بين الصور عن طريق تحميل الصور مسبقاً
function preloadImages(images) {
    images.forEach(function(src) {
        var link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

function closeProductModal() {
    const overlay = document.getElementById('product-overlay');
    overlay.classList.remove('show');
    unlockScroll();
    if (wasFromCart) {
        wasFromCart = false;
        document.getElementById('cart-modal')?.showModal();
        document.body.classList.add('cart-modal-open');
    }
}

// الاستماع لحدث زر الرجوع في الهاتف
window.addEventListener('popstate', () => {
    const overlay = document.getElementById('product-overlay');
    if (overlay.classList.contains('show')) {
        overlay.classList.remove('show');
        unlockScroll();
        if (wasFromCart) {
            wasFromCart = false;
            document.getElementById('cart-modal')?.showModal();
            document.body.classList.add('cart-modal-open');
        }
    }
});

function addToCartFromModal() {
    addToCart(currentProduct.name, currentProduct.price, currentProduct.image);
    closeProductModal();
}


/**
 * دالة التبديل بين الوضع المظلم والمضيء
 */
function toggleTheme() {
    const body = document.body;
    // تفعيل الأنيميشن قبل تغيير الثيم
    body.classList.add('theme-transition');
    body.classList.toggle('light-mode');
    
    // حفظ التفضيل في المتصفح
    const isLight = body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // تغيير الأيقونة بين القمر (داكن) والشمس (فاتح)
    const iconPath = document.getElementById('icon-path');
    if (iconPath) {
        iconPath.setAttribute('d', isLight
            ? 'M12 2v2m0 16v2m-10-10H2m20 0h-2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12'
            : 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'
        );
    }
    // إزالة كلاس الأنيميشن بعد انتهاء المدة
    setTimeout(() => body.classList.remove('theme-transition'), 350);
}

// تطبيق الثيم عند فتح الصفحة
window.addEventListener('DOMContentLoaded', () => {
    let saved = localStorage.getItem('theme');
    if (saved === 'light') {
        document.body.classList.add('light-mode');
        let iconPath = document.getElementById('icon-path');
        if (iconPath) {
            iconPath.setAttribute('d', 'M12 2v2m0 16v2m-10-10H2m20 0h-2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12');
        }
    }
});





// function scrollSlider(direction, containerId) {
//     const container = document.getElementById(containerId);
//     if (!container) return;
    
//     // مقدار الحركة
//     const scrollAmount = 250; 
//     container.scrollBy({
//         left: direction === 'left' ? -scrollAmount : scrollAmount,
//         behavior: 'smooth'
//     });
// }


































// const SUPABASE_URL = 'https://zqqpknqexsnskowhiwfj.supabase.co';
// const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E';
// // إنشاء العميل
// const supabaseClient = createClient('https://zqqpknqexsnskowhiwfj.supabase.co',  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E');

// إخفاء الـ bottom-nav عند ظهور الكيبورد عشان يفضل ثابت في مكانه
let searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('focus', () => {
        document.querySelector('.bottom-nav')?.classList.add('keyboard-open');
    });
    searchInput.addEventListener('blur', () => {
        document.querySelector('.bottom-nav')?.classList.remove('keyboard-open');
    });
}

const SUPABASE_URL = "https://zqqpknqexsnskowhiwfj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXBrbnFleHNuc2tvd2hpd2ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMzE2MjQsImV4cCI6MjA5NjcwNzYyNH0.hcD0__qb6FNhpgAyyU0F7RFZyewJrkt2WR4E79UJP9E";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);


