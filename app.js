(() => {
<<<<<<< HEAD
 const $=id=>document.getElementById(id), form=$("transactionForm"), msg=$("formMessage");
 const money=n=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
 const ready=window.SUPABASE_URL&&!window.SUPABASE_URL.includes("PASTE_")&&window.SUPABASE_ANON_KEY&&!window.SUPABASE_ANON_KEY.includes("PASTE_");
 const db=ready?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
 const today=new Date(), localDate=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);
 $("transaction_date").value=localDate; $("monthFilter").value=localDate.slice(0,7); $("year").textContent=today.getFullYear();
 const nav=$("nav"), menu=$("menuToggle");
 menu.onclick=()=>{let open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));};
 document.querySelectorAll(".navtab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".navtab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".view").forEach(v=>v.hidden=v.id!==b.dataset.view);nav.classList.remove("open");if(b.dataset.view==="reportView")loadReport();});
 function say(el,text,type){el.textContent=text;el.className="message "+(type||"");}
 function update() { 
  const quantity = Number($("quantity").value) || 0;
  const unitPrice = Number($("unit_price").value) || 0;
  const totalPrice = quantity * unitPrice;
  const itemIncome = quantity * 1000;
  $("totalDisplay").textContent = money(totalPrice);
  $("incomeDisplay").textContent = money(itemIncome);
 }
 ["quantity","unit_price"].forEach(id=>$(id).addEventListener("input",update));
 form.addEventListener("reset",()=>setTimeout(()=>{$("transaction_date").value=localDate;update();say(msg,"","");},0));
 form.onsubmit=async e=>{e.preventDefault();if(!db){say(msg,"Supabase belum dikonfigurasi. Isi URL dan key di config.js, lalu jalankan supabase-schema.sql.","error");return;}
 const quantity=+$("quantity").value, unit_price=+$("unit_price").value;
 if(!Number.isInteger(quantity)||quantity<1||!Number.isFinite(unit_price)||unit_price<0){say(msg,"Periksa jumlah dan harga negosiasi.","error");return;}
 const total=Math.round(quantity*unit_price),row={customer_name:$("customer_name").value.trim(),whatsapp:$("whatsapp").value.trim(),location:$("location").value.trim(),transaction_date:$("transaction_date").value,quantity,unit_price,total_price:total,item_income:quantity*1000};
 $("saveBtn").disabled=true;$("saveBtn").textContent="Menyimpan…";
 const {error}=await db.from("transactions").insert(row);
 $("saveBtn").disabled=false;$("saveBtn").innerHTML='Simpan Transaksi <span>→</span>';
 if(error){say(msg,"Gagal menyimpan: "+error.message,"error");return;}
 say(msg,"Transaksi berhasil disimpan!","success");form.reset();
 };
 function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
 let reportRows=[];
 async function loadReport(){
  const body=$("reportBody"), chart=$("chart");
  if(!db){body.innerHTML='<tr><td colspan="7" class="empty">Konfigurasikan Supabase terlebih dahulu.</td></tr>';chart.innerHTML='<p class="empty">Supabase belum terhubung.</p>';return;}
  let from=$("dateFrom").value,to=$("dateTo").value,month=$("monthFilter").value;
  if(!from&&!to&&month){from=month+"-01";let d=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0);to=month+"-"+String(d.getDate()).padStart(2,"0");}
  if(from&&to&&from>to){say($("reportMessage"),"Tanggal awal tidak boleh melewati tanggal akhir.","error");return;}
  let query=db.from("transactions").select("id,transaction_date,customer_name,whatsapp,location,quantity,unit_price,total_price,item_income").order("transaction_date",{ascending:true}).limit(5000);
  if(from)query=query.gte("transaction_date",from);if(to)query=query.lte("transaction_date",to);
  body.innerHTML='<tr><td colspan="7" class="empty">Memuat laporan…</td></tr>';
  const {data,error}=await query;
  if(error){body.innerHTML=`<tr><td colspan="7" class="empty">${esc(error.message)}</td></tr>`;return;}
  reportRows=data||[];const sumQty=reportRows.reduce((s,r)=>s+(+r.quantity||0),0),sum=reportRows.reduce((s,r)=>s+(+r.item_income||0),0);
  $("statCount").textContent=reportRows.length.toLocaleString("id-ID");$("statQty").textContent=sumQty.toLocaleString("id-ID")+" pcs";$("statRevenue").textContent=money(sum);
  $("reportSubtitle").textContent=from||to?`${from||"Awal"} — ${to||"Sekarang"}`:(month||"Semua tanggal");
  body.innerHTML=reportRows.length?reportRows.slice().reverse().map(r=>`<tr><td>${esc(r.transaction_date)}</td><td>${esc(r.customer_name)}</td><td>${esc(r.whatsapp)}</td><td>${esc(r.location)}</td><td>${(+r.quantity).toLocaleString("id-ID")} pcs</td><td>${money(r.unit_price)}</td><td><b>${money(r.total_price)}</b></td></tr>`).join(""):'<tr><td colspan="7" class="empty">Tidak ada transaksi pada periode ini.</td></tr>';
  renderChart(reportRows);
 }
 function renderChart(rows){
  const groups={};rows.forEach(r=>{let d=r.transaction_date||"Tanpa tanggal";groups[d]=(groups[d]||0)+(+r.item_income||0);});
  const entries=Object.entries(groups).sort((a,b)=>a[0].localeCompare(b[0]));
  if(!entries.length){$("chart").innerHTML='<p class="empty">Belum ada data untuk digrafikkan.</p>';return;}
  const max=Math.max(...entries.map(x=>x[1]),1);
  $("chart").innerHTML='<div class="bars">'+entries.map(([date,val])=>`<div class="bar-item" title="${esc(date)}: ${money(val)}"><div class="bar-value">${money(val)}</div><div class="bar" style="height:${Math.max(4,val/max*180)}px"></div><small>${esc(date.slice(5))}</small></div>`).join("")+'</div>';
 }
 $("applyFilter").onclick=loadReport;
 $("exportBtn").onclick=()=>{
  if(!reportRows.length){say($("reportMessage"),"Tidak ada data untuk diekspor. Tampilkan laporan terlebih dahulu.","error");return;}
  const headers=["Tanggal","Nama","No WhatsApp","Lokasi","Jumlah (pcs)","Harga per pcs","Total Harga","Pendapatan Barang"];
  const rows=reportRows.map(r=>[r.transaction_date,r.customer_name,r.whatsapp,r.location,r.quantity,r.unit_price,r.total_price,r.item_income]);
  const csv="\ufeff"+[headers,...rows].map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\r\n");
  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download="laporan-roster-"+( $("monthFilter").value||"transaksi")+".csv";a.click();URL.revokeObjectURL(url);say($("reportMessage"),"File CSV berhasil disiapkan; bisa dibuka dengan Excel.","success");
 };
 update();
