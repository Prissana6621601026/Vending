let state = {
  balance: 0,
  totalSales: 0,
  products: [
    { code: 'A1', name: "Chocolate Cookie", price: 20, stock: 5, img:"assets/images/cookie (2).jpeg" },
    { code: 'A2', name: "Ice cream Chocolate", price: 15, stock: 4, img:"assets/images/Chocolate.jpeg" },
    { code: 'A3', name: "Ice cream Strawberry", price: 15, stock: 3, img:"assets/images/Strawberry.jpeg" },
    { code: 'B1', name: "Ice cream Vanilla", price: 15, stock: 6, img:"assets/images/Vanilla.jpeg" },
    { code: 'B2', name: "Croissant", price: 25, stock: 4, img:"assets/images/croissant.jpeg" },
    { code: 'B3', name: "Cream Puff", price: 30, stock: 2, img:"assets/images/cream_puff.jpeg" },
    { code: 'C1', name: "Donut Chocolate", price: 20, stock: 7, img:"assets/images/donut.jpeg" },
    { code: 'C2', name: "Macaron", price: 30, stock: 5, img:"assets/images/macaron.jpeg" },
    { code: 'C3', name: "Brownies", price: 20, stock: 6, img:"assets/images/brownie.jpeg" },
    { code: 'D1', name: "Raspberry Cupcake", price: 20, stock: 6, img:"assets/images/Raspberry_Swirl_Cupcakes.jpeg" },
    { code: 'D2', name: "Strawberry Tarte", price: 50, stock: 6, img:"assets/images/tarte.jpeg" },
    { code: 'D3', name: "Chocolate Cake Pop", price: 20, stock: 6, img:"assets/images/Chocolate_Cake_Pops.jpeg" }
  ],
  selectedProductIndex: null,
  insertedCash: 0,
  uiStep: "select",
  selectedPaymentMethod: null
};

function showToast(msg, color){
  const t = document.createElement("div");
  t.className = `toast bg-${color}-500`;
  t.textContent = msg;
  document.getElementById("toast-container").appendChild(t);
  setTimeout(()=>t.remove(), 4000);
}

function handleSelectProduct(i) {
  const p = state.products[i];
  if (p.stock <= 0) return showToast("สินค้าหมด", "red");
  state.selectedProductIndex = i;
  state.uiStep = "payment";
  render();
}
function handlePayment(method) {
  const p = state.products[state.selectedProductIndex];
  if (!p) return;
  state.selectedPaymentMethod = method;
  if (method === 'cash') {
    state.uiStep = "cash_insert";
  } else if (method === 'qr') {
    showToast(`สแกน QR เพื่อชำระ ${p.price}฿ `, "green");
    setTimeout(processPayment, 1500); 
  }
  render();
}
function insertCash(amount) {
  const p = state.products[state.selectedProductIndex];
  state.insertedCash += amount;
  if (state.insertedCash >= p.price) {
    processPayment();
    return;
  }
  render();
}
function processPayment() {
  const p = state.products[state.selectedProductIndex];
  if (!p) return;
  //เช็คจำนวนเงิน
  if (state.selectedPaymentMethod === 'cash' && state.insertedCash < p.price) {
      return showToast("ยอดเงินไม่พอ", "red");
  }

  const change = Math.max(0, state.insertedCash - p.price);
  if (change > 0) showToast(`ทอนเงิน ${change}฿ `, "orange");
  
  // Display Album drop animation/message
  showToast(`${p.name} สินค้ากำลังถูกส่ง!`, "green");
  
  p.stock--;
  state.totalSales += p.price;
    Object.assign(state, { selectedProductIndex: null, insertedCash: 0, uiStep: "select", selectedPaymentMethod: null });
  setTimeout(cancelSelection, 1000);
}
function cancelSelection() {
  if (state.insertedCash > 0) showToast(`คืนเงิน ${state.insertedCash}฿ `, "orange");
  Object.assign(state, { selectedProductIndex: null, insertedCash: 0, uiStep: "select", selectedPaymentMethod: null });
  render();
}
function render() {
  const app = document.getElementById("app");
  const selected = state.products[state.selectedProductIndex];
  
  let lcdMessage;
  if (state.uiStep === "select") {
      lcdMessage = `Sweets | ยอดขายรวม: ${state.totalSales}฿`;
  } else if (state.uiStep === "payment") {
      lcdMessage = `กรุณาเลือกวิธีการชำระเงินสำหรับ ${selected.name} (${selected.price}฿)`;
  } else if (state.uiStep === "cash_insert") {
      lcdMessage = `ใส่เงิน: ${state.insertedCash} / ${selected.price} ฿ | ยอดที่ต้องใส่เพิ่ม: ${Math.max(0, selected.price - state.insertedCash)}฿`;
  }

  app.innerHTML = `
    <div class="vending-body">
      <div class="lcd">
        ${lcdMessage}
      </div>
      
      <div class="products-grid">
        ${state.products.map((p,i)=>`
          <div class="product ${p.stock<=0?'opacity-50':''}">
            <img src="${p.img}" alt="${p.name}">
            <div class="name">${p.name}</div>
            <div class="price">฿${p.price}</div>
            <div class="stock">เหลือ: ${p.stock}</div>
            <button ${p.stock<=0 || state.uiStep !== 'select' ?'disabled':''} onclick="handleSelectProduct(${i})">เลือก</button>
          </div>
        `).join('')}
      </div>
      
      <div class="control-panel">
        ${state.uiStep === "payment" ? `
          <div>
            <h3>ชำระเงิน (${selected.price}฿)</h3>
            <div class="payment-buttons">
              <button onclick="handlePayment('cash')"> เงินสด</button>
              <button onclick="handlePayment('qr')"> สแกน QR</button>
            </div>
          </div>
          <button onclick="cancelSelection()">ยกเลิก</button>
        ` : ''}
        
        ${state.uiStep === "cash_insert" ? `
          <div>
            <h3>ยอดเงินปัจจุบัน: ${state.insertedCash}฿</h3>
            <div class="cash-buttons">
              ${[20,50,100,500,1000].map(a=>`<button onclick="insertCash(${a})">${a}฿</button>`).join('')}
            </div>
          </div>
          <button onclick="cancelSelection()">คืนเงิน</button>
        ` : ''}

        ${state.uiStep === "select" ? `
          <h3 class="text-center">เลือกขนม</h3>
          <p class="text-center text-sm text-gray-500">เลือกขนมจากด้านข้างเพื่อเริ่มชำระเงิน</p>
        ` : ''}
      </div>

      <div class="dispenser-area">ช่องรับขนม (Pickup Area)</div>
    </div>
  `;
}
render();