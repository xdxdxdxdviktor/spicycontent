// basic client logic: age gate, gallery render, upload, filter, affiliate redirect via server
document.addEventListener('DOMContentLoaded', () => {
  const ageGate = document.getElementById('ageGate');
  const app = document.getElementById('app');
  const confirmAge = document.getElementById('confirmAge');
  const denyAge = document.getElementById('denyAge');
  const yearEl = document.getElementById('year');
  yearEl.textContent = new Date().getFullYear();

  if(localStorage.getItem('spicy_age_confirmed') === '1'){
    ageGate.style.display = 'none';
    app.hidden = false;
  }
  confirmAge.addEventListener('click', () => {
    localStorage.setItem('spicy_age_confirmed','1');
    ageGate.style.display = 'none';
    app.hidden = false;
  });
  denyAge.addEventListener('click', () => {
    window.location.href = 'about:blank';
  });

  // sample content (in real use, fetch from API)
  const sample = [
    { id: '1', title:'Red Night', tag:'hot', img:'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1400&auto=format&fit=crop&s=example', desc:'Tease', affiliate:'https://yourdomain.com/aff/1' },
    { id: '2', title:'Lava Play', tag:'spicy', img:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=1400&auto=format&fit=crop&s=example2', desc:'Hot clip', affiliate:'https://yourdomain.com/aff/2' },
    { id: '3', title:'Feature', tag:'featured', img:'/assets/logo.png', desc:'Ukázka', affiliate:'https://yourdomain.com/aff/3' },
    { id: '4', title:'Midnight', tag:'new', img:'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1400&auto=format&fit=crop&s=example3', desc:'Late night set', affiliate:'https://yourdomain.com/aff/4' },
  ];

  const gallery = document.getElementById('gallery');
  const filter = document.getElementById('filter');
  const search = document.getElementById('search');

  function render(items){
    gallery.innerHTML = '';
    items.forEach(it => {
      const el = document.createElement('article'); el.className = 'card';
      el.innerHTML = `
        <div class="overlay"><a class="cta" data-id="${it.id}" href="/r/${encodeURIComponent(it.id)}" target="_blank" rel="noopener noreferrer">Otevřít <small>— Partner</small></a></div>
        <div class="tag">${it.tag}</div>
        <img class="thumb" src="${it.img}" alt="${it.title}">
        <div class="meta"><h4>${it.title}</h4><p>${it.desc}</p></div>
      `;
      gallery.appendChild(el);
    });
    // hook affiliate redirect clicks (server-side tracking)
    document.querySelectorAll('.cta').forEach(a=>{
      a.addEventListener('click', (e)=>{
        // default behavior: follow server redirect /r/:id
        // leave blank — server handles redirect to actual affiliate url
      });
    });
  }

  render(sample);

  filter.addEventListener('change', ()=>{
    const v = filter.value;
    const arr = sample.filter(x=> v==='all' ? true : x.tag===v );
    render(arr);
  });

  search.addEventListener('input', ()=>{
    const q = search.value.trim().toLowerCase();
    const arr = sample.filter(x=> x.title.toLowerCase().includes(q) || x.desc.toLowerCase().includes(q));
    render(arr);
  });

  // upload flow
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  uploadBtn.addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', async (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    const form = new FormData();
    form.append('file', f);
    // optional meta
    form.append('title', f.name);
    try {
      uploadBtn.textContent = 'Nahrávám...';
      const res = await fetch('/api/upload', { method:'POST', body: form });
      const j = await res.json();
      if(j.ok){
        alert('Nahráno — čeká na schválení.');
      } else {
        alert('Upload selhal: ' + (j.error||'unknown'));
      }
    } catch(err){
      console.error(err); alert('Chyba uploadu');
    } finally {
      uploadBtn.textContent = 'Nahrát';
      fileInput.value='';
    }
  });
});