=======
  'use strict';

  const $ = (id) => document.getElementById(id);

  const els = {
    form: $('incomeForm'),
    date: $('income_date'), 
    source: $('source'),
    description: $('description'),
    amount: $('amount'),
    todayTotal: $('todayTotal'),
    todayList: $('todayList'),
    saveBtn: $('saveBtn'),
    formMessage: $('formMessage'),
    monthFilter: $('monthFilter'),
    dateFrom: $('dateFrom'),
    dateTo: $('dateTo'),
    applyFilter: $('applyFilter'),
    exportBtn: $('exportBtn'),
    reportBody: $('reportBody'),
    dailyBody: $('dailyBody'),
    reportMessage: $('reportMessage'),
    chart: $('chart'),
    statCount: $('statCount'),
    statDays: $('statDays'),
    statRevenue: $('statRevenue'),
    reportSubtitle: $('reportSubtitle'),
    year: $('year'),
    nav: $('nav'),
    menuToggle: $('menuToggle')
  };

  const money = (value) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  const today = new Date();
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const supabaseReady =
    window.SUPABASE_URL &&
    window.SUPABASE_ANON_KEY &&
    !window.SUPABASE_URL.includes('PASTE_') &&
    !window.SUPABASE_ANON_KEY.includes('PASTE_');

  const db = supabaseReady
    ? window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY)
    : null;

  let savedTodayTotal = 0;
  let todayEntries = [];
  let reportRows = [];

  function setMessage(element, text = '', type = '') {
    element.textContent = text;
    element.className = `message ${type}`.trim();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function getDraftAmount() {
    const value = Number(els.amount.value);
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
  }

  function renderTodayTotal() {
    // The number shown includes saved entries + the amount currently typed in the form.
    // This makes the total update immediately while the user is entering another income.
    els.todayTotal.textContent = money(savedTodayTotal + getDraftAmount());
  }

  function renderTodayList() {
    if (!todayEntries.length) {
      els.todayList.innerHTML = '<div class="empty-list">Belum ada penghasilan tersimpan pada tanggal ini.</div>';
      return;
    }

    els.todayList.innerHTML = todayEntries.map((entry) => `
      <div class="income-item">
        <div class="income-item-info">
          <strong>${escapeHtml(entry.source)}</strong>
          <span>${escapeHtml(entry.description || 'Tanpa keterangan')}</span>
        </div>
        <strong class="income-item-amount">${money(entry.amount)}</strong>
      </div>
    `).join('');
  }

  async function loadTodayEntries() {
    if (!db) {
      savedTodayTotal = 0;
      todayEntries = [];
      renderTodayTotal();
      renderTodayList();
      return;
    }

    const date = els.date.value || localDate;
    els.todayList.innerHTML = '<div class="empty-list">Memuat penghasilan...</div>';

    const { data, error } = await db
      .from('income_entries')
      .select('id,income_date,source,description,amount,created_at')
      .eq('income_date', date)
      .order('created_at', { ascending: true });

    if (error) {
      savedTodayTotal = 0;
      todayEntries = [];
      els.todayList.innerHTML = `<div class="empty-list error-text">Gagal mengambil data: ${escapeHtml(error.message)}</div>`;
      renderTodayTotal();
      return;
    }

    todayEntries = data || [];
    savedTodayTotal = todayEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    renderTodayTotal();
    renderTodayList();
  }

  async function saveIncome(event) {
    event.preventDefault();

    if (!db) {
      setMessage(els.formMessage, 'Supabase belum dikonfigurasi. Periksa config.js.', 'error');
      return;
    }

    const amount = getDraftAmount();
    const date = els.date.value;
    const source = els.source.value.trim();
    const description = els.description.value.trim();

    if (!date) {
      setMessage(els.formMessage, 'Tanggal wajib diisi.', 'error');
      return;
    }

    if (!source) {
      setMessage(els.formMessage, 'Sumber penghasilan wajib diisi.', 'error');
      els.source.focus();
      return;
    }

    if (amount <= 0) {
      setMessage(els.formMessage, 'Nominal harus lebih dari Rp0.', 'error');
      els.amount.focus();
      return;
    }

    els.saveBtn.disabled = true;
    els.saveBtn.textContent = 'Menyimpan...';

    const row = {
      income_date: date,
      source,
      description,
      amount
    };

    const { data, error } = await db
      .from('income_entries')
      .insert(row)
      .select('id,income_date,source,description,amount,created_at')
      .single();

    els.saveBtn.disabled = false;
    els.saveBtn.innerHTML = 'Simpan Penghasilan <span>→</span>';

    if (error) {
      setMessage(els.formMessage, `Gagal menyimpan: ${error.message}`, 'error');
      return;
    }

    // Add the newly saved entry locally so the daily total changes immediately.
    if (data) {
      todayEntries.push(data);
      savedTodayTotal += Number(data.amount || 0);
    } else {
      savedTodayTotal += amount;
    }

    els.amount.value = '';
    els.description.value = '';
    renderTodayTotal();
    renderTodayList();
    setMessage(els.formMessage, `Berhasil disimpan. Total penghasilan tanggal ${date}: ${money(savedTodayTotal)}`, 'success');
    els.source.focus();
  }

  function resetForm() {
    setTimeout(() => {
      els.date.value = localDate;
      els.source.value = '';
      els.description.value = '';
      els.amount.value = '';
      setMessage(els.formMessage);
      loadTodayEntries();
    }, 0);
  }

  async function loadReport() {
    if (!db) {
      els.reportBody.innerHTML = '<tr><td colspan="4" class="empty">Supabase belum terhubung.</td></tr>';
      els.dailyBody.innerHTML = '<tr><td colspan="4" class="empty">Supabase belum terhubung.</td></tr>';
      els.chart.innerHTML = '<p class="empty">Supabase belum terhubung.</p>';
      return;
    }

    let from = els.dateFrom.value;
    let to = els.dateTo.value;
    const month = els.monthFilter.value;

    if (!from && !to && month) {
      const [year, monthNumber] = month.split('-').map(Number);
      const lastDay = new Date(year, monthNumber, 0).getDate();
      from = `${month}-01`;
      to = `${month}-${String(lastDay).padStart(2, '0')}`;
    }

    if (from && to && from > to) {
      setMessage(els.reportMessage, 'Tanggal awal tidak boleh melewati tanggal akhir.', 'error');
      return;
    }

    setMessage(els.reportMessage);
    els.reportBody.innerHTML = '<tr><td colspan="4" class="empty">Memuat laporan...</td></tr>';
    els.dailyBody.innerHTML = '<tr><td colspan="4" class="empty">Memuat laporan...</td></tr>';

    let query = db
      .from('income_entries')
      .select('id,income_date,source,description,amount,created_at')
      .order('income_date', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(5000);

    if (from) query = query.gte('income_date', from);
    if (to) query = query.lte('income_date', to);

    const { data, error } = await query;

    if (error) {
      const message = escapeHtml(error.message);
      els.reportBody.innerHTML = `<tr><td colspan="4" class="empty error-text">${message}</td></tr>`;
      els.dailyBody.innerHTML = `<tr><td colspan="4" class="empty error-text">${message}</td></tr>`;
      els.chart.innerHTML = '<p class="empty">Laporan gagal dimuat.</p>';
      return;
    }

    reportRows = data || [];
    const groups = {};

    reportRows.forEach((row) => {
      if (!groups[row.income_date]) {
        groups[row.income_date] = { count: 0, total: 0, sources: [] };
      }
      groups[row.income_date].count += 1;
      groups[row.income_date].total += Number(row.amount || 0);
      groups[row.income_date].sources.push(row.source);
    });

    const days = Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    const total = reportRows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

    els.statCount.textContent = reportRows.length.toLocaleString('id-ID');
    els.statDays.textContent = `${days.length.toLocaleString('id-ID')} hari`;
    els.statRevenue.textContent = money(total);
    els.reportSubtitle.textContent = from || to
      ? `${from || 'Awal'} — ${to || 'Sekarang'}`
      : (month || 'Semua tanggal');

    els.dailyBody.innerHTML = days.length
      ? days.slice().reverse().map(([date, group]) => `
          <tr>
            <td><b>${escapeHtml(date)}</b></td>
            <td>${group.count.toLocaleString('id-ID')}</td>
            <td>${group.sources.map(escapeHtml).join(', ')}</td>
            <td><b>${money(group.total)}</b></td>
          </tr>
        `).join('')
      : '<tr><td colspan="4" class="empty">Belum ada penghasilan pada periode ini.</td></tr>';

    els.reportBody.innerHTML = reportRows.length
      ? reportRows.slice().reverse().map((row) => `
          <tr>
            <td>${escapeHtml(row.income_date)}</td>
            <td><b>${escapeHtml(row.source)}</b></td>
            <td>${escapeHtml(row.description) || '-'}</td>
            <td><b>${money(row.amount)}</b></td>
          </tr>
        `).join('')
      : '<tr><td colspan="4" class="empty">Belum ada penghasilan pada periode ini.</td></tr>';

    renderChart(days);
  }

  function renderChart(days) {
    if (!days.length) {
      els.chart.innerHTML = '<p class="empty">Belum ada data untuk dibuat grafik.</p>';
      return;
    }

    const max = Math.max(...days.map(([, group]) => group.total), 1);

    els.chart.innerHTML = `
      <div class="bars">
        ${days.map(([date, group]) => `
          <div class="bar-item" title="${escapeHtml(date)}: ${money(group.total)}">
            <span class="bar-value">${money(group.total)}</span>
            <div class="bar" style="height:${Math.max(6, (group.total / max) * 180)}px"></div>
            <small>${escapeHtml(date.slice(5))}</small>
          </div>
        `).join('')}
      </div>
    `;
  }

  function exportCsv() {
    if (!reportRows.length) {
      setMessage(els.reportMessage, 'Tidak ada data untuk diekspor. Tampilkan laporan terlebih dahulu.', 'error');
      return;
    }

    const headers = ['Tanggal', 'Sumber Penghasilan', 'Keterangan', 'Nominal'];
    const rows = reportRows.map((row) => [
      row.income_date,
      row.source,
      row.description,
      row.amount
    ]);

    const csv = '\ufeff' + [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-penghasilan-${els.monthFilter.value || 'semua'}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setMessage(els.reportMessage, 'Laporan CSV berhasil dibuat.', 'success');
  }

  function switchView(button) {
    document.querySelectorAll('.navtab').forEach((item) => {
      item.classList.toggle('active', item === button);
    });

    document.querySelectorAll('.view').forEach((view) => {
      view.hidden = view.id !== button.dataset.view;
    });

    els.nav.classList.remove('open');

    if (button.dataset.view === 'reportView') {
      loadReport();
    }
  }

  // Initial state.
  els.date.value = localDate;
  els.monthFilter.value = localDate.slice(0, 7);
  els.year.textContent = today.getFullYear();

  // Navigation.
  els.menuToggle.addEventListener('click', () => {
    const isOpen = els.nav.classList.toggle('open');
    els.menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.navtab').forEach((button) => {
    button.addEventListener('click', () => switchView(button));
  });

  // Form events.
  els.date.addEventListener('change', loadTodayEntries);
  els.amount.addEventListener('input', renderTodayTotal);
  els.form.addEventListener('submit', saveIncome);
  els.form.addEventListener('reset', resetForm);

  // Report events.
  els.applyFilter.addEventListener('click', loadReport);
  els.exportBtn.addEventListener('click', exportCsv);

  // Start.
  renderTodayTotal();
  renderTodayList();
  loadTodayEntries();
>>>>>>> 1f05571a4112efd9e26a11bdfbddf878522020a2
})();
