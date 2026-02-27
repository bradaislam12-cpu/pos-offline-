// ===== بيانات التطبيق =====
let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let cart = [];
let total = 0;

// ===== حفظ البيانات =====
function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("sales", JSON.stringify(sales));
}

// ===== عرض التبويب =====
function showTab(id, btn) {
    document.querySelectorAll(".section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    updateStats();
}

// ===== إضافة / تعديل المنتج =====
function saveProduct() {
    let name = document.getElementById("pName").value.trim();
    let price = parseFloat(document.getElementById("pPrice").value);
    let qty = parseInt(document.getElementById("pQty").value);
    let barcode = document.getElementById("pBarcode").value.trim();
    let index = document.getElementById("editIndex").value;

    if (!name || !price || !qty) return alert("أكمل جميع البيانات");

    if (index === "") {
        products.push({ name, price, qty, barcode });
    } else {
        products[index] = { name, price, qty, barcode };
        document.getElementById("editIndex").value = "";
    }

    document.getElementById("pName").value = "";
    document.getElementById("pPrice").value = "";
    document.getElementById("pQty").value = "";
    document.getElementById("pBarcode").value = "";

    saveData();
    renderProducts();
    updateStats();
}

// ===== عرض المنتجات =====
function renderProducts() {
    let list = document.getElementById("productList");
    let searchValue = document.getElementById("search").value.toLowerCase();
    list.innerHTML = "";

    products.forEach((p, i) => {
        if (!p.name.toLowerCase().includes(searchValue)) return;

        list.innerHTML += `
            <div class="product">
                <b>${p.name}</b><br>
                السعر: ${p.price} دج<br>
                الكمية: ${p.qty < 5 ? '<span class="lowStock">' + p.qty + '</span>' : p.qty}<br>
                الباركود: ${p.barcode || '-'}<br>
                <button class="warning" onclick="editProduct(${i})">تعديل</button>
                <button class="danger" onclick="deleteProduct(${i})">حذف</button>
            </div>`;
    });
}

// ===== تعديل المنتج =====
function editProduct(i) {
    let p = products[i];
    document.getElementById("pName").value = p.name;
    document.getElementById("pPrice").value = p.price;
    document.getElementById("pQty").value = p.qty;
    document.getElementById("pBarcode").value = p.barcode;
    document.getElementById("editIndex").value = i;
    showTab('products', document.querySelectorAll("nav button")[1]);
}

// ===== حذف المنتج =====
function deleteProduct(i) {
    if (!confirm("هل تريد حذف المنتج؟")) return;
    products.splice(i, 1);
    saveData();
    renderProducts();
    updateStats();
}

// ===== السلة =====
function addToCart() {
    let code = document.getElementById("sellBarcode").value.trim();
    if (!code) return alert("أدخل أو امسح الباركود");

    let p = products.find(x => x.barcode === code);
    if (!p) return alert("المنتج غير موجود");
    if (p.qty <= 0) return alert("نفذ المخزون");

    p.qty--;
    cart.push({ ...p });
    total += p.price;

    document.getElementById("sellBarcode").value = "";
    updateCart();
    saveData();
    renderProducts();
}

function updateCart() {
    let cartDiv = document.getElementById("cart");
    cartDiv.innerHTML = "";
    cart.forEach((p, i) => {
        cartDiv.innerHTML += `<div>${p.name} - ${p.price} دج 
        <button class="danger" onclick="removeFromCart(${i})">×</button></div>`;
    });
    document.getElementById("total").innerText = total;
}

function removeFromCart(i) {
    let p = cart[i];
    let prod = products.find(x => x.barcode === p.barcode);
    if (prod) prod.qty += 1;
    total -= p.price;
    cart.splice(i, 1);
    updateCart();
    renderProducts();
    saveData();
}

// ===== إتمام البيع =====
function completeSale() {
    if (cart.length === 0) return alert("السلة فارغة");
    sales.push({ date: new Date().toLocaleDateString(), total, items: [...cart] });
    cart = [];
    total = 0;
    updateCart();
    updateStats();
    saveData();
    alert("تمت العملية بنجاح");
}

// ===== الإحصائيات =====
function updateStats() {
    document.getElementById("statProducts").innerText = products.length;
    let today = new Date().toLocaleDateString();
    let todaySales = sales.filter(s => s.date === today);
    document.getElementById("statSales").innerText = todaySales.length;
    document.getElementById("statProfit").innerText = todaySales.reduce((a, b) => a + b.total, 0);
    updateReport();
}

function updateReport() {
    let today = new Date().toLocaleDateString();
    let todaySales = sales.filter(s => s.date === today);
    let sum = todaySales.reduce((a, b) => a + b.total, 0);
    document.getElementById("reportBox").innerHTML =
        `عدد العمليات: ${todaySales.length}<br>إجمالي الأرباح: ${sum} دج`;
}

// ===== مسح الباركود =====
function startScan(type) {
    let readerId = type === "product" ? "readerProduct" : "readerSale";
    let inputId = type === "product" ? "pBarcode" : "sellBarcode";
    let qr = new Html5Qrcode(readerId);

    qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (text) => {
            document.getElementById(inputId).value = text;
            qr.stop();
            document.getElementById(readerId).innerHTML = "";
            if (type === "sale") addToCart();
        },
        (err) => { }
    ).catch(() => alert("فشل تشغيل الكاميرا"));
}

// ===== إعادة تعيين التطبيق =====
function resetApp() {
    if (!confirm("هل تريد إعادة تعيين التطبيق؟ سيتم مسح جميع البيانات")) return;
    localStorage.removeItem("products");
    localStorage.removeItem("sales");
    products = [];
    sales = [];
    cart = [];
    total = 0;
    renderProducts();
    updateCart();
    updateStats();
    alert("تم إعادة تعيين التطبيق بنجاح");
}

// ===== بدء التطبيق =====
renderProducts();
updateStats();
