document.getElementById('go').onclick=async()=>{
 const q=document.getElementById('q').value;
 const r=await fetch('/api/sam?q='+encodeURIComponent(q));
 const t=await r.text();document.getElementById('out').textContent=t;}