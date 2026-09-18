(() => {
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
})();
