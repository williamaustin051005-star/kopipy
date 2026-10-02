(function () {
  "use strict";

  var MENU = [
    { id: "americano", n: "Americano", c: "Kopi", p: 15000, i: "☕", d: "Espresso arabica dengan air panas. Bersih dan ringan." },
    { id: "latte", n: "Cafe Latte", c: "Kopi", p: 24000, i: "☕", d: "Espresso dengan susu steam yang lembut." },
    { id: "cappuccino", n: "Cappuccino", c: "Kopi", p: 24000, i: "☕", d: "Espresso, susu, dan foam tebal." },
    { id: "kopsu", n: "Kopi Susu Happy", c: "Kopi", p: 18000, i: "🥤", d: "Menu andalan: kopi susu gula aren, manisnya pas." },
    { id: "aren", n: "Happy Aren Latte", c: "Kopi", p: 22000, i: "🥤", d: "Latte dengan gula aren dan sedikit kayu manis." },
    { id: "v60", n: "V60 Single Origin", c: "Kopi", p: 35000, i: "☕", d: "Seduh manual, biji arabica pilihan barista." },
    { id: "matcha", n: "Matcha Latte", c: "Non-kopi", p: 26000, i: "🍵", d: "Matcha dengan susu, tanpa kopi." },
    { id: "cokelat", n: "Cokelat Happy", c: "Non-kopi", p: 22000, i: "🥛", d: "Cokelat pekat, hangat atau dingin." },
    { id: "rotibakar", n: "Roti Bakar Cokelat Keju", c: "Makanan", p: 20000, i: "🍞", d: "Roti tebal dipanggang, isi cokelat dan keju." },
    { id: "sandtelur", n: "Sandwich Telur Keju", c: "Makanan", p: 28000, i: "🥪", d: "Telur, keju, dan selada di roti panggang." },
    { id: "sandayam", n: "Sandwich Ayam Panggang", c: "Makanan", p: 36000, i: "🥪", d: "Ayam panggang, sayur segar, saus mayo." },
    { id: "biji", n: "Biji Kopi Arabica 200 g", c: "Bawa pulang", p: 85000, i: "🫘", d: "Sangrai medium, siap digiling di rumah." },
    { id: "drip", n: "Drip Bag (5 sachet)", c: "Bawa pulang", p: 40000, i: "📦", d: "Seduh praktis di kantor atau kamar kos." }
  ];
  var CATS = ["Semua", "Kopi", "Non-kopi", "Makanan", "Bawa pulang"];
  var DELIVERY_FEE = 8000, STUDENT = 0.1, POINT_UNIT = 10000;

  var $ = function (id) { return document.getElementById(id); };
  var rp = function (n) { return "Rp " + Math.round(n).toLocaleString("id-ID"); };
  var cart = {}, cat = "Semua";

  try { cart = JSON.parse(localStorage.getItem("kopipy-cart")) || {}; } catch (e) { cart = {}; }
  function save() { try { localStorage.setItem("kopipy-cart", JSON.stringify(cart)); } catch (e) { /* abaikan */ } }
  function find(id) { return MENU.filter(function (m) { return m.id === id; })[0]; }

  // ----- Menu -----
  function renderTabs() {
    $("tabs").innerHTML = CATS.map(function (c) {
      return '<button type="button" role="tab" aria-selected="' + (c === cat) + '" data-cat="' + c + '">' + c + "</button>";
    }).join("");
  }
  function renderGrid() {
    $("grid").innerHTML = MENU.filter(function (m) { return cat === "Semua" || m.c === cat; }).map(function (m) {
      return '<article class="card"><span class="ico" aria-hidden="true">' + m.i + "</span><h3>" + m.n + "</h3><p>" + m.d +
        '</p><div class="row"><span class="price">' + rp(m.p) + '</span><button type="button" class="add" data-add="' + m.id +
        '" aria-label="Tambah ' + m.n + ' ke keranjang">Tambah</button></div></article>';
    }).join("");
  }
  $("tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-cat]"); if (!b) return;
    cat = b.getAttribute("data-cat"); renderTabs(); renderGrid();
  });
  $("grid").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-add]"); if (!b) return;
    change(b.getAttribute("data-add"), 1);
    b.textContent = "Ditambah!"; setTimeout(function () { b.textContent = "Tambah"; }, 900);
  });

  // ----- Keranjang -----
  function change(id, d) {
    cart[id] = (cart[id] || 0) + d;
    if (cart[id] <= 0) delete cart[id];
    save(); renderCart();
  }
  function totals() {
    var form = $("checkout"), sub = 0, count = 0;
    Object.keys(cart).forEach(function (id) { var m = find(id); if (m) { sub += m.p * cart[id]; count += cart[id]; } });
    var disc = form.student.checked ? sub * STUDENT : 0;
    var fee = sub > 0 && form.method.value === "delivery" ? DELIVERY_FEE : 0;
    var total = sub - disc + fee;
    return { sub: sub, disc: disc, fee: fee, total: total, count: count, pts: Math.floor((sub - disc) / POINT_UNIT) };
  }
  function renderCart() {
    var ids = Object.keys(cart).filter(find);
    $("items").innerHTML = ids.map(function (id) {
      var m = find(id);
      return '<li><span class="nm">' + m.n + '</span><div class="qty"><button type="button" data-dec="' + id + '" aria-label="Kurangi ' + m.n +
        '">−</button><span>' + cart[id] + '</span><button type="button" data-inc="' + id + '" aria-label="Tambah ' + m.n +
        '">+</button></div><span class="pr">' + rp(m.p) + " × " + cart[id] + " = " + rp(m.p * cart[id]) + "</span></li>";
    }).join("");
    $("empty").hidden = ids.length > 0;
    var t = totals();
    $("cartCount").textContent = t.count;
    $("sSub").textContent = rp(t.sub); $("sDisc").textContent = "− " + rp(t.disc);
    $("sFee").textContent = rp(t.fee); $("sTot").textContent = rp(t.total); $("sPts").textContent = t.pts;
  }
  $("items").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b.dataset.inc) change(b.dataset.inc, 1);
    if (b.dataset.dec) change(b.dataset.dec, -1);
  });

  function setDrawer(open) {
    $("drawer").classList.toggle("open", open);
    $("drawer").setAttribute("aria-hidden", String(!open));
    $("scrim").hidden = !open;
    if (open) $("closeCart").focus(); else $("openCart").focus();
  }
  $("openCart").addEventListener("click", function () { setDrawer(true); });
  $("closeCart").addEventListener("click", function () { setDrawer(false); });
  $("scrim").addEventListener("click", function () { setDrawer(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("drawer").classList.contains("open")) setDrawer(false); });

  // ----- Checkout (simulasi) -----
  var form = $("checkout");
  form.addEventListener("change", function () {
    var m = form.method.value;
    $("addrRow").hidden = m !== "delivery";
    $("timeRow").hidden = m === "dinein";
    renderCart();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("err"), t = totals();
    err.textContent = "";
    if (t.count === 0) { err.textContent = "Keranjang masih kosong. Tambahkan menu dulu."; return; }
    if (!form.name.value.trim()) { err.textContent = "Isi nama kamu agar pesanan bisa dipanggil."; form.name.focus(); return; }
    if (form.wa.value.replace(/\D/g, "").length < 9) { err.textContent = "Isi nomor WhatsApp yang benar (minimal 9 angka)."; form.wa.focus(); return; }
    if (form.method.value === "delivery" && !form.addr.value.trim()) { err.textContent = "Isi alamat pengantaran."; form.addr.focus(); return; }
    var no = "KP-" + String(Math.floor(1000 + Math.random() * 9000));
    var how = { pickup: "Pick-up, " + form.time.value.toLowerCase(), dinein: "Makan di tempat", delivery: "Diantar ke " + form.addr.value.trim() }[form.method.value];
    $("doneText").textContent = "Nomor pesanan " + no + " atas nama " + form.name.value.trim() + ". " + how + ". Total " + rp(t.total) +
      " (" + form.pay.value + "). Kamu dapat " + t.pts + " Happy Points. Ini hanya simulasi: tidak ada pembayaran yang diproses.";
    cart = {}; save(); form.reset(); form.dispatchEvent(new Event("change"));
    setDrawer(false);
    $("done").showModal();
  });
  $("doneClose").addEventListener("click", function () { $("done").close(); });

  renderTabs(); renderGrid(); renderCart();
})();
